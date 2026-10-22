import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
const prisma = new PrismaClient();
try {
  const [objects] = await prisma.$queryRaw`
    SELECT to_regclass('public."_prisma_migrations"')::text AS history,
           to_regclass('public."User"')::text AS users
  `;
  const history = objects.history ? await prisma.$queryRaw`
    SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations"
  ` : [];
  const active = history.filter(row => !row.rolled_back_at);
  const blockers = [];
  if (objects.users && !active.some(row => row.migration_name === '20260724000000_initial_schema' && row.finished_at)) {
    blockers.push('Existing core schema needs baseline verification/adoption; see RELEASE-READINESS.md.');
  }
  if (history.some(row => row.migration_name === '20261008230000_add_client_password_reset')) {
    blockers.push('Legacy password-reset migration name needs reviewed history reconciliation; see RELEASE-READINESS.md.');
  }
  if (active.some(row => !row.finished_at)) blockers.push('Unresolved failed migration records must be investigated.');
  for (const blocker of blockers) console.error('BLOCKED: ' + blocker);
  if (!blockers.length) console.log('PASS: no known migration-history adoption blockers. Verify the schema and pending migration status separately.');
  console.log('Read-only preflight. No schema, data or migration records were changed.');
  process.exitCode = blockers.length ? 1 : 0;
} catch {
  console.error('FAIL: migration preflight could not read the database. No changes were made.');
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
