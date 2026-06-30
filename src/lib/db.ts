import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

// Prisma 7 no longer reads the connection URL from schema.prisma — the runtime
// client requires a driver adapter. We use the pg adapter against the pooled
// connection string (works on Vercel's Node serverless runtime).
const connectionString =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// The Vercel/Supabase Postgres pooler uses a self-signed certificate. Newer
// pg treats `sslmode=require` as strict `verify-full`, which rejects it, so we
// encrypt without verifying the cert chain.
const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      ssl: { rejectUnauthorized: false },
    }),
  });

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
