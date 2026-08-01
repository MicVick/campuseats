// API Response Helpers
// Consistent response format for all API routes

import { NextResponse, NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { AuthError } from './auth';

// ─── Success Responses ──────────────────────────────────────────

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function createdResponse<T>(data: T) {
  return successResponse(data, 201);
}

// ─── Error Responses ────────────────────────────────────────────

export function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: { message } },
    { status }
  );
}

export function notFoundResponse(resource = 'Resource') {
  return errorResponse(`${resource} not found`, 404);
}

export function unauthorizedResponse(message = 'Authentication required') {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message = 'Access denied') {
  return errorResponse(message, 403);
}

export function conflictResponse(message: string) {
  return errorResponse(message, 409);
}

// ─── Error Handler (wraps route handlers) ────────────────────────

type RouteHandler = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof AuthError) {
        return unauthorizedResponse(error.message);
      }

      if (error instanceof ZodError) {
        const messages = error.issues.map((issue) => issue.message).join('; ');
        return errorResponse(`Validation error: ${messages}`, 422);
      }

      if (error instanceof Error) {
        // Don't leak internal errors in production, unless DEBUG_ERRORS is set
        // (temporary diagnostic flag — remove once the issue is identified)
        const expose =
          process.env.NODE_ENV === 'development' ||
          process.env.DEBUG_ERRORS === '1';
        const message = expose
          ? `${error.name}: ${error.message}`
          : 'An unexpected error occurred';
        return errorResponse(message, 500);
      }

      return errorResponse('An unexpected error occurred', 500);
    }
  };
}
