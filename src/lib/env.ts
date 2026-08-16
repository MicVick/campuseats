// Environment helpers shared by server and client code.
// NOTE: process.env.NODE_ENV is inlined at build time by Next.js, so this
// check works correctly in both server (API routes) and client components.

const PROD_VALUES = new Set(['production', 'prod']);

export function isProductionEnv(): boolean {
  return PROD_VALUES.has((process.env.NODE_ENV || '').toLowerCase());
}
