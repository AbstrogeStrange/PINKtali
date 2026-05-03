import { Router } from 'express';
import { register, login, refresh, logout, enable2FA, verify2FA, disable2FA } from '../../controllers/auth.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { z } from 'zod';
import { RegisterUserDto, LoginUserDto } from '@streamverse/types';

// Extend Zod schema for the password requirements
const StrictRegisterDto = RegisterUserDto.extend({
  displayName: z.string().min(2),
  password: z.string().regex(/(?=.*[A-Z])(?=.*[0-9]).{8,}/, 'Password must be at least 8 chars, 1 uppercase, 1 number')
});

const router = Router();

router.post('/register', validate(z.object({ body: StrictRegisterDto })), register);
router.post('/login', validate(z.object({ body: LoginUserDto })), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Passwords (Stubs)
router.post('/forgot-password', (req, res) => res.json({ success: true }));
router.post('/reset-password', (req, res) => res.json({ success: true }));
router.get('/verify-email', (req, res) => res.json({ success: true }));

// OAuth (Stubs for passport)
router.get('/google', (req, res) => res.redirect('/'));
router.get('/google/callback', (req, res) => res.json({ success: true }));
router.get('/apple', (req, res) => res.redirect('/'));
router.get('/apple/callback', (req, res) => res.json({ success: true }));

// 2FA
router.post('/2fa/enable', authenticate, enable2FA);
router.post('/2fa/verify', authenticate, validate(z.object({ body: z.object({ token: z.string() }) })), verify2FA);
router.post('/2fa/disable', authenticate, disable2FA);

export default router;
