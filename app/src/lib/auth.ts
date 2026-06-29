// JWT Auth Utilities
// Handles token generation, verification, and extraction from requests

import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'campuseats-fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ─── Types ──────────────────────────────────────────────────────

export interface StudentTokenPayload {
  userId: string;
  email: string;
  type: 'student';
}

export interface VendorTokenPayload {
  vendorAccountId: string;
  vendorId: string;
  email: string;
  type: 'vendor';
}

export type TokenPayload = StudentTokenPayload | VendorTokenPayload;

// ─── Token Generation ───────────────────────────────────────────

export function generateStudentToken(payload: Omit<StudentTokenPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'student' }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
}

export function generateVendorToken(payload: Omit<VendorTokenPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'vendor' }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
}

// ─── Token Verification ─────────────────────────────────────────

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

// ─── Extract Token from Request ─────────────────────────────────

export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

// ─── Auth Helpers for Route Handlers ─────────────────────────────

export function getStudentFromRequest(request: NextRequest): StudentTokenPayload | null {
  const token = extractTokenFromRequest(request);
  if (!token) return null;
  
  try {
    const payload = verifyToken(token);
    if (payload.type !== 'student') return null;
    return payload as StudentTokenPayload;
  } catch {
    return null;
  }
}

export function getVendorFromRequest(request: NextRequest): VendorTokenPayload | null {
  const token = extractTokenFromRequest(request);
  if (!token) return null;
  
  try {
    const payload = verifyToken(token);
    if (payload.type !== 'vendor') return null;
    return payload as VendorTokenPayload;
  } catch {
    return null;
  }
}

// ─── Auth Guard (returns error response or payload) ──────────────

export function requireStudent(request: NextRequest): StudentTokenPayload {
  const student = getStudentFromRequest(request);
  if (!student) {
    throw new AuthError('Authentication required. Please log in with your IIMA email.');
  }
  return student;
}

export function requireVendor(request: NextRequest): VendorTokenPayload {
  const vendor = getVendorFromRequest(request);
  if (!vendor) {
    throw new AuthError('Vendor authentication required. Please log in.');
  }
  return vendor;
}

// ─── Custom Auth Error ──────────────────────────────────────────

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}
