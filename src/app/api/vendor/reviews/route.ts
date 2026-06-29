// GET /api/vendor/reviews — List student reviews for this vendor
// GET /api/vendor/feedback — List food feedback for this vendor

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireVendor } from '@/lib/auth';
import { successResponse, withErrorHandler } from '@/lib/api-response';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const vendor = requireVendor(request);
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'reviews';

  if (type === 'feedback') {
    const feedback = await prisma.foodFeedback.findMany({
      where: { vendorId: vendor.vendorId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
      },
    });

    return successResponse(feedback);
  }

  // Default: reviews
  const reviews = await prisma.review.findMany({
    where: { vendorId: vendor.vendorId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
    },
  });

  return successResponse(reviews);
});
