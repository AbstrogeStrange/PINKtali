import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { prisma, UserRole, MonetizationStatus } from '@streamverse/db';
import { redisClient } from '../utils/redis';
import { sendVerificationEmail } from '../utils/mail';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'super_secret_refresh_key';

// Tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;

  // Basic validation (Zod middleware handles exact shapes, but double checking here)
  if (!/(?=.*[A-Z])(?=.*[0-9]).{8,}/.test(password)) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 chars, 1 uppercase, 1 number' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return res.status(400).json({ success: false, error: 'Email already in use' });

  const handle = displayName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          displayName,
          handle,
          role: UserRole.VIEWER,
        }
      });

      const channel = await tx.channel.create({
        data: {
          userId: user.id,
          handle: handle + '_channel',
          name: `${displayName}'s Channel`,
          monetizationStatus: MonetizationStatus.INELIGIBLE
        }
      });

      await tx.playlist.createMany({
        data: [
          { userId: user.id, name: 'Watch Later', isSystem: true, visibility: 'PRIVATE' },
          { userId: user.id, name: 'Liked Videos', isSystem: true, visibility: 'PRIVATE' }
        ]
      });

      return { user, channel };
    });

    const { accessToken, refreshToken } = generateTokens(result.user.id);
    
    // Hash refresh token for DB storage
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await prisma.refreshToken.create({
      data: {
        userId: result.user.id,
        token: hashedRefresh,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ipAddress: req.ip,
      }
    });

    // Send email
    const verifyToken = jwt.sign({ id: result.user.id, type: 'verify' }, JWT_SECRET, { expiresIn: '1d' });
    await sendVerificationEmail(email, verifyToken);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ success: true, data: { accessToken, user: { id: result.user.id, email, displayName, handle } } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const lockKey = `login_attempts:${email}`;

  const { count, lockUntil } = await redisClient.getAttempts(lockKey);
  if (lockUntil && lockUntil > Date.now()) {
    return res.status(429).json({ success: false, error: 'Account temporarily locked. Try again in 15 minutes.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    await redisClient.increment(lockKey);
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  if (user.twoFactorEnabled) {
    // Return a flag indicating 2FA is required, don't issue tokens yet
    return res.status(200).json({ success: true, data: { requires2FA: true, userId: user.id } });
  }

  await redisClient.clear(lockKey);

  const { accessToken, refreshToken } = generateTokens(user.id);
  const hashedRefresh = await bcrypt.hash(refreshToken, 10);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: hashedRefresh,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ipAddress: req.ip,
    }
  });

  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 30 * 24 * 60 * 60 * 1000 });
  res.status(200).json({ success: true, data: { accessToken, user: { id: user.id, email: user.email, displayName: user.displayName, handle: user.handle } } });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ success: false, error: 'No refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: string };
    
    // Find all valid tokens for user
    const dbTokens = await prisma.refreshToken.findMany({ 
      where: { userId: decoded.id, expiresAt: { gt: new Date() } } 
    });

    // Check if provided token matches any hashed token in DB
    let matchedTokenId = null;
    for (const t of dbTokens) {
      if (await bcrypt.compare(refreshToken, t.token)) {
        matchedTokenId = t.id;
        break;
      }
    }

    if (!matchedTokenId) throw new Error('Token compromised or invalid');

    // Rotate
    await prisma.refreshToken.delete({ where: { id: matchedTokenId } });

    const tokens = generateTokens(decoded.id);
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 10);

    await prisma.refreshToken.create({
      data: {
        userId: decoded.id,
        token: hashedRefresh,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ipAddress: req.ip,
      }
    });

    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.status(200).json({ success: true, data: { accessToken: tokens.accessToken } });
  } catch (err) {
    res.clearCookie('refreshToken');
    res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: string };
      const dbTokens = await prisma.refreshToken.findMany({ where: { userId: decoded.id } });
      
      for (const t of dbTokens) {
        if (await bcrypt.compare(refreshToken, t.token)) {
          await prisma.refreshToken.delete({ where: { id: t.id } });
        }
      }
    } catch (e) {
      // Ignore
    }
  }
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, data: { message: 'Logged out' } });
};

// 2FA Endpoints
export const enable2FA = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  
  const secret = authenticator.generateSecret();
  const uri = authenticator.keyuri(req.user.email, 'StreamVerse', secret);
  const qrCodeUrl = await qrcode.toDataURL(uri);

  await prisma.user.update({
    where: { id: req.user.id },
    data: { twoFactorSecret: secret }
  });

  res.status(200).json({ success: true, data: { qrCodeUrl, secret } });
};

export const verify2FA = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user?.twoFactorSecret) return res.status(400).json({ success: false, error: '2FA not initialized' });

  const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
  if (!isValid) return res.status(400).json({ success: false, error: 'Invalid token' });

  await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
  res.status(200).json({ success: true, data: { message: '2FA enabled' } });
};

export const disable2FA = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  await prisma.user.update({ where: { id: req.user.id }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
  res.status(200).json({ success: true, data: { message: '2FA disabled' } });
};
