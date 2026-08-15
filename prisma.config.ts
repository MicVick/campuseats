import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 moved connection URLs out of schema.prisma into this config file.
// The CLI (db push / migrate) uses `datasource.url` below.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "",
  },
  migrations: {
    path: "prisma/migrations",
  },
});
