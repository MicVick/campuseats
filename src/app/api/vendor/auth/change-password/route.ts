// POST /api/vendor/auth/change-password — Change vendor password

import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { requireVendor } from '@/lib/auth';
import { vendorChangePasswordSchema } from '@/lib/validations';
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api-response';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const vendor = requireVendor(request);
  const body = await request.json();
  const { oldPassword, newPassword } = vendorChangePasswordSchema.parse(body);

  // Get current account
  const account = await prisma.vendorAccount.findUnique({
    where: { id: vendor.vendorAccountId },
  });

  if (!account) {
    return errorResponse('Account not found', 404);
  }

  // Verify old password
  const isValid = await bcrypt.compare(oldPassword, account.passwordHash);
  if (!isValid) {
    return errorResponse('Current password is incorrect', 401);
  }

  // Hash and update new password
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.vendorAccount.update({
    where: { id: vendor.vendorAccountId },
    data: { passwordHash },
  });

  return successResponse({ message: 'Password changed successfully' });
});
