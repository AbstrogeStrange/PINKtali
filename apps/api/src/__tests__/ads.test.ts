import request from 'supertest';
import app from '../index';
import { prismaMock } from './setup/prisma.mock';

describe('Ads Controller', () => {
  it('should return an ad creative matching targeting', async () => {
    prismaMock.adCreative.findMany.mockResolvedValue([
      { id: 'ad-1', title: 'Test Ad', placement: 'PRE_ROLL' }
    ] as any);

    const response = await request(app)
      .post('/api/v1/ads/request')
      .send({ videoId: 'video-1', placement: 'PRE_ROLL', viewerCountry: 'US' });

    expect(response.status).toBe(200);
    expect(response.body.data.creative.id).toBe('ad-1');
  });

  it('should track ad events', async () => {
    prismaMock.adImpression.upsert.mockResolvedValue({ id: 'imp-1' } as any);

    const response = await request(app)
      .post('/api/v1/ads/events')
      .send({ impressionId: 'imp-1', event: 'IMPRESSION' });

    expect(response.status).toBe(200);
  });
});
