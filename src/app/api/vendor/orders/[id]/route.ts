// GET /api/vendor/orders/[id] — Get vendor order detail
// POST /api/vendor/orders/[id]/accept, reject, preparing, ready, complete

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireVendor } from '@/lib/auth';
import { successResponse, notFoundResponse, withErrorHandler } from '@/lib/api-response';

export const GET = withErrorHandler(async (request: NextRequest, context) => {
  const vendor = requireVendor(request);
  const { id } = await context!.params;

  const order = await prisma.order.findFirst({
    where: { id, vendorId: vendor.vendorId },
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
  });

  if (!order) {
    return notFoundResponse('Order');
  }

  return successResponse({
    ...order,
    statusTimeline: JSON.parse(order.statusTimeline),
    items: order.items.map((i) => ({
      ...i,
      selectedOptions: JSON.parse(i.selectedOptions),
    })),
  });
});
