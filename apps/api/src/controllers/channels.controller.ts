import { Request, Response } from 'express';
import { prisma, VideoStatus, VideoType } from '@streamverse/db';

export const getChannel = async (req: Request, res: Response) => {
  const { handle } = req.params;
  const channel = await prisma.channel.findUnique({
    where: { handle },
    include: { _count: { select: { videos: true, subscribers: true } } }
  });
  if (!channel) return res.status(404).json({ success: false, error: 'Not found' });
  res.status(200).json({ success: true, data: channel });
};

export const updateChannel = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { name, description } = req.body;

  const channel = await prisma.channel.update({
    where: { userId: req.user.id },
    data: { name, description }
  });
  res.status(200).json({ success: true, data: channel });
};

export const uploadBanner = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  // Mock upload
  const bannerUrl = 'https://mock-s3/banner.jpg';
  const channel = await prisma.channel.update({
    where: { userId: req.user.id },
    data: { bannerUrl }
  });
  res.status(200).json({ success: true, data: { bannerUrl } });
};

export const getChannelVideos = async (req: Request, res: Response) => {
  const { handle } = req.params;
  const { page = 1, limit = 20, sort = 'newest' } = req.query;

  const channel = await prisma.channel.findUnique({ where: { handle } });
  if (!channel) return res.status(404).json({ success: false, error: 'Not found' });

  const orderBy = sort === 'popular' ? { viewCount: 'desc' } : { publishedAt: 'desc' };

  const videos = await prisma.video.findMany({
    where: { channelId: channel.id, type: VideoType.LONG_FORM, status: VideoStatus.LIVE },
    orderBy: orderBy as any,
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit)
  });

  res.status(200).json({ success: true, data: { items: videos } });
};

export const getChannelShorts = async (req: Request, res: Response) => {
  const { handle } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const channel = await prisma.channel.findUnique({ where: { handle } });
  if (!channel) return res.status(404).json({ success: false, error: 'Not found' });

  const shorts = await prisma.video.findMany({
    where: { channelId: channel.id, type: VideoType.SHORT, status: VideoStatus.LIVE },
    orderBy: { publishedAt: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit)
  });

  res.status(200).json({ success: true, data: { items: shorts } });
};

export const getChannelPlaylists = async (req: Request, res: Response) => {
  const { handle } = req.params;
  const channel = await prisma.channel.findUnique({ where: { handle }, include: { user: true } });
  if (!channel) return res.status(404).json({ success: false, error: 'Not found' });

  const playlists = await prisma.playlist.findMany({
    where: { userId: channel.userId, visibility: 'PUBLIC' },
    orderBy: { updatedAt: 'desc' }
  });

  res.status(200).json({ success: true, data: { items: playlists } });
};

export const getChannelCommunity = async (req: Request, res: Response) => {
  const { handle } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const channel = await prisma.channel.findUnique({ where: { handle } });
  if (!channel) return res.status(404).json({ success: false, error: 'Not found' });

  const posts = await prisma.communityPost.findMany({
    where: { channelId: channel.id, status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit)
  });

  res.status(200).json({ success: true, data: { items: posts } });
};

export const getChannelAbout = async (req: Request, res: Response) => {
  const { handle } = req.params;
  const channel = await prisma.channel.findUnique({ where: { handle }, include: { user: true } });
  if (!channel) return res.status(404).json({ success: false, error: 'Not found' });

  const totalViews = await prisma.video.aggregate({
    where: { channelId: channel.id, status: VideoStatus.LIVE },
    _sum: { viewCount: true }
  });

  res.status(200).json({ 
    success: true, 
    data: { 
      description: channel.description,
      joinedAt: channel.joinedAt,
      country: channel.user.country,
      totalViews: totalViews._sum.viewCount || 0
    } 
  });
};
