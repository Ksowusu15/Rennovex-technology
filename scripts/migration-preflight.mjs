import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { migrationHistoryBlockers } from './migration-history.mjs';
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
    SELECT migration_name, checksum, finished_at, rolled_back_at FROM "_prisma_migrations"
  ` : [];
  const resetSql = await readFile(new URL('../prisma/migrations/20261008230100_add_client_password_reset/migration.sql', import.meta.url));
  const normalized = resetSql.toString('utf8').replace(/\r\n/g, '\n');
  const resetChecksums = [resetSql, normalized, normalized.replace(/\n/g, '\r\n')]
    .map(content => createHash('sha256').update(content).digest('hex'));
  const blockers = migrationHistoryBlockers({ hasUsers: Boolean(objects.users), history, resetChecksums });
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
