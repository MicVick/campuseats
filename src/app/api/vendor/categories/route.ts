// POST /api/vendor/categories — Create a menu category
// PATCH /api/vendor/categories/[id] — Update a category
// DELETE /api/vendor/categories/[id] — Delete a category

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireVendor } from '@/lib/auth';
import { createCategorySchema } from '@/lib/validations';
import { createdResponse, withErrorHandler } from '@/lib/api-response';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const vendor = requireVendor(request);
  const body = await request.json();
  const data = createCategorySchema.parse(body);

  const category = await prisma.menuCategory.create({
    data: {
      vendorId: vendor.vendorId,
      name: data.name,
      sortOrder: data.sortOrder,
    },
  });

  return createdResponse(category);
});
