import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().min(3).max(30),
  channelName: z.string().nullable().optional(),
  channelDesc: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  bannerUrl: z.string().url().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const VideoSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().nullable().optional(),
  duration: z.number().int().nonnegative(),
  views: z.number().int().nonnegative(),
  status: z.enum(['PROCESSING', 'READY', 'FAILED']),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
});

export const CommentSchema = z.object({
  id: z.string(),
  text: z.string().min(1).max(5000),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  videoId: z.string(),
});

// Request Payload Validation
export const RegisterUserDto = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
});

export const LoginUserDto = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const CreateVideoDto = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  // url and duration will be populated by worker/backend
});

export const CreateCommentDto = z.object({
  text: z.string().min(1).max(5000),
});

// Infer TypeScript types
export type User = z.infer<typeof UserSchema>;
export type Video = z.infer<typeof VideoSchema>;
export type Comment = z.infer<typeof CommentSchema>;

export type RegisterUserInput = z.infer<typeof RegisterUserDto>;
export type LoginUserInput = z.infer<typeof LoginUserDto>;
export type CreateVideoInput = z.infer<typeof CreateVideoDto>;
export type CreateCommentInput = z.infer<typeof CreateCommentDto>;
