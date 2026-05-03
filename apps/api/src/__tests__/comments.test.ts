import request from 'supertest';
import app from '../index';
import { prismaMock } from './setup/prisma.mock';

describe('Comments Controller', () => {
  it('should create a comment', async () => {
    const commentData = { body: 'Great video!', targetId: 'video-1' };
    prismaMock.comment.create.mockResolvedValue({ id: 'comment-1', ...commentData, userId: 'user-1' } as any);

    const response = await request(app)
      .post('/api/v1/videos/video-1/comments')
      .set('Authorization', 'Bearer valid-token')
      .send({ body: 'Great video!' });

    expect(response.status).toBe(201);
    expect(response.body.data.body).toBe('Great video!');
  });

  it('should return nested comments', async () => {
    prismaMock.comment.findMany.mockResolvedValue([
      { id: 'c1', body: 'Root', replies: [{ id: 'c2', body: 'Reply' }] }
    ] as any);

    const response = await request(app).get('/api/v1/videos/video-1/comments');

    expect(response.status).toBe(200);
    expect(response.body.data[0].replies).toHaveLength(1);
  });
});
