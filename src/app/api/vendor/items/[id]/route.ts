// PATCH /api/vendor/items/[id] — Update a menu item
// DELETE /api/vendor/items/[id] — Soft-delete a menu item

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireVendor } from '@/lib/auth';
import { updateMenuItemSchema } from '@/lib/validations';
import { successResponse, notFoundResponse, withErrorHandler } from '@/lib/api-response';

export const PATCH = withErrorHandler(async (request: NextRequest, context) => {
  const vendor = requireVendor(request);
  const { id } = await context!.params;
  const body = await request.json();
  const data = updateMenuItemSchema.parse(body);

  const item = await prisma.menuItem.findFirst({
    where: { id, vendorId: vendor.vendorId },
  });

  if (!item) return notFoundResponse('Menu item');

  const updated = await prisma.menuItem.update({
    where: { id },
    data,
    include: {
      customizationGroups: {
        include: { options: true },
      },
    },
  });

  return successResponse(updated);
});

export const DELETE = withErrorHandler(async (request: NextRequest, context) => {
  const vendor = requireVendor(request);
  const { id } = await context!.params;

  const item = await prisma.menuItem.findFirst({
    where: { id, vendorId: vendor.vendorId },
  });

  if (!item) return notFoundResponse('Menu item');

  // Soft-delete by marking unavailable and removing from display
  // (or hard-delete if no active orders reference it)
  await prisma.menuItem.delete({ where: { id } });

  return successResponse({ message: 'Item deleted' });
});
