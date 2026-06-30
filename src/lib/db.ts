import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

// Prisma 7 no longer reads the connection URL from schema.prisma — the runtime
// client requires a driver adapter. We use the pg adapter against the pooled
// connection string (works on Vercel's Node serverless runtime).
function buildAdapterConfig() {
  const raw =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    '';

  // Strip `sslmode` from the URL. Newer pg parses it from the connection string
  // and treats `require` as strict `verify-full`, which both overrides the
  // explicit `ssl` option below AND rejects Supabase's self-signed pooler
  // certificate (P1011 TlsConnectionError). Removing it lets our `ssl` setting
  // win: encrypted connection, no cert-chain verification.
  let connectionString = raw;
  try {
    const url = new URL(raw);
    url.searchParams.delete('sslmode');
    connectionString = url.toString();
  } catch {
    // not a parseable URL — use as-is
  }

  return { connectionString, ssl: { rejectUnauthorized: false } };
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () =>
  new PrismaClient({ adapter: new PrismaPg(buildAdapterConfig()) });

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
