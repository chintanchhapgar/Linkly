import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get analytics for a specific link
router.get('/:linkId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const link = await prisma.link.findFirst({
      where: { id: req.params.linkId, userId: req.userId },
    });
    if (!link) return res.status(404).json({ error: 'Not found' });

    const events = await prisma.clickEvent.findMany({
      where: { linkId: link.id },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    // Aggregate by country
    const byCountry: Record<string, number> = {};
    const byDevice: Record<string, number> = {};
    const byBrowser: Record<string, number> = {};
    const byDay: Record<string, number> = {};

    events.forEach((e) => {
      if (e.country) byCountry[e.country] = (byCountry[e.country] || 0) + 1;
      if (e.device) byDevice[e.device] = (byDevice[e.device] || 0) + 1;
      if (e.browser) byBrowser[e.browser] = (byBrowser[e.browser] || 0) + 1;
      const day = e.createdAt.toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });

    res.json({
      totalClicks: link.clicks,
      byCountry,
      byDevice,
      byBrowser,
      byDay,
      recentEvents: events.slice(0, 50),
    });
  } catch (error) {
    next(error);
  }
});

// Dashboard summary
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const [totalLinks, totalClicks] = await Promise.all([
      prisma.link.count({ where: { userId: req.userId } }),
      prisma.link.aggregate({
        where: { userId: req.userId },
        _sum: { clicks: true },
      }),
    ]);

    const topLinks = await prisma.link.findMany({
      where: { userId: req.userId },
      orderBy: { clicks: 'desc' },
      take: 5,
    });

    res.json({
      totalLinks,
      totalClicks: totalClicks._sum.clicks || 0,
      topLinks,
    });
  } catch (error) {
    next(error);
  }
});

export default router;