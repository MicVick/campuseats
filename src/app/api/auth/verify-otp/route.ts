// POST /api/auth/verify-otp
// Verify OTP and return JWT token

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyOtpSchema } from '@/lib/validations';
import { generateStudentToken } from '@/lib/auth';
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api-response';
import { isProductionEnv } from '@/lib/env';

export const POST = withErrorHandler(async (request: NextRequest) => {
  if (isProductionEnv()) {
    return errorResponse('OTP login is disabled. Please sign in with your IIMA Google account.', 403);
  }

  const body = await request.json();
  const { email, code } = verifyOtpSchema.parse(body);

  // Find valid OTP
  const otp = await prisma.otpStore.findFirst({
    where: {
      email,
      code,
      used: false,
      expiresAt: { gte: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) {
    return errorResponse('Invalid or expired OTP. Please try again.', 401);
  }

  // Mark OTP as used
  await prisma.otpStore.update({
    where: { id: otp.id },
    data: { used: true },
  });

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email } });
  const isNewUser = !user;

  if (!user) {
    // Create new user with email as placeholder name
    user = await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0], // placeholder, user will update
        authProvider: 'email',
      },
    });
  }

  // Generate JWT
  const token = generateStudentToken({
    userId: user.id,
    email: user.email,
  });

  return successResponse({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    isNewUser,
  });
});
