import { Router } from 'express';
import express from 'express';
import {
  checkEligibility, enableMonetization,
  stripeConnectOnboard, getRevenueHistory,
  createMembershipTier, getMembershipTiers,
  updateMembershipTier, deactivateMembershipTier,
  subscribeMembership, cancelMembership,
  createSuperThanks, stripeWebhook, sseConnect
} from '../../controllers/monetization.controller';
import { authenticate, optionalAuth } from '../../middleware/auth';

const router = Router();

// Eligibility & enable
router.get('/eligibility', authenticate, checkEligibility);
router.post('/enable', authenticate, enableMonetization);

// Stripe Connect
router.post('/stripe/connect-onboard', authenticate, stripeConnectOnboard);
router.get('/revenue', authenticate, getRevenueHistory);

// Membership tiers
router.post('/membership-tiers', authenticate, createMembershipTier);
router.get('/channels/:handle/membership-tiers', getMembershipTiers);
router.patch('/membership-tiers/:id', authenticate, updateMembershipTier);
router.delete('/membership-tiers/:id', authenticate, deactivateMembershipTier);

// Memberships
router.post('/memberships', authenticate, subscribeMembership);
router.delete('/memberships/:id', authenticate, cancelMembership);

// Super Thanks
router.post('/super-thanks', authenticate, createSuperThanks);

// SSE (real-time notifications for creator)
router.get('/sse/:channelId', authenticate, sseConnect);

// Stripe Webhooks — raw body required
router.post(
  '/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

export default router;
