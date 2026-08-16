// POST /api/auth/google
// Google Sign-In — verify ID token and ensure @iima.ac.in domain

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { googleAuthSchema } from '@/lib/validations';
import { generateStudentToken } from '@/lib/auth';
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api-response';
import { isProductionEnv } from '@/lib/env';

// Google token verification
// In production, use google-auth-library's OAuth2Client.verifyIdToken()
// For MVP, we decode the JWT payload (the frontend sends the credential from Google Identity Services)

async function verifyGoogleToken(idToken: string): Promise<{ email: string; name: string } | null> {
  try {
    // Try using google-auth-library if available
    const { OAuth2Client } = await import('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return null;
    
    return {
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
    };
  } catch {
    // Fallback for dev/mock: decode JWT without verification. Never allowed in production.
    if (!isProductionEnv()) {
      try {
        const [, payloadB64] = idToken.split('.');
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
        return {
          email: payload.email,
          name: payload.name || payload.email?.split('@')[0] || 'Test User',
        };
      } catch {
        return null;
      }
    }
    return null;
  }
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { idToken } = googleAuthSchema.parse(body);

  const googleUser = await verifyGoogleToken(idToken);
  if (!googleUser) {
    return errorResponse('Invalid Google token. Please try again.', 401);
  }

  // Enforce IIMA domain
  if (!googleUser.email.endsWith('@iima.ac.in')) {
    return errorResponse(
      'Only @iima.ac.in Google accounts are allowed. Please sign in with your IIMA account.',
      403
    );
  }

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email: googleUser.email } });
  const isNewUser = !user;

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: googleUser.email,
        name: googleUser.name,
        authProvider: 'google',
      },
    });
  }

  // Generate JWT
  const token = generateStudentToken({
    userId: user.id,
    email: user.email,
  });

  return successResponse({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    isNewUser,
  });
});
