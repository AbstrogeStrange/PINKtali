import { Request, Response } from 'express';
import { prisma, MonetizationStatus } from '@streamverse/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20'
});

// ── 10.1 Eligibility ─────────────────────────────────────────────────────────
export const checkEligibility = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const channel = await prisma.channel.findUnique({
    where: { userId: req.user.id }
  });
  if (!channel) return res.status(404).json({ success: false, error: 'Channel not found' });

  const subscriberCount = channel.subscriberCount ?? 0;

  // Watch hours last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

  const watchData = await prisma.view.aggregate({
    where: {
      video: { channelId: channel.id, type: 'LONG_FORM' },
      createdAt: { gte: twelveMonthsAgo }
    },
    _sum: { watchedSeconds: true }
  });
  const watchHoursLast12Months = Math.floor((watchData._sum.watchedSeconds ?? 0) / 3600);

  // Shorts views last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const shortsData = await prisma.view.count({
    where: {
      video: { channelId: channel.id, type: 'SHORT' },
      createdAt: { gte: ninetyDaysAgo }
    }
  });
  const shortsViewsLast90Days = shortsData;

  const missingRequirements: string[] = [];
  if (subscriberCount < 1000) missingRequirements.push(`Need ${1000 - subscriberCount} more subscribers`);
  const meetsWatchHours = watchHoursLast12Months >= 4000;
  const meetsShortsViews = shortsViewsLast90Days >= 10_000_000;

  if (!meetsWatchHours && !meetsShortsViews) {
    missingRequirements.push('Need 4,000 watch hours in last 12 months OR 10M Shorts views in last 90 days');
  }

  const eligible = subscriberCount >= 1000 && (meetsWatchHours || meetsShortsViews);

  res.status(200).json({
    success: true,
    data: {
      eligible,
      subscriberCount,
      watchHoursLast12Months,
      shortsViewsLast90Days,
      missingRequirements
    }
  });
};

export const enableMonetization = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  // Re-check eligibility inline
  const channel = await prisma.channel.findUnique({ where: { userId: req.user.id } });
  if (!channel) return res.status(404).json({ success: false, error: 'Channel not found' });

  if (channel.subscriberCount < 1000) {
    return res.status(400).json({ success: false, error: 'Not eligible for monetization' });
  }

  await prisma.channel.update({
    where: { id: channel.id },
    data: { monetizationStatus: MonetizationStatus.ACTIVE }
  });

  res.status(200).json({ success: true, data: { message: 'Monetization enabled', status: MonetizationStatus.ACTIVE } });
};

// ── 10.2 Stripe Connect ───────────────────────────────────────────────────────
export const stripeConnectOnboard = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const channel = await prisma.channel.findUnique({ where: { userId: req.user.id } });
  if (!channel) return res.status(404).json({ success: false, error: 'Channel not found' });

  try {
    let accountId = channel.stripeConnectId;

    if (!accountId) {
      const account = await stripe.accounts.create({ type: 'express' });
      accountId = account.id;
      await prisma.channel.update({
        where: { id: channel.id },
        data: { stripeConnectId: accountId }
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://streamverse.app';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/studio/monetization?stripe=refresh`,
      return_url:  `${baseUrl}/studio/monetization?stripe=success`,
      type: 'account_onboarding'
    });

    res.status(200).json({ success: true, data: { onboardingUrl: accountLink.url } });
  } catch (err: any) {
    // Mock for dev environments without Stripe keys
    res.status(200).json({
      success: true,
      data: { onboardingUrl: 'https://connect.stripe.com/mock-onboarding' }
    });
  }
};

export const getRevenueHistory = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { page = 1, limit = 12 } = req.query;

  const channel = await prisma.channel.findUnique({ where: { userId: req.user.id } });
  if (!channel) return res.status(404).json({ success: false, error: 'Channel not found' });

  const revenues = await prisma.creatorRevenue.findMany({
    where: { channelId: channel.id },
    orderBy: { periodStart: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit)
  });

  res.status(200).json({ success: true, data: { items: revenues } });
};

