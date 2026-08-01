// GET /api/orders/[id] — Get order detail
// POST /api/orders/[id]/cancel — Cancel an order

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireStudent } from '@/lib/auth';
import { successResponse, notFoundResponse, withErrorHandler } from '@/lib/api-response';

export const GET = withErrorHandler(async (request: NextRequest, context) => {
  const student = requireStudent(request);
  const { id } = await context!.params;

  const order = await prisma.order.findFirst({
    where: { id, userId: student.userId },
    include: {
      vendor: {
        select: {
          name: true,
          imageUrl: true,
          area: true,
          upiId: true,
          upiQrImageUrl: true,
          avgPrepTimeMins: true,
        },
      },
      items: true,
      review: true,
      feedback: true,
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
