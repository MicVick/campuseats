// PATCH /api/vendor/items/[id]/availability — Toggle item availability

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireVendor } from '@/lib/auth';
import { updateAvailabilitySchema } from '@/lib/validations';
import { successResponse, notFoundResponse, withErrorHandler } from '@/lib/api-response';

export const PATCH = withErrorHandler(async (request: NextRequest, context) => {
  const vendor = requireVendor(request);
  const { id } = await context!.params;
  const body = await request.json();
  const { isAvailable } = updateAvailabilitySchema.parse(body);

  const item = await prisma.menuItem.findFirst({
    where: { id, vendorId: vendor.vendorId },
  });

  if (!item) return notFoundResponse('Menu item');

  const updated = await prisma.menuItem.update({
    where: { id },
    data: { isAvailable },
  });

  return successResponse(updated);
});
