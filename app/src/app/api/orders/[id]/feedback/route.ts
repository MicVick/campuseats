// POST /api/orders/[id]/feedback — Submit food feedback for an order

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireStudent } from '@/lib/auth';
import { foodFeedbackSchema } from '@/lib/validations';
import { successResponse, notFoundResponse, errorResponse, createdResponse, withErrorHandler } from '@/lib/api-response';

export const POST = withErrorHandler(async (request: NextRequest, context) => {
  const student = requireStudent(request);
  const { id } = await context!.params;
  const body = await request.json();
  const data = foodFeedbackSchema.parse(body);

  // Verify order
  const order = await prisma.order.findFirst({
    where: { id, userId: student.userId },
    include: { feedback: true },
  });

  if (!order) {
    return notFoundResponse('Order');
  }

  if (order.status !== 'completed') {
    return errorResponse('You can only leave feedback for completed orders.', 400);
  }

  // Upsert feedback (update if exists)
  const feedback = order.feedback
    ? await prisma.foodFeedback.update({
        where: { id: order.feedback.id },
        data: {
          foodQuality: data.foodQuality,
          hygiene: data.hygiene,
          valueForMoney: data.valueForMoney,
          itemComments: data.itemComments,
          comments: data.comments,
          isFlaggedForMvrc: data.flagForMvrc,
        },
      })
    : await prisma.foodFeedback.create({
        data: {
          orderId: id,
          userId: student.userId,
          vendorId: order.vendorId,
          foodQuality: data.foodQuality,
          hygiene: data.hygiene,
          valueForMoney: data.valueForMoney,
          itemComments: data.itemComments,
          comments: data.comments,
          isFlaggedForMvrc: data.flagForMvrc,
        },
      });

  return createdResponse(feedback);
});
