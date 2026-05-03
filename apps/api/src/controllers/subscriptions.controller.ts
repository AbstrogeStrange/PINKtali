import { Request, Response } from 'express';
import { prisma, VideoStatus, VideoType, NotifLevel } from '@streamverse/db';
import { redisClient } from '../utils/redis';

export const subscribe = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { channelId } = req.params;

  if (req.user.channel?.id === channelId) {
    return res.status(400).json({ success: false, error: 'Cannot subscribe to yourself' });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.subscription.findUnique({
        where: { subscriberId_channelId: { subscriberId: req.user!.id, channelId } }
      });

      if (!existing) {
        await tx.subscription.create({
          data: { subscriberId: req.user!.id, channelId }
        });

        await tx.channel.update({
          where: { id: channelId },
          data: { subscriberCount: { increment: 1 } }
        });
      }
    });

    // Invalidate mock redis
    await redisClient.clear(`channel:${channelId}:subs`);

    res.status(200).json({ success: true, data: { message: 'Subscribed' } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const unsubscribe = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { channelId } = req.params;

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.subscription.findUnique({
        where: { subscriberId_channelId: { subscriberId: req.user!.id, channelId } }
      });

      if (existing) {
        await tx.subscription.delete({
          where: { subscriberId_channelId: { subscriberId: req.user!.id, channelId } }
        });

        await tx.channel.update({
          where: { id: channelId },
          data: { subscriberCount: { decrement: 1 } }
        });
      }
    });

    await redisClient.clear(`channel:${channelId}:subs`);
    res.status(200).json({ success: true, data: { message: 'Unsubscribed' } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateNotificationLevel = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { channelId } = req.params;
  const { level } = req.body;

  if (!Object.values(NotifLevel).includes(level)) {
    return res.status(400).json({ success: false, error: 'Invalid level' });
  }

  const updated = await prisma.subscription.update({
    where: { subscriberId_channelId: { subscriberId: req.user.id, channelId } },
    data: { notificationLevel: level as NotifLevel }
  });

  res.status(200).json({ success: true, data: updated });
};

export const getFeed = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { limit = 20, cursor } = req.query;

  const take = Number(limit);

  const query: any = {
    where: {
      status: VideoStatus.LIVE,
      channel: {
        subscribers: { some: { subscriberId: req.user.id } }
      }
    },
    orderBy: { publishedAt: 'desc' },
    take: take + 1, // Fetch one extra to know if there's a next page
    include: { channel: true }
  };

  if (cursor) {
    query.cursor = { id: cursor as string };
    query.skip = 1; // Skip the cursor itself
  }

  const videos = await prisma.video.findMany(query);
  
  let nextCursor: typeof cursor | undefined = undefined;
  if (videos.length > take) {
    const nextItem = videos.pop();
    nextCursor = nextItem!.id;
  }

  res.status(200).json({ success: true, data: { items: videos, nextCursor } });
};
