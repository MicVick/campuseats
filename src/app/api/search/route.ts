// GET /api/search — Search vendors and dishes
// Query params: q (required), veg (optional)

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api-response';
import { parseCuisineTags } from '@/lib/utils';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const veg = searchParams.get('veg') === 'true';

  if (!q || q.trim().length === 0) {
    return errorResponse('Search query is required', 400);
  }

  const query = q.trim();

  // Search vendors by name and cuisine tags
  const vendors = await prisma.vendor.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { cuisineTags: { contains: query } },
      ],
      ...(veg ? { hasVeg: true } : {}),
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      cuisineTags: true,
      avgRating: true,
      ratingCount: true,
      mvrcRating: true,
      area: true,
      avgPrepTimeMins: true,
    },
  });

  // Search menu items by name and description
  const dishes = await prisma.menuItem.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
      ],
      ...(veg ? { isVeg: true } : {}),
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      isVeg: true,
      isAvailable: true,
      imageUrl: true,
      vendorId: true,
      categoryId: true,
      vendor: {
        select: {
          name: true,
        },
      },
    },
    take: 20,
  });

  return successResponse({
    vendors: vendors.map((v) => ({
      ...v,
      cuisineTags: parseCuisineTags(v.cuisineTags),
    })),
    dishes: dishes.map((d) => ({
      ...d,
      vendorName: d.vendor.name,
      vendor: undefined,
    })),
  });
});
