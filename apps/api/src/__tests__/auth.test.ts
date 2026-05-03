import request from 'supertest';
import app from '../index'; // Assuming index.ts exports the express app
import { prismaMock } from './setup/prisma.mock';
import bcrypt from 'bcrypt';

describe('Auth Controller', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user and return tokens', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        displayName: 'Test User'
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.$transaction.mockImplementation(async (cb) => {
        return cb(prismaMock);
      });
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        email: userData.email,
        displayName: userData.displayName,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user.email).toBe(userData.email);
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'invalid', password: 'Password123!', displayName: 'Test' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login and return tokens', async () => {
      const password = 'Password123!';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: hashedPassword,
        displayName: 'Test User'
      } as any);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('accessToken');
    });
  });
});
