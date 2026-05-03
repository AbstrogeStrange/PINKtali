import { Request, Response } from 'express';
import { prisma, VideoStatus, Visibility } from '@streamverse/db';
import { searchService } from '../services/search.service';

// Redis mock helper — replace with real client in production
const feedCache = new Map<string, { data: any; exp: number }>();
const cache = {
  get: (key: string) => {
    const entry = feedCache.get(key);
    if (!entry || entry.exp < Date.now()) return null;
    return entry.data;
  },
  set: (key: string, data: any, ttlSeconds: number) => {
    feedCache.set(key, { data, exp: Date.now() + ttlSeconds * 1000 });
  }
};

// ---- Scoring helpers ----
const freshnessDecay = (publishedAt: Date) => {
  const ageHours = (Date.now() - publishedAt.getTime()) / 3_600_000;
  // Exponential decay: 1.0 at 0h, ~0.5 at 7 days (168h)
  return Math.exp(-ageHours / 240);
};

const scoreVideo = (video: any, subChannelIds: Set<string>) => {
  const likeRatio     = video.viewCount > 0 ? video.likeCount / video.viewCount : 0;
  const avgWatch      = video.avgWatchPercent ?? 0.3;
  const viewVelocity  = video.viewsLast24h ?? 0;
  const velScore      = Math.log1p(viewVelocity) / 15; // normalise
  const subBoost      = subChannelIds.has(video.channelId) ? 1 : 0;
  const decay         = freshnessDecay(new Date(video.publishedAt));

  return (likeRatio * 0.3)
       + (avgWatch  * 0.25)
       + (velScore  * 0.2)
       + (subBoost  * 0.15)
       + (decay     * 0.1);
};

// ---- Home Feed ----
export const getHomeFeed = async (req: Request, res: Response) => {
  const { after, limit = 20 } = req.query;
  const take = Number(limit);

  // Anon users get trending
  if (!req.user) {
    const trending = cache.get('trending:global:LONG_FORM');
    if (trending) return res.status(200).json({ success: true, data: trending });

    const videos = await prisma.video.findMany({
      where: { status: VideoStatus.LIVE, visibility: Visibility.PUBLIC },
      include: { channel: true },
      orderBy: { viewCount: 'desc' },
      take,
    });
    return res.status(200).json({ success: true, data: { items: videos, nextCursor: null } });
  }

  const cacheKey = `feed:${req.user.id}:${after ?? 'start'}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.status(200).json({ success: true, data: cached });

  // Get sub channel IDs
  const subs = await prisma.subscription.findMany({
    where: { subscriberId: req.user.id },
    select: { channelId: true }
  });
  const subChannelIds = new Set(subs.map(s => s.channelId));

  // Watched video ids (exclude >80% watch)
  const watched = await prisma.view.findMany({
    where: { userId: req.user.id, watchPercent: { gte: 80 } },
    select: { videoId: true }
  });
  const watchedIds = new Set(watched.map(w => w.videoId));

  // Fetch 200 candidates
  let candidates: any[] = [];
  try {
    candidates = await searchService.searchVideos('', 200, 0);
    if (!candidates.length) throw new Error('ES empty');
  } catch {
    // Fallback: Prisma
    candidates = await prisma.video.findMany({
      where: {
        status: VideoStatus.LIVE,
        visibility: Visibility.PUBLIC,
        id: { notIn: [...watchedIds] },
        channel: { userId: { not: req.user.id } }
      },
      include: { channel: true },
      take: 200,
      orderBy: { publishedAt: 'desc' }
    });
  }

  // Score
  const scored = candidates
    .filter(v => !watchedIds.has(v.id ?? v._id))
    .map(v => ({ video: v, score: scoreVideo(v, subChannelIds) }))
    .sort((a, b) => b.score - a.score);

  // Diversity filter: max 2 per channel
  const channelCount = new Map<string, number>();
  const diverse: typeof scored = [];
  for (const entry of scored) {
    const cid = entry.video.channelId;
    const count = channelCount.get(cid) ?? 0;
    if (count < 2) {
      diverse.push(entry);
      channelCount.set(cid, count + 1);
    }
    if (diverse.length >= take) break;
  }

  const items = diverse.map(d => d.video);
  const nextCursor = items.length === take ? items[items.length - 1].id : null;
  const result = { items, nextCursor };

  cache.set(cacheKey, result, 300); // TTL 5 min
  res.status(200).json({ success: true, data: result });
};

// ---- Trending ----
export const getTrending = async (req: Request, res: Response) => {
  const { country, category } = req.query;

  const cacheKey = `trending:${country ?? 'global'}:${category ?? 'all'}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.status(200).json({ success: true, data: cached });

  // Compute on the fly (in prod this is pre-computed by BullMQ every 15 min)
  const since = new Date(Date.now() - 24 * 3_600_000);

  const videos = await prisma.video.findMany({
    where: {
      status: VideoStatus.LIVE,
      visibility: Visibility.PUBLIC,
      publishedAt: { gte: since },
      ...(category ? { category: category as any } : {})
    },
    include: { channel: true, _count: { select: { comments: true } } },
    orderBy: { viewCount: 'desc' },
    take: 50
  });

  const scored = videos
    .map(v => ({
      video: v,
      score: (v.viewCount ?? 0) + (v.likeCount ?? 0) * 5 + (v._count.comments ?? 0) * 3
    }))
    .sort((a, b) => b.score - a.score);

  const result = { items: scored.map(s => s.video) };
  cache.set(cacheKey, result, 900); // TTL 15 min
  res.status(200).json({ success: true, data: result });
};
