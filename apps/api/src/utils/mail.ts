import nodemailer from 'nodemailer';
import { logger } from './logger';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER || 'mock_user',
    pass: process.env.SMTP_PASS || 'mock_pass',
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  try {
    await transporter.sendMail({
      from: '"StreamVerse" <noreply@streamverse.com>',
      to: email,
      subject: 'Verify your StreamVerse account',
      html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
    });
    logger.info(`Verification email sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to send email to ${email}`, err);
  }
};