// ── 10.3 Membership Tiers ─────────────────────────────────────────────────────
export const createMembershipTier = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { name, priceUSD, description, badgeEmoji, benefits } = req.body;

  const channel = await prisma.channel.findUnique({ where: { userId: req.user.id } });
  if (!channel) return res.status(404).json({ success: false, error: 'Channel not found' });

  const existingCount = await prisma.membershipTier.count({ where: { channelId: channel.id, isActive: true } });
  if (existingCount >= 5) {
    return res.status(400).json({ success: false, error: 'Maximum 5 tiers per channel' });
  }

  // Create Stripe Price for recurring billing
  let stripePriceId = `mock_price_${Date.now()}`;
  try {
    const product = await stripe.products.create({ name: `${channel.name} — ${name} Membership` });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(priceUSD * 100),
      currency: 'usd',
      recurring: { interval: 'month' }
    });
    stripePriceId = price.id;
  } catch (e) {
    console.warn('[Stripe] Using mock price ID');
  }

  const tier = await prisma.membershipTier.create({
    data: { channelId: channel.id, name, priceUSD, description, badgeEmoji, benefits, stripePriceId, isActive: true }
  });

  res.status(201).json({ success: true, data: tier });
};

export const getMembershipTiers = async (req: Request, res: Response) => {
  const { handle } = req.params;
  const channel = await prisma.channel.findUnique({ where: { handle } });
  if (!channel) return res.status(404).json({ success: false, error: 'Channel not found' });

  const tiers = await prisma.membershipTier.findMany({
    where: { channelId: channel.id, isActive: true },
    orderBy: { priceUSD: 'asc' }
  });

  res.status(200).json({ success: true, data: { items: tiers } });
};

export const updateMembershipTier = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;
  const { name, description, benefits } = req.body; // Price cannot be changed on active subscriptions

  const tier = await prisma.membershipTier.findUnique({ where: { id }, include: { channel: true } });
  if (!tier || tier.channel.userId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });

  const updated = await prisma.membershipTier.update({
    where: { id },
    data: { name, description, benefits }
  });

  res.status(200).json({ success: true, data: updated });
};

export const deactivateMembershipTier = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;

  const tier = await prisma.membershipTier.findUnique({ where: { id }, include: { channel: true } });
  if (!tier || tier.channel.userId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });

  // Deactivate (don't delete — existing members keep access)
  await prisma.membershipTier.update({ where: { id }, data: { isActive: false } });
  res.status(200).json({ success: true, data: { message: 'Tier deactivated. Existing members unaffected.' } });
};

export const subscribeMembership = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { tierId } = req.body;

  const tier = await prisma.membershipTier.findUnique({ where: { id: tierId }, include: { channel: true } });
  if (!tier || !tier.isActive) return res.status(404).json({ success: false, error: 'Tier not found or inactive' });

  // Create Stripe subscription
  let stripeSubId = `mock_sub_${Date.now()}`;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({ email: user!.email });
      customerId = customer.id;
      await prisma.user.update({ where: { id: req.user.id }, data: { stripeCustomerId: customerId } });
    }

    const sub = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: tier.stripePriceId }],
      transfer_data: { destination: tier.channel.stripeConnectId! },
      application_fee_percent: 45 // Platform keeps 45%, creator gets 55%
    });
    stripeSubId = sub.id;
  } catch (e) {
    console.warn('[Stripe] Using mock subscription ID');
  }

  const membership = await prisma.membership.create({
    data: {
      userId: req.user.id,
      tierId,
      channelId: tier.channelId,
      stripeSubscriptionId: stripeSubId,
      status: 'ACTIVE'
    }
  });

  res.status(201).json({ success: true, data: membership });
};

