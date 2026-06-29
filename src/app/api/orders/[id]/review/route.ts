// POST /api/orders/[id]/review — Submit a review for a completed order

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireStudent } from '@/lib/auth';
import { reviewSchema } from '@/lib/validations';
import { successResponse, notFoundResponse, errorResponse, createdResponse, withErrorHandler } from '@/lib/api-response';

export const POST = withErrorHandler(async (request: NextRequest, context) => {
  const student = requireStudent(request);
  const { id } = await context!.params;
  const body = await request.json();
  const { rating, text } = reviewSchema.parse(body);

  // Verify order
  const order = await prisma.order.findFirst({
    where: { id, userId: student.userId },
    include: { review: true },
  });

  if (!order) {
    return notFoundResponse('Order');
  }

  if (order.status !== 'completed') {
    return errorResponse('You can only review completed orders.', 400);
  }

  if (order.review) {
    return errorResponse('You have already reviewed this order.', 409);
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      orderId: id,
      userId: student.userId,
      vendorId: order.vendorId,
      rating,
      text,
    },
  });

  // Update vendor average rating
  const allReviews = await prisma.review.findMany({
    where: { vendorId: order.vendorId },
    select: { rating: true },
  });
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await prisma.vendor.update({
    where: { id: order.vendorId },
    data: {
      avgRating: Math.round(avgRating * 10) / 10,
      ratingCount: allReviews.length,
    },
  });

  return createdResponse(review);
});
