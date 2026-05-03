import { Request, Response } from 'express';
import { prisma, AdPlacement, AdFormat, AdStatus, CampaignStatus } from '@streamverse/db';

// In-memory frequency cap store (use Redis in production)
const freqCap = new Map<string, number>();

const getFreqCapKey = (userId: string, creativeId: string) => {
  const date = new Date().toISOString().slice(0, 10);
  return `adcap:${userId}:${creativeId}:${date}`;
};

// ── Ad Serving ──────────────────────────────────────────────────────────────
export const requestAd = async (req: Request, res: Response) => {
  const {
    videoId,
    placement,
    viewerCountry,
    viewerAge,
    viewerGender,
    deviceType
  } = req.body;

  const userId = req.user?.id ?? 'anon';

  // 1. Query active creatives matching placement
  const candidates = await prisma.adCreative.findMany({
    where: {
      status: AdStatus.ACTIVE,
      placement: placement as AdPlacement,
      campaign: {
        status: CampaignStatus.ACTIVE,
        budget: { gt: 0 }
      }
    },
    include: { campaign: true },
    take: 100
  });

  // 2. Filter by targeting
  const targeted = candidates.filter(c => {
    const t = c.campaign.targeting as any;
    if (!t) return true;
    if (t.countries?.length && !t.countries.includes(viewerCountry)) return false;
    if (viewerAge && t.ageMin && viewerAge < t.ageMin) return false;
    if (viewerAge && t.ageMax && viewerAge > t.ageMax) return false;
    if (viewerGender && t.genders?.length && !t.genders.includes(viewerGender)) return false;
    if (deviceType && t.devices?.length && !t.devices.includes(deviceType)) return false;
    return true;
  });

  // 3. Apply frequency cap (Redis key: adcap:{userId}:{creativeId}:{date})
  const cappedOut = new Set<string>();
  if (userId !== 'anon') {
    for (const c of targeted) {
      const key = getFreqCapKey(userId, c.id);
      const impressions = freqCap.get(key) ?? 0;
      const dailyCap = (c.campaign.targeting as any)?.frequencyCap ?? 5;
      if (impressions >= dailyCap) cappedOut.add(c.id);
    }
  }

  const eligible = targeted.filter(c => !cappedOut.has(c.id));

  // 4. Rank by bid (highest CPM wins)
  eligible.sort((a, b) => Number(b.campaign.bidAmount) - Number(a.campaign.bidAmount));

  const winner = eligible[0] ?? null;

  if (!winner) {
    return res.status(200).json({ success: true, data: { creative: null } });
  }

  // Generate impression ID
  const impressionId = `${winner.id}-${Date.now()}`;

  // Increment freq cap
  if (userId !== 'anon') {
    const key = getFreqCapKey(userId, winner.id);
    freqCap.set(key, (freqCap.get(key) ?? 0) + 1);
  }

  res.status(200).json({
    success: true,
    data: {
      creative: {
        id: winner.id,
        impressionId,
        assetUrl: winner.assetUrl,
        clickUrl: winner.clickUrl,
        ctaText: winner.ctaText,
        format: winner.format,
        durationSeconds: winner.durationSeconds,
        skipAfterSeconds: winner.skipAfterSeconds ?? 5,
        trackingPixels: winner.trackingPixels ?? []
      }
    }
  });
};

// ── Ad Events ───────────────────────────────────────────────────────────────
export const trackAdEvent = async (req: Request, res: Response) => {
  const { impressionId, event, secondsWatched } = req.body;

  // Upsert impression record
  await prisma.adImpression.upsert({
    where: { impressionId },
    update: {
      lastEvent: event,
      secondsWatched,
      updatedAt: new Date()
    },
    create: {
      impressionId,
      creativeId: impressionId.split('-')[0],
      userId: req.user?.id ?? null,
      lastEvent: event,
      secondsWatched: secondsWatched ?? 0
    }
  });

  // Budget deduction on completion/click (atomic in Redis, flushed hourly)
  if (['COMPLETE', 'CLICK'].includes(event)) {
    // In prod: await redis.incrbyfloat(`budget:used:${creativeId}`, bidAmount)
    console.log(`[Ads] Charging advertiser for ${event} on impression ${impressionId}`);
  }

  res.status(200).json({ success: true });
};

// ── Campaign CRUD ────────────────────────────────────────────────────────────
export const createCampaign = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { name, budgetType, budgetAmount, startDate, endDate, targeting, creative } = req.body;

  const campaign = await prisma.adCampaign.create({
    data: {
      advertiserId: req.user.id,
      name,
      budgetType,
      budget: budgetAmount,
      bidAmount: targeting?.bidAmount ?? 1.0,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      targeting,
      status: CampaignStatus.DRAFT
    }
  });

  res.status(201).json({ success: true, data: campaign });
};

export const listCampaigns = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const campaigns = await prisma.adCampaign.findMany({
    where: { advertiserId: req.user.id },
    include: { _count: { select: { creatives: true, impressions: true } } },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ success: true, data: { items: campaigns } });
};

export const getCampaign = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;

  const campaign = await prisma.adCampaign.findFirst({
    where: { id, advertiserId: req.user.id },
    include: {
      creatives: true,
      _count: { select: { impressions: true } }
    }
  });

  if (!campaign) return res.status(404).json({ success: false, error: 'Not found' });
  res.status(200).json({ success: true, data: campaign });
};

export const updateCampaign = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;
  const { name, budgetAmount, targeting } = req.body;

  const existing = await prisma.adCampaign.findFirst({ where: { id, advertiserId: req.user.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
  if (![CampaignStatus.DRAFT, CampaignStatus.PAUSED].includes(existing.status as any)) {
    return res.status(400).json({ success: false, error: 'Can only edit DRAFT or PAUSED campaigns' });
  }

  const updated = await prisma.adCampaign.update({
    where: { id },
    data: { name, budget: budgetAmount, targeting }
  });
  res.status(200).json({ success: true, data: updated });
};

export const pauseCampaign = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;
  const updated = await prisma.adCampaign.updateMany({
    where: { id, advertiserId: req.user.id, status: CampaignStatus.ACTIVE },
    data: { status: CampaignStatus.PAUSED }
  });
  res.status(200).json({ success: true, data: { affected: updated.count } });
};

export const resumeCampaign = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;
  const updated = await prisma.adCampaign.updateMany({
    where: { id, advertiserId: req.user.id, status: CampaignStatus.PAUSED },
    data: { status: CampaignStatus.ACTIVE }
  });
  res.status(200).json({ success: true, data: { affected: updated.count } });
};

export const getCampaignReport = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;

  // Mock CSV-formatted daily breakdown
  const csvLines = [
    'date,impressions,views,clicks,spend,ctr',
    ...Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const impressions = Math.floor(Math.random() * 5000);
      const clicks = Math.floor(impressions * 0.02);
      return `${d.toISOString().slice(0,10)},${impressions},${Math.floor(impressions * 0.6)},${clicks},${(clicks * 0.15).toFixed(2)},${(clicks/impressions*100).toFixed(2)}%`;
    })
  ];

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="campaign-${id}-report.csv"`);
  res.status(200).send(csvLines.join('\n'));
};
