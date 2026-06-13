const express = require('express');
const { nanoid } = require('nanoid');
const prisma = require('../config/prisma');
const authenticate = require('../middleware/auth');
const { analyzeUrl, extractDomain } = require('../utils/urlAnalyzer');
const { generateSmartSummary } = require('../utils/smartSummary');

const router = express.Router();

// All URL routes require authentication
router.use(authenticate);

// URL validation helper
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// Short code validation
const isValidShortCode = (code) => /^[a-zA-Z0-9_-]{3,30}$/.test(code);

// POST /api/urls - Create a short URL
router.post('/', async (req, res) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;

    // Validate original URL
    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required.' });
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ error: 'Please provide a valid URL (http:// or https://).' });
    }

    // Determine short code
    let shortCode;

    if (customAlias) {
      if (!isValidShortCode(customAlias)) {
        return res.status(400).json({
          error: 'Custom alias must be 3-30 characters and contain only letters, numbers, hyphens, and underscores.',
        });
      }

      // Check if alias is already taken
      const existing = await prisma.url.findUnique({ where: { shortCode: customAlias } });
      if (existing) {
        return res.status(409).json({ error: 'This custom alias is already taken. Please choose another.' });
      }

      shortCode = customAlias;
    } else {
      // Generate unique short code using nanoid
      shortCode = nanoid(8);

      // Ensure uniqueness (extremely unlikely collision but safe)
      let exists = await prisma.url.findUnique({ where: { shortCode } });
      while (exists) {
        shortCode = nanoid(8);
        exists = await prisma.url.findUnique({ where: { shortCode } });
      }
    }

    // Validate expiry date if provided
    let expiryDate = null;
    if (expiresAt) {
      expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime())) {
        return res.status(400).json({ error: 'Invalid expiry date format.' });
      }
      if (expiryDate <= new Date()) {
        return res.status(400).json({ error: 'Expiry date must be in the future.' });
      }
    }

    // Analyze URL safety
    const safetyAnalysis = analyzeUrl(originalUrl);
    const domain = extractDomain(originalUrl);

    // Create the URL entry
    const url = await prisma.url.create({
      data: {
        originalUrl,
        shortCode,
        customAlias: customAlias || null,
        expiresAt: expiryDate,
        userId: req.user.id,
        safetyScore: safetyAnalysis.score,
        safetyStatus: safetyAnalysis.status,
        domain,
      },
    });

    const shortUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/${shortCode}`;

    res.status(201).json({
      message: 'Short URL created successfully.',
      url: {
        ...url,
        shortUrl,
      },
    });
  } catch (error) {
    console.error('Create URL error:', error);
    res.status(500).json({ error: 'Failed to create short URL. Please try again.' });
  }
});

// GET /api/urls - List user's URLs
router.get('/', async (req, res) => {
  try {
    const { search, sort = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;

    const where = { userId: req.user.id };

    // Search filter
    if (search) {
      where.OR = [
        { originalUrl: { contains: search, mode: 'insensitive' } },
        { shortCode: { contains: search, mode: 'insensitive' } },
        { customAlias: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [urls, total] = await Promise.all([
      prisma.url.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: parseInt(limit),
        include: {
          _count: { select: { visits: true } },
        },
      }),
      prisma.url.count({ where }),
    ]);

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    const urlsWithShortUrl = urls.map((url) => ({
      ...url,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      visitCount: url._count.visits,
    }));

    res.json({
      urls: urlsWithShortUrl,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('List URLs error:', error);
    res.status(500).json({ error: 'Failed to fetch URLs.' });
  }
});

// GET /api/urls/:id - Get single URL details
router.get('/:id', async (req, res) => {
  try {
    const url = await prisma.url.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        _count: { select: { visits: true } },
      },
    });

    if (!url) {
      return res.status(404).json({ error: 'URL not found.' });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    res.json({
      url: {
        ...url,
        shortUrl: `${baseUrl}/${url.shortCode}`,
        visitCount: url._count.visits,
      },
    });
  } catch (error) {
    console.error('Get URL error:', error);
    res.status(500).json({ error: 'Failed to fetch URL details.' });
  }
});

// PUT /api/urls/:id - Update URL
router.put('/:id', async (req, res) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;

    // Check ownership
    const existingUrl = await prisma.url.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existingUrl) {
      return res.status(404).json({ error: 'URL not found.' });
    }

    const updateData = {};

    // Validate and update original URL
    if (originalUrl) {
      if (!isValidUrl(originalUrl)) {
        return res.status(400).json({ error: 'Please provide a valid URL.' });
      }
      updateData.originalUrl = originalUrl;

      // Re-analyze safety for new URL
      const safetyAnalysis = analyzeUrl(originalUrl);
      updateData.safetyScore = safetyAnalysis.score;
      updateData.safetyStatus = safetyAnalysis.status;
      updateData.domain = extractDomain(originalUrl);
    }

    // Validate and update custom alias
    if (customAlias !== undefined) {
      if (customAlias && customAlias !== existingUrl.shortCode) {
        if (!isValidShortCode(customAlias)) {
          return res.status(400).json({
            error: 'Custom alias must be 3-30 characters with only letters, numbers, hyphens, and underscores.',
          });
        }

        const aliasExists = await prisma.url.findFirst({
          where: { shortCode: customAlias, id: { not: req.params.id } },
        });

        if (aliasExists) {
          return res.status(409).json({ error: 'This custom alias is already taken.' });
        }

        updateData.shortCode = customAlias;
        updateData.customAlias = customAlias;
      }
    }

    // Update expiry
    if (expiresAt !== undefined) {
      if (expiresAt === null || expiresAt === '') {
        updateData.expiresAt = null;
      } else {
        const expiryDate = new Date(expiresAt);
        if (isNaN(expiryDate.getTime())) {
          return res.status(400).json({ error: 'Invalid expiry date format.' });
        }
        updateData.expiresAt = expiryDate;
      }
    }

    const updatedUrl = await prisma.url.update({
      where: { id: req.params.id },
      data: updateData,
    });

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    res.json({
      message: 'URL updated successfully.',
      url: {
        ...updatedUrl,
        shortUrl: `${baseUrl}/${updatedUrl.shortCode}`,
      },
    });
  } catch (error) {
    console.error('Update URL error:', error);
    res.status(500).json({ error: 'Failed to update URL.' });
  }
});

// DELETE /api/urls/:id - Delete URL
router.delete('/:id', async (req, res) => {
  try {
    const url = await prisma.url.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!url) {
      return res.status(404).json({ error: 'URL not found.' });
    }

    await prisma.url.delete({ where: { id: req.params.id } });

    res.json({ message: 'URL deleted successfully.' });
  } catch (error) {
    console.error('Delete URL error:', error);
    res.status(500).json({ error: 'Failed to delete URL.' });
  }
});

// GET /api/urls/:id/analytics - Get URL analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const url = await prisma.url.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        _count: { select: { visits: true } },
      },
    });

    if (!url) {
      return res.status(404).json({ error: 'URL not found.' });
    }

    // Get recent visits
    const recentVisits = await prisma.visit.findMany({
      where: { urlId: url.id },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    // Get daily click stats for last 30 days
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

    // Get browser stats
    const browserStats = await prisma.visit.groupBy({
      by: ['browser'],
      where: { urlId: url.id },
      _count: { browser: true },
      orderBy: { _count: { browser: 'desc' } },
      take: 10,
    });

    // Get device stats
    const deviceStats = await prisma.visit.groupBy({
      by: ['device'],
      where: { urlId: url.id },
      _count: { device: true },
      orderBy: { _count: { device: 'desc' } },
      take: 10,
    });

    // Get country stats
    const countryStats = await prisma.visit.groupBy({
      by: ['country'],
      where: { urlId: url.id },
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 10,
    });

    // Get city stats
    const cityStats = await prisma.visit.groupBy({
      by: ['city'],
      where: { urlId: url.id },
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 10,
    });

    // Last visited
    const lastVisit = recentVisits.length > 0 ? recentVisits[0].timestamp : null;

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    const formattedDailyClicks = dailyClicks.map((d) => ({
      date: d.date.toISOString().split('T')[0],
      clicks: d.clicks,
    }));

    // Generate smart summary insights
    const smartSummary = generateSmartSummary({
      url,
      dailyClicks: formattedDailyClicks,
      recentVisits,
      totalClicks: url._count.visits,
      lastVisited: lastVisit,
    });

    res.json({
      url: {
        ...url,
        shortUrl: `${baseUrl}/${url.shortCode}`,
        visitCount: url._count.visits,
      },
      analytics: {
        totalClicks: url._count.visits,
        lastVisited: lastVisit,
        recentVisits: recentVisits.map((v) => ({
          id: v.id,
          ip: v.ip,
          browser: v.browser,
          device: v.device,
          os: v.os,
          country: v.country,
          city: v.city,
          referer: v.referer,
          timestamp: v.timestamp,
        })),
        dailyClicks: formattedDailyClicks,
        browserStats: browserStats.map((b) => ({
          name: b.browser || 'Unknown',
          count: b._count.browser,
        })),
        deviceStats: deviceStats.map((d) => ({
          name: d.device || 'Unknown',
          count: d._count.device,
        })),
        countryStats: countryStats.map((c) => ({
          name: c.country || 'Unknown',
          count: c._count.country,
        })),
        cityStats: cityStats.map((c) => ({
          name: c.city || 'Unknown',
          count: c._count.city,
        })),
        smartSummary,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

// POST /api/urls/bulk-create - Bulk URL creation from CSV data
router.post('/bulk-create', async (req, res) => {
  try {
    const { urls: urlRows } = req.body;

    if (!Array.isArray(urlRows) || urlRows.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of URLs to shorten.' });
    }

    if (urlRows.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 URLs per bulk upload.' });
    }

    const successList = [];
    const failedList = [];
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    
    // Pass 1: Parse, validate format, and assign preliminary short codes
    const pendingRows = [];
    const codesToCheck = new Set();
    
    for (let i = 0; i < urlRows.length; i++) {
      const row = urlRows[i];
      const rowIndex = i + 1;
      
      const { url: originalUrl, customAlias, expiryDate } = row;

      // Validate URL
      if (!originalUrl || !isValidUrl(originalUrl)) {
        failedList.push({ row: rowIndex, url: originalUrl || '', error: 'Invalid or missing URL' });
        continue;
      }

      // Validate Expiry
      let expiryDateParsed = null;
      if (expiryDate) {
        expiryDateParsed = new Date(expiryDate);
        if (isNaN(expiryDateParsed.getTime())) {
          failedList.push({ row: rowIndex, url: originalUrl, error: 'Invalid expiry date format' });
          continue;
        }
        if (expiryDateParsed <= new Date()) {
          failedList.push({ row: rowIndex, url: originalUrl, error: 'Expiry date must be in the future' });
          continue;
        }
      }

      // Validate Alias
      let shortCode;
      let isCustom = false;
      if (customAlias) {
        if (!isValidShortCode(customAlias)) {
          failedList.push({ row: rowIndex, url: originalUrl, error: `Invalid custom alias: "${customAlias}"` });
          continue;
        }
        shortCode = customAlias;
        isCustom = true;
      } else {
        shortCode = nanoid(8);
      }
      
      codesToCheck.add(shortCode);
      
      // Analyze safety
      const safetyAnalysis = analyzeUrl(originalUrl);
      const domain = extractDomain(originalUrl);

      pendingRows.push({
        row: rowIndex,
        originalUrl,
        shortCode,
        isCustom,
        customAlias: customAlias || null,
        expiresAt: expiryDateParsed,
        safetyScore: safetyAnalysis.score,
        safetyStatus: safetyAnalysis.status,
        domain
      });
    }

    // Pass 2: DB Batch Check
    const existingUrls = await prisma.url.findMany({
      where: { shortCode: { in: Array.from(codesToCheck) } },
      select: { shortCode: true }
    });
    
    const existingCodesDb = new Set(existingUrls.map(u => u.shortCode));
    const batchCodes = new Set();
    const validRowsData = [];
    
    for (const pending of pendingRows) {
      let finalShortCode = pending.shortCode;
      
      // Check collision with DB or within current batch
      if (existingCodesDb.has(finalShortCode) || batchCodes.has(finalShortCode)) {
        if (pending.isCustom) {
          failedList.push({ row: pending.row, url: pending.originalUrl, error: `Alias "${finalShortCode}" is already taken` });
          continue;
        } else {
          // Fallback for nanoid collision (rare)
          let exists = true;
          while (exists) {
            finalShortCode = nanoid(8);
            if (!batchCodes.has(finalShortCode)) {
              const dbExists = await prisma.url.findUnique({ where: { shortCode: finalShortCode } });
              if (!dbExists) exists = false;
            }
          }
        }
      }
      
      batchCodes.add(finalShortCode);
      
      validRowsData.push({
        originalUrl: pending.originalUrl,
        shortCode: finalShortCode,
        customAlias: pending.customAlias,
        expiresAt: pending.expiresAt,
        userId: req.user.id,
        safetyScore: pending.safetyScore,
        safetyStatus: pending.safetyStatus,
        domain: pending.domain
      });
      
      successList.push({
        row: pending.row,
        url: pending.originalUrl,
        shortUrl: `${baseUrl}/${finalShortCode}`,
        shortCode: finalShortCode,
        safetyScore: pending.safetyScore,
        safetyStatus: pending.safetyStatus,
      });
    }

    // Pass 3: Batch Insert
    if (validRowsData.length > 0) {
      await prisma.url.createMany({
        data: validRowsData
      });
    }

    res.status(201).json({
      message: `Bulk upload complete: ${successList.length} succeeded, ${failedList.length} failed.`,
      totalProcessed: urlRows.length,
      successCount: successList.length,
      failedCount: failedList.length,
      successList,
      failedList,
    });
  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({ error: 'Failed to process bulk upload.' });
  }
});

module.exports = router;
