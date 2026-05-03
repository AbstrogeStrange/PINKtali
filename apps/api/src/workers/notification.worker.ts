import { Worker, Job } from 'bullmq';
import { prisma, NotifLevel, NotifType } from '@streamverse/db';
import { logger } from '../utils/logger';

// In a real environment, you'd import Expo from 'expo-server-sdk' and webpush from 'web-push'
// import { Expo } from 'expo-server-sdk';
// import webpush from 'web-push';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

export const notificationWorker = new Worker('send-notifications', async (job: Job) => {
  const { videoId, channelId, videoTitle, channelName } = job.data;

  logger.info(`Processing notifications for video ${videoId} from channel ${channelId}`);

  // Fetch all active subscribers
  const subscribers = await prisma.subscription.findMany({
    where: { channelId, NOT: { notificationLevel: NotifLevel.NONE } },
    select: { subscriberId: true, notificationLevel: true }
  });

  const targetsToNotify: string[] = [];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  for (const sub of subscribers) {
    if (sub.notificationLevel === NotifLevel.ALL) {
      targetsToNotify.push(sub.subscriberId);
    } else if (sub.notificationLevel === NotifLevel.PERSONALISED) {
      // Check if user watched >= 3 videos from this channel in last 30 days
      const views = await prisma.view.count({
        where: {
          userId: sub.subscriberId,
          video: { channelId },
          createdAt: { gte: thirtyDaysAgo }
        }
      });
      if (views >= 3) {
        targetsToNotify.push(sub.subscriberId);
      }
    }
  }

  if (targetsToNotify.length === 0) {
    logger.info(`No users to notify for video ${videoId}`);
    return;
  }

  // Batch insert database notifications
  const notifRecords = targetsToNotify.map(userId => ({
    userId,
    type: NotifType.NEW_VIDEO,
    actorId: channelId, // Or channel.userId
    resourceType: 'VIDEO',
    resourceId: videoId,
    message: `${channelName} uploaded: ${videoTitle}`,
    isRead: false
  }));

  await prisma.notification.createMany({
    data: notifRecords,
    skipDuplicates: true,
  });

  // Expo Push API (Mock)
  logger.info(`[Expo Push] Sending push to ${targetsToNotify.length} devices...`);
  
  // Web Push API (Mock)
  logger.info(`[Web Push] Dispatching VAPID messages...`);

  return { notifiedCount: targetsToNotify.length };
}, {
  connection: { host: REDIS_HOST, port: REDIS_PORT }
});

notificationWorker.on('failed', (job, err) => {
  logger.error(`Notification job ${job?.id} failed: ${err.message}`);
});
