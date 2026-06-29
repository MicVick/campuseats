// POST /api/vendor/items — Create a menu item

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireVendor } from '@/lib/auth';
import { createMenuItemSchema } from '@/lib/validations';
import { createdResponse, errorResponse, withErrorHandler } from '@/lib/api-response';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const vendor = requireVendor(request);
  const body = await request.json();
  const data = createMenuItemSchema.parse(body);

  // Verify category belongs to vendor
  const category = await prisma.menuCategory.findFirst({
    where: { id: data.categoryId, vendorId: vendor.vendorId },
  });

  if (!category) {
    return errorResponse('Category not found or does not belong to your vendor', 404);
  }

  const item = await prisma.menuItem.create({
    data: {
      vendorId: vendor.vendorId,
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      price: data.price,
      isVeg: data.isVeg,
      imageUrl: data.imageUrl,
      customizationGroups: data.customizationGroups
        ? {
            create: data.customizationGroups.map((group) => ({
              name: group.name,
              type: group.type,
              required: group.required,
              minSelect: group.minSelect,
              maxSelect: group.maxSelect,
              options: {
                create: group.options.map((opt) => ({
                  name: opt.name,
                  priceDelta: opt.priceDelta,
                })),
              },
            })),
          }
        : undefined,
    },
    include: {
      customizationGroups: {
        include: { options: true },
      },
    },
  });

  // Update vendor veg/non-veg flags
  await updateVendorVegFlags(vendor.vendorId);

  return createdResponse(item);
});

async function updateVendorVegFlags(vendorId: string) {
  const items = await prisma.menuItem.findMany({
    where: { vendorId },
    select: { isVeg: true },
  });
  const hasVeg = items.some((i) => i.isVeg);
  const hasNonVeg = items.some((i) => !i.isVeg);

  await prisma.vendor.update({
    where: { id: vendorId },
    data: { hasVeg, hasNonVeg },
  });
}
