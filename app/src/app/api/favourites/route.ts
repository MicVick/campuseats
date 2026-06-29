// GET/POST/DELETE /api/favourites — Manage favourite vendors

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireStudent } from '@/lib/auth';
import { addFavouriteSchema } from '@/lib/validations';
import { successResponse, createdResponse, errorResponse, withErrorHandler } from '@/lib/api-response';
import { parseCuisineTags } from '@/lib/utils';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const student = requireStudent(request);

  const favourites = await prisma.favourite.findMany({
    where: { userId: student.userId },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          cuisineTags: true,
          avgRating: true,
          ratingCount: true,
          mvrcRating: true,
          area: true,
          avgPrepTimeMins: true,
        },
      },
    },
  });

  return successResponse(
    favourites.map((f) => ({
      ...f.vendor,
      cuisineTags: parseCuisineTags(f.vendor.cuisineTags),
      favouriteId: f.id,
    }))
  );
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const student = requireStudent(request);
  const body = await request.json();
  const { vendorId } = addFavouriteSchema.parse(body);

  // Check if already favourited
  const existing = await prisma.favourite.findFirst({
    where: { userId: student.userId, vendorId },
  });

  if (existing) {
    return errorResponse('Already in favourites', 409);
  }

  const favourite = await prisma.favourite.create({
    data: { userId: student.userId, vendorId },
  });

  return createdResponse(favourite);
});

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const student = requireStudent(request);
  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get('vendorId');

  if (!vendorId) {
    return errorResponse('vendorId is required', 400);
  }

  await prisma.favourite.deleteMany({
    where: { userId: student.userId, vendorId },
  });

  return successResponse({ message: 'Removed from favourites' });
});
