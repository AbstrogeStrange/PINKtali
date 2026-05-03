import request from 'supertest';
import app from '../index';
import { prismaMock } from './setup/prisma.mock';

describe('Feed Controller', () => {
  it('should return home feed with scores', async () => {
    // Mocking search service would be better, but testing the route here
    const response = await request(app).get('/api/v1/feed/home');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should return trending videos', async () => {
    prismaMock.video.findMany.mockResolvedValue([{ id: 'v1', title: 'Trending' }] as any);

    const response = await request(app).get('/api/v1/feed/trending');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });
});
