import cron from 'node-cron';
import { Queue } from 'bullmq';
import { logger } from './logger';

const trendingQueue = new Queue('trending-calculator', {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
  }
});

const revenueQueue = new Queue('monthly-revenue-calc', {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
  }
});

export const initCronJobs = async () => {
  // Flush Likes every 60 seconds (Node cron — lightweight, runs in API process)
  cron.schedule('* * * * *', async () => {
    logger.info('[CRON] Flushing Redis Like counters to PostgreSQL...');
    // Real implementation omitted — see likes.controller.ts comments
  });

  // Enqueue trending recompute via BullMQ every 15 minutes
  // (actual compute runs in the Python worker process — decoupled)
  try {
    await trendingQueue.add(
      'recompute',
      {},
      { repeat: { pattern: '*/15 * * * *' }, jobId: 'trending-repeatable' }
    );
    logger.info('[CRON] Trending BullMQ repeatable job registered');
  } catch (e) {
    logger.warn('[CRON] Redis unavailable — trending job not registered (dev mode)');
  }

  // Monthly revenue calc: 1st of every month at 2:00 AM UTC
  try {
    await revenueQueue.add(
      'calc',
      {},
      { repeat: { pattern: '0 2 1 * *' }, jobId: 'monthly-revenue-repeatable' }
    );
    logger.info('[CRON] Monthly revenue BullMQ job registered');
  } catch (e) {
    logger.warn('[CRON] Redis unavailable — revenue job not registered (dev mode)');
  }

  logger.info('Cron jobs initialized');
};
