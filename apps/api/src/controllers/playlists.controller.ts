import { Request, Response } from 'express';
import { prisma, Visibility } from '@streamverse/db';

export const getMyPlaylists = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const playlists = await prisma.playlist.findMany({
    where: { userId: req.user.id },
    orderBy: { updatedAt: 'desc' }
  });
  res.status(200).json({ success: true, data: { items: playlists } });
};

export const createPlaylist = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { name, description, visibility } = req.body;

  const playlist = await prisma.playlist.create({
    data: {
      userId: req.user.id,
      name,
      description,
      visibility: visibility || Visibility.PRIVATE,
      isSystem: false
    }
  });
  res.status(200).json({ success: true, data: playlist });
};

export const getPlaylist = async (req: Request, res: Response) => {
  const { id } = req.params;
  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: {
      items: {
        include: { video: { include: { channel: true } } },
        orderBy: { position: 'asc' }
      }
    }
  });

  if (!playlist) return res.status(404).json({ success: false, error: 'Not found' });
  
  if (playlist.visibility === Visibility.PRIVATE) {
    if (!req.user || playlist.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
  }

  res.status(200).json({ success: true, data: playlist });
};

export const updatePlaylist = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;
  const { name, description, visibility } = req.body;

  const existing = await prisma.playlist.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });
  if (existing.isSystem) return res.status(400).json({ success: false, error: 'Cannot update system playlist metadata' });

  const playlist = await prisma.playlist.update({
    where: { id },
    data: { name, description, visibility: visibility as Visibility }
  });
  res.status(200).json({ success: true, data: playlist });
};

export const deletePlaylist = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;

  const existing = await prisma.playlist.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });
  if (existing.isSystem) return res.status(400).json({ success: false, error: 'Cannot delete system playlist' });

  await prisma.playlist.delete({ where: { id } });
  res.status(200).json({ success: true, data: { message: 'Deleted' } });
};

export const addPlaylistItem = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;
  const { videoId } = req.body;

  const existing = await prisma.playlist.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });

  const maxPos = await prisma.playlistVideo.aggregate({
    where: { playlistId: id },
    _max: { position: true }
  });
  const newPosition = (maxPos._max.position || 0) + 1;

  const item = await prisma.playlistVideo.create({
    data: { playlistId: id, videoId, position: newPosition }
  });
  res.status(200).json({ success: true, data: item });
};

export const removePlaylistItem = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id, videoId } = req.params;

  const existing = await prisma.playlist.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });

  await prisma.playlistVideo.delete({
    where: { playlistId_videoId: { playlistId: id, videoId } }
  });
  res.status(200).json({ success: true, data: { message: 'Removed' } });
};

export const reorderPlaylistItems = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;
  const { orderedVideoIds } = req.body;

  const existing = await prisma.playlist.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });

  await prisma.$transaction(
    orderedVideoIds.map((videoId: string, index: number) => 
      prisma.playlistVideo.update({
        where: { playlistId_videoId: { playlistId: id, videoId } },
        data: { position: index }
      })
    )
  );

  res.status(200).json({ success: true });
};
