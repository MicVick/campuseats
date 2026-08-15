import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@/generated/prisma/client';

// Prisma 7 no longer reads the connection URL from schema.prisma — the runtime
// client requires a driver adapter. We use the mariadb adapter (compatible with
// MySQL) against the connection string.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaMariaDb(process.env.DATABASE_URL || ''),
  });

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
