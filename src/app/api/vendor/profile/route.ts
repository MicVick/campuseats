// GET /api/vendor/profile — Get vendor profile
// PATCH /api/vendor/profile — Update vendor profile

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireVendor } from '@/lib/auth';
import { updateVendorProfileSchema } from '@/lib/validations';
import { successResponse, notFoundResponse, withErrorHandler } from '@/lib/api-response';
import { parseCuisineTags, parseOpenHoursJson } from '@/lib/utils';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const vendor = requireVendor(request);

  const profile = await prisma.vendor.findUnique({
    where: { id: vendor.vendorId },
  });

  if (!profile) return notFoundResponse('Vendor');

  return successResponse({
    ...profile,
    cuisineTags: parseCuisineTags(profile.cuisineTags),
    openHours: parseOpenHoursJson(profile.openHours),
  });
});

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const vendor = requireVendor(request);
  const body = await request.json();
  const data = updateVendorProfileSchema.parse(body);

  // Transform cuisineTags array to JSON string for SQLite
  const updateData: Record<string, unknown> = { ...data };
  if (data.cuisineTags) {
    updateData.cuisineTags = JSON.stringify(data.cuisineTags);
  }
  if (data.openHours) {
    updateData.openHours = JSON.stringify(data.openHours);
  }

  const updated = await prisma.vendor.update({
    where: { id: vendor.vendorId },
    data: updateData,
  });

  return successResponse({
    ...updated,
    cuisineTags: parseCuisineTags(updated.cuisineTags),
    openHours: parseOpenHoursJson(updated.openHours),
  });
});