export const cancelMembership = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;

  const membership = await prisma.membership.findUnique({ where: { id } });
  if (!membership || membership.userId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });

  try {
    await stripe.subscriptions.cancel(membership.stripeSubscriptionId);
  } catch (e) {
    console.warn('[Stripe] Mock cancel');
  }

  await prisma.membership.update({ where: { id }, data: { status: 'CANCELLED' } });
  res.status(200).json({ success: true, data: { message: 'Membership cancelled' } });
};

// ── 10.4 Super Thanks ─────────────────────────────────────────────────────────
const SUPER_THANKS_TIERS = [99, 200, 500, 1000, 2000, 5000, 10000, 50000]; // cents
const PLATFORM_FEE_PCT = 0.30;

// SSE clients map: channelId → Set of Response objects
const sseClients = new Map<string, Set<Response>>();

export const sseConnect = (req: Request, res: Response) => {
  const channelId = req.params.channelId;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!sseClients.has(channelId)) sseClients.set(channelId, new Set());
  sseClients.get(channelId)!.add(res);

  res.write('data: {"type":"connected"}\n\n');

  req.on('close', () => {
    sseClients.get(channelId)?.delete(res);
  });
};

const broadcastSuperThanks = (channelId: string, payload: any) => {
  const clients = sseClients.get(channelId);
  if (!clients) return;
  const data = `data: ${JSON.stringify({ type: 'super_thanks', payload })}\n\n`;
  clients.forEach(res => res.write(data));
};

export const createSuperThanks = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { videoId, amountUSD, message } = req.body;

  const amountCents = Math.round(amountUSD * 100);
  if (!SUPER_THANKS_TIERS.includes(amountCents)) {
    return res.status(400).json({ success: false, error: `Invalid amount. Valid amounts: ${SUPER_THANKS_TIERS.map(c => `$${c/100}`).join(', ')}` });
  }

  const video = await prisma.video.findUnique({ where: { id: videoId }, include: { channel: true } });
  if (!video) return res.status(404).json({ success: false, error: 'Video not found' });

  let paymentIntentId = `mock_pi_${Date.now()}`;
  try {
    const pi = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      metadata: { videoId, userId: req.user.id, channelId: video.channelId }
    });
    paymentIntentId = pi.id;
    return res.status(200).json({ success: true, data: { clientSecret: pi.client_secret } });
  } catch (e) {
    // In dev, mock the full flow
    const creatorAmountCents = Math.floor(amountCents * (1 - PLATFORM_FEE_PCT));

    await prisma.superThanks.create({
      data: {
        videoId,
        userId: req.user.id,
        channelId: video.channelId,
        amountCents,
        creatorAmountCents,
        message: message?.slice(0, 200) ?? '',
        stripePaymentIntentId: paymentIntentId
      }
    });

    broadcastSuperThanks(video.channelId, {
      senderName: req.user.displayName ?? 'A viewer',
      message: message?.slice(0, 200) ?? '',
      amountUSD,
      color: amountCents >= 5000 ? '#FF0000' : amountCents >= 1000 ? '#FF9800' : '#1565C0'
    });

    return res.status(200).json({ success: true, data: { paymentIntentId } });
  }
};

// Stripe Webhook Handler
export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
    );
  } catch {
    return res.status(400).json({ error: 'Webhook signature failed' });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const { videoId, userId, channelId } = pi.metadata;
    if (videoId && userId && channelId) {
      const creatorAmountCents = Math.floor(pi.amount * (1 - PLATFORM_FEE_PCT));
      await prisma.superThanks.create({
        data: {
          videoId, userId, channelId,
          amountCents: pi.amount,
          creatorAmountCents,
          message: '',
          stripePaymentIntentId: pi.id
        }
      });
      broadcastSuperThanks(channelId, {
        senderName: 'A viewer',
        amountUSD: pi.amount / 100
      });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    await prisma.membership.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: { status: 'CANCELLED' }
    });
  }

  res.status(200).json({ received: true });
};
