import { Router } from 'express';
import {
  getOverview, getViewsTimeseries, getWatchTimeTimeseries,
  getTopVideos, getTrafficSources, getAudienceDemographics,
  getRealtime, getVideoAnalytics
} from '../../controllers/analytics.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/overview',               authenticate, getOverview);
router.get('/views-timeseries',       authenticate, getViewsTimeseries);
router.get('/watch-time-timeseries',  authenticate, getWatchTimeTimeseries);
router.get('/top-videos',             authenticate, getTopVideos);
router.get('/traffic-sources',        authenticate, getTrafficSources);
router.get('/audience-demographics',  authenticate, getAudienceDemographics);
router.get('/realtime',               authenticate, getRealtime);
router.get('/videos/:id',             authenticate, getVideoAnalytics);

export default router;
