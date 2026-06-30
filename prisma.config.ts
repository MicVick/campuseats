import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 moved connection URLs out of schema.prisma into this config file.
// The CLI (db push / migrate) uses `datasource.url` below; prefer the direct
// (non-pooling) connection so migrations aren't run over PgBouncer.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.DATABASE_URL ||
      "",
  },
  migrations: {
    path: "prisma/migrations",
  },
});
