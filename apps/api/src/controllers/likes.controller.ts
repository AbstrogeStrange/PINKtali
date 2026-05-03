import { Request, Response } from 'express';
import { prisma } from '@streamverse/db';
import { redisClient } from '../utils/redis';

export const likeTarget = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { targetType, targetId, value } = req.body; // value: 1 or -1

  if (!['VIDEO', 'COMMENT', 'POST'].includes(targetType)) {
    return res.status(400).json({ success: false, error: 'Invalid target type' });
  }

  // 1. Get current like state to calculate delta
  const existing = await prisma.like.findUnique({
    where: {
      userId_targetType_targetId: {
        userId: req.user.id,
        targetType,
        targetId
      }
    }
  });

  let delta = 0;
  if (!existing && value === 1) delta = 1;
  else if (!existing && value === -1) delta = -1; // Note: Platform tracks total likes typically, but we'll increment a standard counter. For dislikes, we might track separately. Let's assume we maintain one `likeCount` and one `dislikeCount`.
  
  // Upsert
  await prisma.like.upsert({
    where: {
      userId_targetType_targetId: {
        userId: req.user.id,
        targetType,
        targetId
      }
    },
    update: { value },
    create: { userId: req.user.id, targetType, targetId, value }
  });

  // Redis buffering logic
  // Format: likes:{targetType}:{targetId}:{valueType} -> increment
  const valueType = value === 1 ? 'likes' : 'dislikes';
  const redisKey = `counters:${targetType.toLowerCase()}:${targetId}:${valueType}`;
  
  // Calculate specific delta if user switched from like to dislike
  let actualDelta = 1;
  if (existing) {
    if (existing.value === value) {
      actualDelta = 0; // No change
    } else {
      actualDelta = 1; // Increment new, need to decrement old
      const oldType = existing.value === 1 ? 'likes' : 'dislikes';
      // Mock redis decrement
      console.log(`[Redis] Decrementing counters:${targetType.toLowerCase()}:${targetId}:${oldType}`);
    }
  }

  if (actualDelta > 0) {
     console.log(`[Redis] Incrementing ${redisKey}`);
     // await redisClient.incr(redisKey);
  }

  res.status(200).json({ success: true });
};

export const removeLike = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { targetType, targetId } = req.params;

  const existing = await prisma.like.findUnique({
    where: {
      userId_targetType_targetId: {
        userId: req.user.id,
        targetType: targetType.toUpperCase() as any,
        targetId
      }
    }
  });

  if (existing) {
    await prisma.like.delete({
      where: {
        userId_targetType_targetId: {
          userId: req.user.id,
          targetType: targetType.toUpperCase() as any,
          targetId
        }
      }
    });

    const oldType = existing.value === 1 ? 'likes' : 'dislikes';
    const redisKey = `counters:${targetType.toLowerCase()}:${targetId}:${oldType}`;
    console.log(`[Redis] Decrementing ${redisKey}`);
  }

  res.status(200).json({ success: true });
};

export const getLikeStatus = async (req: Request, res: Response) => {
  const { targetType, targetId } = req.params;

  let userLike = null;
  if (req.user) {
    const existing = await prisma.like.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: req.user.id,
          targetType: targetType.toUpperCase() as any,
          targetId
        }
      }
    });
    userLike = existing ? existing.value : null;
  }

  // Fetch db count
  // In a real env, we merge DB count + Redis buffer count
  let likeCount = 0;
  if (targetType.toUpperCase() === 'VIDEO') {
    const v = await prisma.video.findUnique({ where: { id: targetId }, select: { likeCount: true } });
    likeCount = v?.likeCount || 0;
  }

  res.status(200).json({ success: true, data: { userLike, likeCount } });
};
