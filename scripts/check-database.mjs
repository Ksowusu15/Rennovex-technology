import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import { PrismaClient } from "@prisma/client";
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production", {
  info() {},
  error() {},
});
const prisma = new PrismaClient();
try {
  await prisma.$queryRaw`SELECT 1`;
  const tables = [
    "User",
    "AuthSession",
    "Client",
    "ClientProject",
    "ClientInvoice",
    "SupportRequest",
    "CaseStudy",
    "SiteSetting",
  ];
  const found = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
  `;
  const names = new Set(found.map((row) => row.table_name));
  const missing = tables.filter((table) => !names.has(table));
  if (missing.length) throw new Error(`Missing tables: ${missing.join(", ")}`);
  // Prisma SELECTs also verify columns needed by the new authentication flow.
  await prisma.client.findFirst({
    select: {
      id: true,
      password: true,
      isActive: true,
      resetTokenHash: true,
      resetTokenExpires: true,
    },
  });
  await prisma.authSession.findFirst({
    select: { id: true, revokedAt: true, expiresAt: true },
  });
  console.log(
    "PASS: database connection, required tables and authentication columns.",
  );
  console.log(
    "Read-only check. Run npm run db:status to check migration history separately.",
  );
} catch {
  console.error(
    "FAIL: database verification. Check connection settings and migration status.",
  );
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
