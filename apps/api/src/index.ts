import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import http from 'http';

import { logger } from './utils/logger';
import { apiRateLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/v1/auth';
import videoRoutes from './routes/v1/videos';
import userRoutes from './routes/v1/users';
import channelRoutes from './routes/v1/channels';
import subscriptionRoutes from './routes/v1/subscriptions';
import shortsRoutes from './routes/v1/shorts';
import likesRoutes from './routes/v1/likes';
import commentsRoutes from './routes/v1/comments';
import playlistRoutes from './routes/v1/playlists';
import communityRoutes from './routes/v1/community';
import feedRoutes from './routes/v1/feed';
import searchRoutes from './routes/v1/search';
import adsRoutes from './routes/v1/ads';
import monetizationRoutes from './routes/v1/monetization';
import analyticsRoutes from './routes/v1/analytics';
import { initCronJobs } from './utils/cron';

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize Cron
initCronJobs();

// Middleware stack (order matters)
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(helmet());
app.use(compression());
app.use(apiRateLimiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/channels', channelRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/shorts', shortsRoutes);
app.use('/api/v1/likes', likesRoutes);
app.use('/api/v1/comments', commentsRoutes);
app.use('/api/v1/playlists', playlistRoutes);
app.use('/api/v1/community-posts', communityRoutes);
app.use('/api/v1/feed', feedRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/ads', adsRoutes);
app.use('/api/v1/monetization', monetizationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling must be last
app.use(errorHandler);

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`[Server] API running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('Closed out remaining connections.');
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
