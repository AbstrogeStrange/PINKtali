import { Request, Response } from 'express';
import { prisma, VideoStatus, VideoType, Visibility } from '@streamverse/db';
import { initiateMultipartUpload, generatePresignedUrlsForParts, completeMultipartUpload, generateCloudFrontUrl } from '../services/s3.service';
import { Queue } from 'bullmq';
import { redisClient } from '../utils/redis';

// BullMQ Queue
const transcodeQueue = new Queue('video-transcode', {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
  }
});

const viewsQueue = new Queue('view-events', {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
  }
});

const PART_SIZE = 13 * 1024 * 1024; // 13 MB per part

export const initiateUpload = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  
  const { filename, fileSizeBytes, type, title } = req.body;
  if (!filename || !fileSizeBytes || !title) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const channel = await prisma.channel.findUnique({ where: { userId: req.user.id } });
  if (!channel) return res.status(404).json({ success: false, error: 'Channel not found' });

  const s3Key = `raw/${channel.id}/${Date.now()}-${filename}`;
  
  const video = await prisma.video.create({
    data: {
      channelId: channel.id,
      title,
      type: type === 'SHORT' ? VideoType.SHORT : VideoType.LONG_FORM,
      status: VideoStatus.UPLOADING,
      fileSizeBytes: BigInt(fileSizeBytes),
      rawS3Key: s3Key,
    }
  });

  try {
    const uploadId = await initiateMultipartUpload(s3Key);
    const partsCount = Math.ceil(fileSizeBytes / PART_SIZE);
    if (partsCount > 10000) return res.status(400).json({ success: false, error: 'File too large' });

    const parts = await generatePresignedUrlsForParts(s3Key, uploadId, partsCount);

    res.status(200).json({ success: true, data: { videoId: video.id, uploadId, parts } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const completeUpload = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { videoId, uploadId, parts } = req.body;

  const video = await prisma.video.findUnique({ where: { id: videoId }, include: { channel: true } });
  if (!video || video.channel.userId !== req.user.id || !video.rawS3Key) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  try {
    await completeMultipartUpload(video.rawS3Key, uploadId, parts);

    await prisma.video.update({
      where: { id: videoId },
      data: { status: VideoStatus.PROCESSING }
    });

    // Enqueue transcoding job
    // Mocking job enqueue if Redis is not running
    try {
      await transcodeQueue.add('transcode', { videoId, rawS3Key: video.rawS3Key });
    } catch(e) {
      console.warn("Failed to connect to BullMQ. Mocking enqueue.");
    }

    res.status(200).json({ success: true, data: { message: 'Upload completed, processing started' } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getUploadStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) return res.status(404).json({ success: false, error: 'Not found' });

  // Get progress from Redis mock
  const progressKey = `transcode:progress:${id}`;
  const attempt = await redisClient.getAttempts(progressKey); // Mocking get
  const progress = attempt.count > 0 ? attempt.count : 0;

  res.status(200).json({ success: true, data: { status: video.status, progress } });
};

export const updateVideo = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;
  const { title, description, visibility } = req.body;

  const video = await prisma.video.findUnique({ where: { id }, include: { channel: true } });
  if (!video || video.channel.userId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });

  const updated = await prisma.video.update({
    where: { id },
    data: { title, description, visibility: visibility as Visibility }
  });

  res.status(200).json({ success: true, data: updated });
};

export const deleteVideo = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;

  const video = await prisma.video.findUnique({ where: { id }, include: { channel: true } });
  if (!video || video.channel.userId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });

  await prisma.video.update({
    where: { id },
    data: { status: VideoStatus.REMOVED }
  });

  res.status(200).json({ success: true, data: { message: 'Video removed' } });
};

export const getStreamUrl = async (req: Request, res: Response) => {
  const { id } = req.params;
  const video = await prisma.video.findUnique({ where: { id } });
  if (!video || video.status !== VideoStatus.LIVE || !video.hlsManifestUrl) {
    return res.status(404).json({ success: false, error: 'Video not streamable' });
  }

  const manifestUrl = generateCloudFrontUrl(`hls/${id}/master.m3u8`);

  // Track view
  try {
    await viewsQueue.add('view', { videoId: id, userId: req.user?.id, sessionId: req.headers['user-agent'] || 'unknown' });
  } catch(e) {
    // Ignore queue errors
  }

  res.status(200).json({ success: true, data: { manifestUrl } });
};

export const uploadThumbnail = async (req: Request, res: Response) => {
  // Mock upload logic handled similarly to avatar
  res.status(200).json({ success: true, data: { thumbnailUrl: 'https://mock-s3/thumb.jpg' } });
};

export const getShareData = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { t } = req.query; // optional timestamp
  
  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) return res.status(404).json({ success: false, error: 'Not found' });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://streamverse.app';
  const url = `${baseUrl}/watch?v=${id}${t ? `&t=${t}` : ''}`;
  
  const embedCode = `<iframe width="560" height="315" src="${baseUrl}/embed/${id}" title="${video.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

  res.status(200).json({ 
    success: true, 
    data: { url, embedCode, title: video.title, thumbnailUrl: video.thumbnailUrl } 
  });
};
