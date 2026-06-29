// POST /api/vendor/orders/[id]/accept — Accept an order

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
  if (order.status !== 'placed') {
    return errorResponse(`Cannot accept order in "${order.status}" status`, 400);
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: 'accepted',
      statusTimeline: addStatusToTimeline(order.statusTimeline, 'accepted'),
    },
  });

  return successResponse({ ...updated, statusTimeline: JSON.parse(updated.statusTimeline) });
});
