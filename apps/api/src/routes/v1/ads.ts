import { Router } from 'express';
import {
  requestAd, trackAdEvent,
  createCampaign, listCampaigns, getCampaign,
  updateCampaign, pauseCampaign, resumeCampaign, getCampaignReport
} from '../../controllers/ads.controller';
import { authenticate, optionalAuth } from '../../middleware/auth';

const router = Router();

// Ad serving
router.post('/request', optionalAuth, requestAd);
router.post('/events', optionalAuth, trackAdEvent);

// Campaign management
router.post('/campaigns', authenticate, createCampaign);
router.get('/campaigns', authenticate, listCampaigns);
router.get('/campaigns/:id', authenticate, getCampaign);
router.patch('/campaigns/:id', authenticate, updateCampaign);
router.post('/campaigns/:id/pause', authenticate, pauseCampaign);
router.post('/campaigns/:id/resume', authenticate, resumeCampaign);
router.get('/campaigns/:id/report', authenticate, getCampaignReport);

export default router;
