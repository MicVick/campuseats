// GET /api/vendor/menu — Get full menu for authenticated vendor
// POST /api/vendor/menu — Create category or item (see sub-routes)

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireVendor } from '@/lib/auth';
import { successResponse, withErrorHandler } from '@/lib/api-response';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const vendor = requireVendor(request);

  const categories = await prisma.menuCategory.findMany({
    where: { vendorId: vendor.vendorId },
    orderBy: { sortOrder: 'asc' },
    include: {
      items: {
        include: {
          customizationGroups: {
            include: { options: true },
          },
        },
      },
    },
  });

  return successResponse(categories);
});
