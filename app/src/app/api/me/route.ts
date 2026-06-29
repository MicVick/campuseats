// GET /api/me — Get current user profile
// PATCH /api/me — Update user profile (name)

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireStudent } from '@/lib/auth';
import { updateProfileSchema } from '@/lib/validations';
import { successResponse, withErrorHandler } from '@/lib/api-response';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const student = requireStudent(request);

  const user = await prisma.user.findUnique({
    where: { id: student.userId },
    select: {
      id: true,
      name: true,
      email: true,
      authProvider: true,
      createdAt: true,
    },
  });

  return successResponse(user);
});

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const student = requireStudent(request);
  const body = await request.json();
  const data = updateProfileSchema.parse(body);

  const user = await prisma.user.update({
    where: { id: student.userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      authProvider: true,
      createdAt: true,
    },
  });

  return successResponse(user);
});
