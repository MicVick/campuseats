// GET /api/vendor/orders — List orders for the authenticated vendor
// Query params: status, date

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireVendor } from '@/lib/auth';
import { successResponse, withErrorHandler } from '@/lib/api-response';

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
    const startOfDay = new Date(date + 'T00:00:00Z');
    const endOfDay = new Date(date + 'T23:59:59Z');
    where.placedAt = { gte: startOfDay, lte: endOfDay };
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
