// POST /api/vendor/auth/login — Vendor login with email/password
// POST /api/vendor/auth/change-password — Change vendor password

import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { vendorLoginSchema } from '@/lib/validations';
import { generateVendorToken } from '@/lib/auth';
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api-response';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { email, password } = vendorLoginSchema.parse(body);

  // Find vendor account
  const account = await prisma.vendorAccount.findUnique({
    where: { email },
    include: { vendor: true },
  });

  if (!account) {
    return errorResponse('Invalid email or password', 401);
  }

  // Verify password
  const isValid = await bcrypt.compare(password, account.passwordHash);
  if (!isValid) {
    return errorResponse('Invalid email or password', 401);
  }

  // Generate vendor JWT
  const token = generateVendorToken({
    vendorAccountId: account.id,
    vendorId: account.vendorId,
    email: account.email,
  });

  return successResponse({
    token,
    vendor: {
      id: account.vendor.id,
      name: account.vendor.name,
      email: account.email,
    },
  });
});
