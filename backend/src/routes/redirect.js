const express = require('express');
const UAParser = require('ua-parser-js');
const prisma = require('../config/prisma');

const router = express.Router();

// GET /:shortCode - Redirect to original URL & track visit
router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find the URL
    const url = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url) {
      return res.status(404).json({
        error: 'Short URL not found.',
        message: 'The requested short URL does not exist or has been removed.',
      });
    }

    // Check if expired
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      return res.status(410).json({
        error: 'This short URL has expired.',
        message: 'The link you are trying to access has passed its expiry date.',
      });
    }

    // Parse user agent
    const parser = new UAParser(req.headers['user-agent']);
    const browserInfo = parser.getBrowser();
    const deviceInfo = parser.getDevice();
    const osInfo = parser.getOS();

    // Get client IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               req.connection?.remoteAddress ||
               req.socket?.remoteAddress ||
               'unknown';

    // Redirect to original URL IMMEDIATELY
    res.redirect(302, url.originalUrl);

    // Track the visit and increment clicks asynchronously (fire and forget)
    Promise.all([
      prisma.visit.create({
        data: {
          urlId: url.id,
          ip,
          userAgent: req.headers['user-agent'] || null,
          browser: browserInfo.name ? `${browserInfo.name} ${browserInfo.version || ''}`.trim() : null,
          device: deviceInfo.type || 'desktop',
          os: osInfo.name ? `${osInfo.name} ${osInfo.version || ''}`.trim() : null,
          referer: req.headers['referer'] || req.headers['referrer'] || null,
        },
      }),
      prisma.url.update({
        where: { id: url.id },
        data: { clicks: { increment: 1 } },
      }),
    ]).catch(err => {
      console.error('Async tracking error:', err);
    });
  } catch (error) {
    console.error('Redirect error:', error);
    return res.status(500).json({ error: 'An error occurred while processing the redirect.' });
  }
});

module.exports = router;
