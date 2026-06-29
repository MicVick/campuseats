// POST /api/vendor/orders/[id]/reject — Reject an order

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireVendor } from '@/lib/auth';
import { successResponse, notFoundResponse, errorResponse, withErrorHandler } from '@/lib/api-response';
import { addStatusToTimeline } from '@/lib/utils';

export const POST = withErrorHandler(async (request: NextRequest, context) => {
  const vendor = requireVendor(request);
  const { id } = await context!.params;
  
  let reason: string | undefined;
  try {
    const body = await request.json();
    reason = body.reason;
  } catch { /* no body is fine */ }

  const order = await prisma.order.findFirst({
    where: { id, vendorId: vendor.vendorId },
  });

  if (!order) return notFoundResponse('Order');
  if (!['placed', 'accepted'].includes(order.status)) {
    return errorResponse(`Cannot reject order in "${order.status}" status`, 400);
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: 'rejected',
      rejectionReason: reason,
      statusTimeline: addStatusToTimeline(order.statusTimeline, 'rejected'),
    },
  });

  return successResponse({ ...updated, statusTimeline: JSON.parse(updated.statusTimeline) });
});
