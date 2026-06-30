// POST /api/auth/request-otp
// Send OTP to an @iima.ac.in email address

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requestOtpSchema } from '@/lib/validations';
import { successResponse, withErrorHandler, errorResponse } from '@/lib/api-response';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { email } = requestOtpSchema.parse(body);

  // Rate limiting: max 5 OTPs per email in 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentOtps = await prisma.otpStore.count({
    where: {
      email,
      createdAt: { gte: tenMinutesAgo },
    },
  });

  if (recentOtps >= 5) {
    return errorResponse('Too many OTP requests. Please try again in a few minutes.', 429);
  }

  // Generate OTP. If MOCK_OTP_CODE is set (incl. on the deployed demo), use it
  // as a fixed code so any IIMA email can log in without an email provider.
  // DEMO ONLY — unset MOCK_OTP_CODE in production once real email is wired up.
  const code =
    process.env.MOCK_OTP_CODE ||
    String(Math.floor(100000 + Math.random() * 900000));

  // Store OTP with 5-minute expiry
  await prisma.otpStore.create({
    data: {
      email,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // In production, send email via SendGrid/Resend here
  // For MVP, log to console
  console.log(`[OTP] ${email}: ${code}`);

  return successResponse({ message: 'OTP sent to your IIMA email' });
});
