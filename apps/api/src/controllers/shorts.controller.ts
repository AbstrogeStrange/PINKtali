import { Request, Response } from 'express';
import { prisma, VideoStatus, VideoType } from '@streamverse/db';

export const getShortsFeed = async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;
  const take = Number(limit);

  // Subquery optimizations are mock-simulated via Prisma OR operations.
  // In a high-traffic production env, this would use a raw SQL `LEFT JOIN Views v ON v.videoId = Video.id WHERE v.id IS NULL`.
  
  let shorts;
  if (req.user) {
    // 40% from subs, 60% random. For simplicity in Prisma, we do a combined fetch and exclude watched.
    const subs = await prisma.subscription.findMany({
      where: { subscriberId: req.user.id },
      select: { channelId: true }
    });
    const subChannelIds = subs.map(s => s.channelId);

    shorts = await prisma.video.findMany({
      where: {
        type: VideoType.SHORT,
        status: VideoStatus.LIVE,
        views: { none: { userId: req.user.id } } // Exclusion filter
      },
      include: { channel: true },
      take: take + 5, // fetch extra for prefetch
      orderBy: { publishedAt: 'desc' } // Mixing in Prisma is rigid, we'd do application-level shuffling
    });
  } else {
    shorts = await prisma.video.findMany({
      where: { type: VideoType.SHORT, status: VideoStatus.LIVE },
      include: { channel: true },
      take: take + 5,
      orderBy: { publishedAt: 'desc' }
    });
  }

  // Shuffle blend
  shorts.sort(() => Math.random() - 0.5);

  const items = shorts.slice(0, take);
  const prefetchNext = shorts.slice(take);

  res.status(200).json({ success: true, data: { items, prefetchNext } });
};

export const searchMusic = async (req: Request, res: Response) => {
  const { query } = req.query;
  // Mock music search for Creator
  const results = [
    { id: 'm1', title: 'Viral Bounce', artist: 'BeatMaker', duration: 30, previewUrl: 'https://mock/m1.mp3' },
    { id: 'm2', title: 'LoFi Chill', artist: 'LoungeMaster', duration: 30, previewUrl: 'https://mock/m2.mp3' },
    { id: 'm3', title: 'Epic Trailer', artist: 'Hans Mock', duration: 30, previewUrl: 'https://mock/m3.mp3' },
  ];
  res.status(200).json({ success: true, data: { items: results } });
};
