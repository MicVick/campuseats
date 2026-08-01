// GET /api/vendors/[id] — Full vendor detail with menu, MVRC info, UPI

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, notFoundResponse, withErrorHandler } from '@/lib/api-response';
import {
  isVendorOpen,
  getNextOpenTime,
  parseCuisineTags,
  parseOpenHoursJson,
} from '@/lib/utils';

export const GET = withErrorHandler(async (request: NextRequest, context) => {
  const { id } = await context!.params;

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      categories: {
        orderBy: { sortOrder: 'asc' },
        include: {
          items: {
            include: {
              customizationGroups: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      },
      mvrcReports: {
        orderBy: { assessmentDate: 'desc' },
        take: 1,
      },
    },
  });

  if (!vendor) {
    return notFoundResponse('Vendor');
  }

  const isOpen = isVendorOpen(vendor.openHours, vendor.isTemporarilyClosed);
  const nextOpen = !isOpen && !vendor.isTemporarilyClosed
    ? getNextOpenTime(vendor.openHours)
    : null;

  // Filter by veg if requested
  const { searchParams } = new URL(request.url);
  const vegOnly = searchParams.get('veg') === 'true';

  const categories = vendor.categories.map((cat) => ({
    ...cat,
    items: vegOnly ? cat.items.filter((item) => item.isVeg) : cat.items,
  })).filter((cat) => cat.items.length > 0); // Remove empty categories

  return successResponse({
    ...vendor,
    cuisineTags: parseCuisineTags(vendor.cuisineTags),
    openHours: parseOpenHoursJson(vendor.openHours),
    isOpen,
    nextOpenTime: nextOpen,
    categories,
    latestMvrcReport: vendor.mvrcReports[0] || null,
    upi: vendor.upiId ? {
      upiId: vendor.upiId,
      qrImageUrl: vendor.upiQrImageUrl,
    } : null,
  });
});
