// GET /api/vendor/orders — List orders for the authenticated vendor
// Query params: status, date

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireVendor } from '@/lib/auth';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/api-response';
import { getCampusDayRange } from '@/lib/utils';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const vendor = requireVendor(request);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const date = searchParams.get('date'); // YYYY-MM-DD

  const where: Record<string, unknown> = { vendorId: vendor.vendorId };

  if (status) {
    where.status = status;
  }

  if (date) {
    try {
      const { start, end } = getCampusDayRange(date);
      where.placedAt = { gte: start, lt: end };
    } catch {
      return errorResponse('date must be a valid YYYY-MM-DD value', 422);
    }
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { placedAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
  });

  return successResponse(
    orders.map((order) => ({
      ...order,
      statusTimeline: JSON.parse(order.statusTimeline),
      items: order.items.map((i) => ({
        ...i,
        selectedOptions: JSON.parse(i.selectedOptions),
      })),
    }))
  );
});
