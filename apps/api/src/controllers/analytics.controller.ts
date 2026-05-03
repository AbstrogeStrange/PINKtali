import { Request, Response } from 'express';
import { prisma } from '@streamverse/db';

// Helper: compute date range from period param
const getPeriodStart = (period: string): Date => {
  const now = new Date();
  const days: Record<string, number> = { '7': 7, '28': 28, '90': 90, '365': 365 };
  if (period === 'lifetime') return new Date('2020-01-01');
  const d = days[period] ?? 28;
  now.setDate(now.getDate() - d);
  return now;
};

// Generate mock time-series data
const mockTimeseries = (days: number, baseViews = 1200, label = 'views') =>
  Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      date: d.toISOString().slice(0, 10),
      [label]: Math.floor(baseViews * (0.7 + Math.random() * 0.6))
    };
  });

// ── 11.1 Overview ─────────────────────────────────────────────────────────────
export const getOverview = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { period = '28' } = req.query;
  const since = getPeriodStart(String(period));

  const channel = await prisma.channel.findUnique({ where: { userId: req.user.id } });
  if (!channel) return res.status(404).json({ success: false, error: 'Channel not found' });

  const [viewCount, watchData, subsGained, subsLost] = await Promise.all([
    prisma.view.count({
      where: { video: { channelId: channel.id }, createdAt: { gte: since } }
    }),
    prisma.view.aggregate({
      where: { video: { channelId: channel.id }, createdAt: { gte: since } },
      _sum: { watchedSeconds: true }
    }),
    prisma.subscriptionEvent.count({
      where: { channelId: channel.id, type: 'SUBSCRIBED', createdAt: { gte: since } }
    }),
    prisma.subscriptionEvent.count({
      where: { channelId: channel.id, type: 'UNSUBSCRIBED', createdAt: { gte: since } }
    }),
  ]);

  const watchTimeHours = Math.floor((watchData._sum.watchedSeconds ?? 0) / 3600);

  res.status(200).json({
    success: true,
    data: {
      totalViews: viewCount,
      watchTimeHours,
      subscribersGained: subsGained,
      subscribersLost: subsLost,
      netSubscribers: subsGained - subsLost,
      estimatedRevenue: parseFloat((viewCount * 0.003).toFixed(2)) // ~$3 CPM
    }
  });
};

// ── Timeseries ────────────────────────────────────────────────────────────────
export const getViewsTimeseries = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { period = '28' } = req.query;
  const days = period === 'lifetime' ? 365 : Number(period);
  res.status(200).json({ success: true, data: mockTimeseries(days, 1400, 'views') });
};

export const getWatchTimeTimeseries = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { period = '28' } = req.query;
  const days = period === 'lifetime' ? 365 : Number(period);
  res.status(200).json({ success: true, data: mockTimeseries(days, 85, 'watchTimeHours') });
};

// ── Top Videos ────────────────────────────────────────────────────────────────
export const getTopVideos = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { period = '28', limit = 10 } = req.query;
  const since = getPeriodStart(String(period));

  const channel = await prisma.channel.findUnique({ where: { userId: req.user.id } });
  if (!channel) return res.status(404).json({ success: false, error: 'Channel not found' });

  const videos = await prisma.video.findMany({
    where: { channelId: channel.id },
    include: { _count: { select: { views: true, comments: true } } },
    orderBy: { viewCount: 'desc' },
    take: Number(limit)
  });

  const data = videos.map(v => ({
    id: v.id, title: v.title, thumbnailUrl: v.thumbnailUrl,
    views: v._count.views,
    watchTimeHours: Math.floor(Math.random() * 500),
    avgViewDuration: `${Math.floor(Math.random() * 8)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    impressionCTR: `${(Math.random() * 8 + 2).toFixed(1)}%`,
    // Sparkline: 7 daily view points
    sparkline: Array.from({ length: 7 }, () => Math.floor(Math.random() * 500))
  }));

  res.status(200).json({ success: true, data: { items: data } });
};

// ── Traffic Sources ───────────────────────────────────────────────────────────
export const getTrafficSources = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  res.status(200).json({
    success: true,
    data: {
      sources: [
        { source: 'Browse features',    views: 34200, percentage: 38 },
        { source: 'YouTube Search',     views: 22100, percentage: 25 },
        { source: 'Suggested videos',   views: 18400, percentage: 20 },
        { source: 'External',           views: 8900,  percentage: 10 },
        { source: 'Direct / Unknown',   views: 5300,  percentage: 6  },
        { source: 'Notifications',      views: 900,   percentage: 1  },
      ]
    }
  });
};

// ── Audience Demographics ─────────────────────────────────────────────────────
export const getAudienceDemographics = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  res.status(200).json({
    success: true,
    data: {
      ageRanges: [
        { range: '13-17', percentage: 8 },  { range: '18-24', percentage: 32 },
        { range: '25-34', percentage: 35 }, { range: '35-44', percentage: 16 },
        { range: '45-54', percentage: 6 },  { range: '55+',   percentage: 3 }
      ],
      genders: [{ gender: 'Male', percentage: 68 }, { gender: 'Female', percentage: 28 }, { gender: 'Other', percentage: 4 }],
      countries: [
        { country: 'US', views: 28400, isoCode: 'USA' },
        { country: 'IN', views: 12000, isoCode: 'IND' },
        { country: 'GB', views: 8200,  isoCode: 'GBR' },
        { country: 'CA', views: 5100,  isoCode: 'CAN' },
        { country: 'AU', views: 4200,  isoCode: 'AUS' },
      ],
      devices: [
        { device: 'Mobile',  percentage: 58 },
        { device: 'Desktop', percentage: 32 },
        { device: 'Tablet',  percentage: 6  },
        { device: 'TV',      percentage: 4  }
      ]
    }
  });
};

// ── Realtime ──────────────────────────────────────────────────────────────────
export const getRealtime = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const viewsPerHour = Array.from({ length: 48 }, (_, i) => {
    const h = new Date();
    h.setHours(h.getHours() - (47 - i));
    return {
      hour: `${String(h.getHours()).padStart(2, '0')}:00`,
      views: Math.floor(40 + Math.random() * 200)
    };
  });

  res.status(200).json({
    success: true,
    data: {
      activeViewers: Math.floor(Math.random() * 80 + 10),
      viewsPerHour
    }
  });
};

// ── Per-Video Analytics ───────────────────────────────────────────────────────
export const getVideoAnalytics = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;

  const video = await prisma.video.findUnique({
    where: { id },
    include: { channel: true, _count: { select: { views: true, comments: true, likes: true } } }
  });
  if (!video || video.channel.userId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  // Audience retention curve: 101 data points (0% to 100% of video)
  const retentionCurve = Array.from({ length: 101 }, (_, i) => {
    const base = 100 - i * 0.5;
    return { position: i, percentage: Math.max(5, base + (Math.random() - 0.5) * 12) };
  });
  retentionCurve[0].percentage = 100;

  res.status(200).json({
    success: true,
    data: {
      views: video._count.views,
      watchTimeHours: Math.floor(Math.random() * 2000),
      avgViewDuration: '4:32',
      avgViewPercentage: 62,
      impressions: Math.floor(video._count.views * 8.4),
      impressionCTR: 7.2,
      likes: video._count.likes,
      comments: video._count.comments,
      audienceRetentionCurve: retentionCurve
    }
  });
};
