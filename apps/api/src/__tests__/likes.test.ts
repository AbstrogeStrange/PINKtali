import request from 'supertest';
import app from '../index';
import { prismaMock } from './setup/prisma.mock';

describe('Likes Controller', () => {
  it('should like a video and increment counter in Redis', async () => {
    prismaMock.like.upsert.mockResolvedValue({ id: 'like-1', value: 1 } as any);
    
    const response = await request(app)
      .post('/api/v1/likes')
      .set('Authorization', 'Bearer valid-token')
      .send({ targetType: 'VIDEO', targetId: 'video-1', value: 1 });

    expect(response.status).toBe(200);
    expect(response.body.data.userLike).toBe(1);
  });

  it('should dislike a video', async () => {
    prismaMock.like.upsert.mockResolvedValue({ id: 'like-1', value: -1 } as any);
    
    const response = await request(app)
      .post('/api/v1/likes')
      .set('Authorization', 'Bearer valid-token')
      .send({ targetType: 'VIDEO', targetId: 'video-1', value: -1 });

    expect(response.status).toBe(200);
    expect(response.body.data.userLike).toBe(-1);
  });
});
