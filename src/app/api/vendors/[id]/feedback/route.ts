// POST /api/vendors/[id]/feedback — General food feedback (not tied to an order)

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireStudent } from '@/lib/auth';
import { foodFeedbackSchema } from '@/lib/validations';
import { createdResponse, notFoundResponse, withErrorHandler } from '@/lib/api-response';

export const POST = withErrorHandler(async (request: NextRequest, context) => {
  const student = requireStudent(request);
  const { id } = await context!.params;
  const body = await request.json();
  const data = foodFeedbackSchema.parse(body);

  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) return notFoundResponse('Vendor');

  const feedback = await prisma.foodFeedback.create({
    data: {
      userId: student.userId,
      vendorId: id,
      orderId: null, // general feedback, not tied to an order
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
