const express = require('express');
const prisma = require('../config/prisma');

const router = express.Router();

// GET /api/public/stats/overview - Aggregate platform stats (no auth)
router.get('/overview', async (req, res) => {
  try {
    const totalUrls = await prisma.url.count();
    const totalClicks = await prisma.visit.count();

    const now = new Date();
    const activeLinks = await prisma.url.count({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
    });

    // Most clicked link (domain only for privacy)
    const mostClicked = await prisma.url.findFirst({
      orderBy: { clicks: 'desc' },
      select: {
        shortCode: true,
        domain: true,
        clicks: true,
      },
    });

    res.json({
      totalUrls,
      totalClicks,
      activeLinks,
      mostClicked: mostClicked
        ? {
            domain: mostClicked.domain || 'unknown',
            shortCode: mostClicked.shortCode,
            clicks: mostClicked.clicks,
          }
        : null,
    });
  } catch (error) {
    console.error('Overview stats error:', error);
    res.status(500).json({ error: 'Failed to fetch overview stats.' });
  }
});

// GET /api/public/stats/:shortCode - Public stats page (no auth required)
router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find URL by shortCode - DO NOT expose user data
    const url = await prisma.url.findUnique({
      where: { shortCode },
      select: {
        id: true,
        originalUrl: true,
        shortCode: true,
        customAlias: true,
        clicks: true,
        safetyScore: true,
        safetyStatus: true,
        domain: true,
        createdAt: true,
        expiresAt: true,
        // Explicitly NOT selecting userId or user relation
      },
    });

    if (!url) {
      return res.status(404).json({ error: 'Short URL not found.' });
    }

    // Check if expired
    const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date();

    // Get recent visits (limited, no IP for privacy)
    const recentVisits = await prisma.visit.findMany({
      where: { urlId: url.id },
      orderBy: { timestamp: 'desc' },
      take: 20,
      select: {
        id: true,
        browser: true,
        device: true,
        os: true,
        timestamp: true,
        // Explicitly NOT selecting ip, userAgent, referer for privacy
      },
    });

    // Daily click stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyClicks = await prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*)::int as clicks
      FROM visits
      WHERE url_id = ${url.id}
        AND timestamp >= ${thirtyDaysAgo}
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `;

    // Browser stats
    const browserStats = await prisma.visit.groupBy({
      by: ['browser'],
      where: { urlId: url.id },
      _count: { browser: true },
      orderBy: { _count: { browser: 'desc' } },
      take: 10,
    });

    // Device stats
    const deviceStats = await prisma.visit.groupBy({
      by: ['device'],
      where: { urlId: url.id },
      _count: { device: true },
      orderBy: { _count: { device: 'desc' } },
      take: 10,
    });

    // Last visited
    const lastVisit = recentVisits.length > 0 ? recentVisits[0].timestamp : null;

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    // Extract domain only (not full URL) for privacy
    let domainOnly = url.domain;
    if (!domainOnly) {
      try {
        domainOnly = new URL(url.originalUrl).hostname.replace(/^www\./, '');
      } catch {
        domainOnly = 'unknown';
      }
    }

    res.json({
      url: {
        shortCode: url.shortCode,
        shortUrl: `${baseUrl}/${url.shortCode}`,
        domain: domainOnly,
        // Show domain only, NOT the full original URL
        totalClicks: url.clicks,
        safetyScore: url.safetyScore,
        safetyStatus: url.safetyStatus,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
        isExpired,
      },
      analytics: {
        totalClicks: url.clicks,
        lastVisited: lastVisit,
        recentVisits: recentVisits.map((v) => ({
          id: v.id,
          browser: v.browser,
          device: v.device,
          os: v.os,
          timestamp: v.timestamp,
        })),
        dailyClicks: dailyClicks.map((d) => ({
          date: d.date.toISOString().split('T')[0],
          clicks: d.clicks,
        })),
        browserStats: browserStats.map((b) => ({
          name: b.browser || 'Unknown',
          count: b._count.browser,
        })),
        deviceStats: deviceStats.map((d) => ({
          name: d.device || 'Unknown',
          count: d._count.device,
        })),
      },
    });
  } catch (error) {
    console.error('Public stats error:', error);
    res.status(500).json({ error: 'Failed to fetch public stats.' });
  }
});

module.exports = router;
