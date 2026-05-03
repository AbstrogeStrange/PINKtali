import { Request, Response } from 'express';
import { prisma } from '@streamverse/db';
import { generatePresignedUrl } from '../services/s3.service';

export const getMe = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { channel: true }
  });
  res.status(200).json({ success: true, data: user });
};

export const updateMe = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { displayName, bio, country } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { displayName, bio, country }
  });
  res.status(200).json({ success: true, data: user });
};

export const uploadAvatar = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  // Mock file upload processing
  const mockS3Key = `avatars/${req.user.id}-${Date.now()}.jpg`;
  const avatarUrl = await generatePresignedUrl('mock-bucket', mockS3Key);

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { avatarUrl }
  });

  res.status(200).json({ success: true, data: { avatarUrl } });
};

export const deleteMe = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  await prisma.user.update({
    where: { id: req.user.id },
    data: { deletedAt: new Date() }
  });
  res.status(200).json({ success: true, data: { message: 'Account soft deleted' } });
};

export const getNotifications = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { page = 1, limit = 20 } = req.query;

  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  const total = await prisma.notification.count({ where: { userId: req.user.id } });

  res.status(200).json({ success: true, data: { items: notifications, total, page: Number(page) } });
};

export const readNotification = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: { isRead: true }
  });
  res.status(200).json({ success: true });
};

export const readAllNotifications = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true }
  });
  res.status(200).json({ success: true });
};

export const getWatchHistory = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { page = 1, limit = 20, date } = req.query;

  const where: any = { userId: req.user.id };
  if (date) {
    const d = new Date(date as string);
    where.createdAt = { gte: d, lt: new Date(d.getTime() + 24 * 60 * 60 * 1000) };
  }

  const history = await prisma.view.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    include: { video: true }
  });

  const total = await prisma.view.count({ where });

  res.status(200).json({ success: true, data: { items: history, total, page: Number(page) } });
};

export const clearWatchHistory = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  await prisma.view.deleteMany({ where: { userId: req.user.id } });
  res.status(200).json({ success: true });
};

export const getLikedVideos = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const likes = await prisma.like.findMany({
    where: { userId: req.user.id, targetType: 'VIDEO', value: 1 },
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json({ success: true, data: { items: likes } });
};

export const getSubscriptions = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const subs = await prisma.subscription.findMany({
    where: { subscriberId: req.user.id },
    include: { channel: true },
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json({ success: true, data: { items: subs } });
};
