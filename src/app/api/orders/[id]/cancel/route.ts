// POST /api/orders/[id]/cancel — Cancel an order

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireStudent } from '@/lib/auth';
import { successResponse, notFoundResponse, errorResponse, withErrorHandler } from '@/lib/api-response';
import { addStatusToTimeline } from '@/lib/utils';

export const POST = withErrorHandler(async (request: NextRequest, context) => {
  const student = requireStudent(request);
  const { id } = await context!.params;

  const order = await prisma.order.findFirst({
    where: { id, userId: student.userId },
  });

  if (!order) {
    return notFoundResponse('Order');
  }

  // Can only cancel before 'preparing'
  if (!['placed', 'accepted'].includes(order.status)) {
    return errorResponse(
      'Order cannot be cancelled once preparation has started.',
      400
    );
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status: 'cancelled',
      statusTimeline: addStatusToTimeline(order.statusTimeline, 'cancelled'),
    },
  });

  return successResponse({
    ...updatedOrder,
    statusTimeline: JSON.parse(updatedOrder.statusTimeline),
  });
});
