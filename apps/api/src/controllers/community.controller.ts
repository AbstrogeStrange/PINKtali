import { Request, Response } from 'express';
import { prisma } from '@streamverse/db';

export const createPost = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { body, imageUrls, pollOptions } = req.body;

  const channel = await prisma.channel.findUnique({ where: { userId: req.user.id } });
  if (!channel) return res.status(404).json({ success: false, error: 'Channel not found' });

  // pollOptions should be an array of strings like ["Yes", "No", "Maybe"]
  const post = await prisma.communityPost.create({
    data: {
      channelId: channel.id,
      body,
      imageUrls: imageUrls || [],
      pollOptions: pollOptions || [], // We store options as JSON. The DB schema uses JSONB.
      status: 'PUBLISHED'
    }
  });

  res.status(200).json({ success: true, data: post });
};

export const votePoll = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const { id } = req.params;
  const { optionIndex } = req.body;

  const post = await prisma.communityPost.findUnique({ where: { id } });
  if (!post || !post.pollOptions || !Array.isArray(post.pollOptions)) {
    return res.status(404).json({ success: false, error: 'Poll not found' });
  }

  // Prevent double voting
  const existingVote = await prisma.pollVote.findUnique({
    where: { postId_userId: { postId: id, userId: req.user.id } }
  });

  if (existingVote) {
    return res.status(400).json({ success: false, error: 'Already voted' });
  }

  await prisma.pollVote.create({
    data: { postId: id, userId: req.user.id, optionIndex }
  });

  // Fetch updated counts
  const votes = await prisma.pollVote.groupBy({
    by: ['optionIndex'],
    where: { postId: id },
    _count: true
  });

  const totalVotes = votes.reduce((acc, curr) => acc + curr._count, 0);
  const results = votes.map(v => ({
    optionIndex: v.optionIndex,
    percentage: Math.round((v._count / totalVotes) * 100),
    count: v._count
  }));

  res.status(200).json({ success: true, data: { results, totalVotes } });
};
