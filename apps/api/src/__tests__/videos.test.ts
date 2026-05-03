import request from 'supertest';
import app from '../index';
import { prismaMock } from './setup/prisma.mock';

describe('Video Controller', () => {
  describe('POST /api/v1/videos/upload/initiate', () => {
    it('should initiate multipart upload', async () => {
      const videoData = {
        filename: 'test.mp4',
        fileSizeBytes: 1024 * 1024,
        type: 'LONG_FORM',
        title: 'Test Video'
      };

      prismaMock.video.create.mockResolvedValue({
        id: 'video-1',
        ...videoData,
        status: 'UPLOADING',
        userId: 'user-1'
      } as any);

      const response = await request(app)
        .post('/api/v1/videos/upload/initiate')
        .set('Authorization', 'Bearer valid-token')
        .send(videoData);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('uploadId');
      expect(response.body.data).toHaveProperty('videoId');
    });
  });

  describe('PATCH /api/v1/videos/:id', () => {
    it('should update video metadata', async () => {
      prismaMock.video.findUnique.mockResolvedValue({ id: 'video-1', userId: 'user-1' } as any);
      prismaMock.video.update.mockResolvedValue({ id: 'video-1', title: 'Updated' } as any);

      const response = await request(app)
        .patch('/api/v1/videos/video-1')
        .set('Authorization', 'Bearer valid-token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Updated');
    });
  });
});
