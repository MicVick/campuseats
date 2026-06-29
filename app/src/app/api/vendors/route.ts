// GET /api/vendors — List vendors with filters
// Query params: openNow, veg, category, sort, q

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, withErrorHandler } from '@/lib/api-response';
import { isVendorOpen, getNextOpenTime, parseCuisineTags } from '@/lib/utils';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const openNow = searchParams.get('openNow');
  const veg = searchParams.get('veg');
  const category = searchParams.get('category');
  const sort = searchParams.get('sort');
  const q = searchParams.get('q');

  // Fetch all vendors (SQLite doesn't support complex JSON queries, so we filter in-app)
  const vendors = await prisma.vendor.findMany({
    where: {
      ...(veg === 'true' ? { hasVeg: true } : {}),
      ...(q ? {
        OR: [
          { name: { contains: q } },
          { cuisineTags: { contains: q } },
        ],
      } : {}),
    },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      cuisineTags: true,
      area: true,
      hasVeg: true,
      hasNonVeg: true,
      avgRating: true,
      ratingCount: true,
      mvrcRating: true,
      openHours: true,
      pickupAvailable: true,
      minOrder: true,
      packagingFee: true,
      avgPrepTimeMins: true,
      isTemporarilyClosed: true,
    },
  });

  // Transform vendors with computed fields
  let result = vendors.map((vendor) => {
    const isOpen = isVendorOpen(vendor.openHours, vendor.isTemporarilyClosed);
    const nextOpen = !isOpen ? getNextOpenTime(vendor.openHours) : null;
    const tags = parseCuisineTags(vendor.cuisineTags);

    return {
      ...vendor,
      cuisineTags: tags,
      isOpen,
      nextOpenTime: nextOpen,
    };
  });

  // Filter by category (cuisine tag)
  if (category) {
    result = result.filter((v) =>
      v.cuisineTags.some((tag: string) =>
        tag.toLowerCase().includes(category.toLowerCase())
      )
    );
  }

  // Filter by open now
  if (openNow === 'true') {
    result = result.filter((v) => v.isOpen);
  }

  // Sort
  if (sort === 'rating') {
    result.sort((a, b) => b.avgRating - a.avgRating);
  } else if (sort === 'prepTime') {
    result.sort((a, b) => a.avgPrepTimeMins - b.avgPrepTimeMins);
  } else if (sort === 'price') {
    result.sort((a, b) => a.minOrder - b.minOrder);
  } else {
    // Default: open first, then by rating
    result.sort((a, b) => {
      if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
      return b.avgRating - a.avgRating;
    });
  }

  return successResponse(result);
});
