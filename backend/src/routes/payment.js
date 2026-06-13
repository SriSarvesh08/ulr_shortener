const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Lazy-initialize Razorpay so it doesn't crash if keys are missing
const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env');
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// POST /api/payment/create-order
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { plan } = req.body; // 'pro' | 'enterprise'

    const planPrices = {
      pro: { amount: 74900, currency: 'INR', description: 'LinkIQ Pro - Monthly' },        // ₹749/month
      enterprise: { amount: 249900, currency: 'INR', description: 'LinkIQ Enterprise - Monthly' }, // ₹2499/month
    };

    const selected = planPrices[plan];
    if (!selected) return res.status(400).json({ error: 'Invalid plan selected.' });

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: selected.amount,
      currency: selected.currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user.id,
        plan,
        description: selected.description,
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      description: selected.description,
    });
  } catch (err) {
    console.error('Create order error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to create payment order.' });
  }
});

// POST /api/payment/verify
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) return res.status(500).json({ error: 'Razorpay not configured.' });

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
    }

    // Payment is valid — in production you'd update the user's plan in the DB here
    res.json({ success: true, message: 'Payment verified. Plan upgraded successfully!' });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ error: 'Payment verification failed.' });
  }
});

module.exports = router;
