// PATCH /api/vendor/categories/[id] — Update a category
// DELETE /api/vendor/categories/[id] — Delete a category

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireVendor } from '@/lib/auth';
import { updateCategorySchema } from '@/lib/validations';
import { successResponse, notFoundResponse, errorResponse, withErrorHandler } from '@/lib/api-response';

export const PATCH = withErrorHandler(async (request: NextRequest, context) => {
  const vendor = requireVendor(request);
  const { id } = await context!.params;
  const body = await request.json();
  const data = updateCategorySchema.parse(body);

  const category = await prisma.menuCategory.findFirst({
    where: { id, vendorId: vendor.vendorId },
  });

  if (!category) return notFoundResponse('Category');

  const updated = await prisma.menuCategory.update({
    where: { id },
    data,
  });

  return successResponse(updated);
});

export const DELETE = withErrorHandler(async (request: NextRequest, context) => {
  const vendor = requireVendor(request);
  const { id } = await context!.params;

  const category = await prisma.menuCategory.findFirst({
    where: { id, vendorId: vendor.vendorId },
    include: { items: { select: { id: true } } },
  });

  if (!category) return notFoundResponse('Category');

  if (category.items.length > 0) {
    return errorResponse(
      `Cannot delete category with ${category.items.length} items. Remove items first.`,
      400
    );
  }

  await prisma.menuCategory.delete({ where: { id } });

  return successResponse({ message: 'Category deleted' });
});
