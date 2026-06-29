// POST /api/vendor/orders/[id]/ready — Mark order as ready for pickup

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireVendor } from '@/lib/auth';
import { successResponse, notFoundResponse, errorResponse, withErrorHandler } from '@/lib/api-response';
import { addStatusToTimeline } from '@/lib/utils';

export const POST = withErrorHandler(async (request: NextRequest, context) => {
  const vendor = requireVendor(request);
  const { id } = await context!.params;

  const order = await prisma.order.findFirst({
    where: { id, vendorId: vendor.vendorId },
  });

  if (!order) return notFoundResponse('Order');
  if (!['accepted', 'preparing'].includes(order.status)) {
    return errorResponse(`Cannot mark as ready from "${order.status}" status`, 400);
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: 'ready_for_pickup',
      statusTimeline: addStatusToTimeline(order.statusTimeline, 'ready_for_pickup'),
    },
  });

  return successResponse({ ...updated, statusTimeline: JSON.parse(updated.statusTimeline) });
});
