// GET /api/vendors/[id]/mvrc-reports — List MVRC reports for a vendor

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, notFoundResponse, withErrorHandler } from '@/lib/api-response';

export const GET = withErrorHandler(async (request: NextRequest, context) => {
  const { id } = await context!.params;

  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) return notFoundResponse('Vendor');

  const reports = await prisma.mVRCReport.findMany({
    where: { vendorId: id },
    orderBy: { assessmentDate: 'desc' },
  });

  return successResponse(reports);
});
