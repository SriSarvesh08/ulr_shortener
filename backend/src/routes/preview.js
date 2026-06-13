const express = require('express');
const { analyzeUrl } = require('../utils/urlAnalyzer');

const router = express.Router();

// POST /api/preview - Analyze a URL before shortening (no auth required)
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required.' });
    }

    // Validate URL format
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return res.status(400).json({ error: 'URL must use http:// or https://' });
      }
    } catch {
      return res.status(400).json({ error: 'Invalid URL format.' });
    }

    // Analyze the URL
    const analysis = analyzeUrl(url);

    res.json({
      url,
      domain: analysis.domain,
      safetyScore: analysis.score,
      safetyStatus: analysis.status,
      risks: analysis.risks,
      totalRisks: analysis.risks.length,
    });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: 'Failed to analyze URL.' });
  }
});

module.exports = router;
