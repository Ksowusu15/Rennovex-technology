const assert = require('node:assert/strict');
const databaseUrl = process.env.TEST_DATABASE_URL;
let address;
try { address = new URL(databaseUrl); } catch {}
if (process.env.ALLOW_LOCAL_RELEASE_TESTS !== '1' ||
    !address || !['127.0.0.1', 'localhost', '[::1]'].includes(address.hostname) ||
    address.pathname !== '/rennovex_release_test') {
  console.error('Refusing database tests: explicitly enable a disposable loopback rennovex_release_test database (see RELEASE-READINESS.md).');
  process.exit(1);
}
process.env.DATABASE_URL = databaseUrl;
process.env.DIRECT_URL = databaseUrl;
process.env.AUTH_SECRET = 'isolated-test-only-secret-012345678901234567890';
process.env.APP_URL = 'http://localhost:3000';
process.env.CONTACT_FROM_EMAIL = 'sender@example.test';
process.env.RESEND_API_KEY = 'mocked-test-only';
require('tsx/cjs');
const { prisma } = require('../lib/prisma.ts');
const { authThrottle } = require('../lib/auth-throttle.ts');
const { queueTeamNotification, deliverNotification, retryPendingNotifications } = require('../lib/team-notifications.ts');
const originalFetch = global.fetch, originalError = console.error;
const ids = [], references = [];
let rejectEmail = true, deliveries = 0;
(async () => {
  console.error = () => {};
  const account = `readiness-${Date.now()}@example.test`;
  const responses = await Promise.all(Array.from({ length: 14 }, (_, i) => authThrottle(
    new Request('http://localhost:3000/api/client-auth/login', { headers: { 'x-forwarded-for': `192.0.2.${i}` } }),
    account, 'integration',
  )));
  assert.equal(responses.filter(value => value === null).length, 10);
  assert.equal(responses.filter(value => value?.status === 429).length, 4);
  await prisma.authRateLimit.updateMany({ data: { expiresAt: new Date(0) } });
  assert.equal(await authThrottle(new Request('http://localhost:3000'), account, 'integration'), null);
  const originalQuery = prisma.$queryRaw;
  prisma.$queryRaw = async () => { throw new Error('database offline'); };
  assert.equal((await authThrottle(new Request('http://localhost:3000'), account)).status, 503);
  prisma.$queryRaw = originalQuery;
  global.fetch = async () => { deliveries++; return new Response('{}', { status: rejectEmail ? 503 : 200 }); };
  const input = { subject: 'Integration alert', replyTo: account, fields: [['Name', 'Test client']], dashboardPath: '/admin/bookings' };
  const reference = `TEST-${Date.now()}`; references.push(reference);
  const jobId = await prisma.$transaction(async tx => {
    await tx.consultationBooking.create({ data: { reference, name: 'Test client', email: account, preferredDate: new Date('2030-06-10T09:30:00Z') } });
    return queueTeamNotification(input, tx);
  });
  ids.push(jobId);
  await deliverNotification(jobId);
  let job = await prisma.notificationJob.findUniqueOrThrow({ where: { id: jobId } });
  assert.equal(job.status, 'PENDING');
  assert.equal(job.attempts, 1);
  assert.equal(await prisma.consultationBooking.count({ where: { reference } }), 1);
  rejectEmail = false;
  await prisma.notificationJob.update({ where: { id: jobId }, data: { nextAttemptAt: new Date(0) } });
  await Promise.all([deliverNotification(jobId), deliverNotification(jobId)]);
  job = await prisma.notificationJob.findUniqueOrThrow({ where: { id: jobId } });
  assert.equal(job.status, 'SENT');
  assert.equal(job.attempts, 2);
  assert.equal(deliveries, 2, 'One initial failure and one leased retry');
  const failedReference = `${reference}-rollback`; references.push(failedReference);
  process.env.APP_URL = 'invalid-url';
  await assert.rejects(prisma.$transaction(async tx => {
    await tx.consultationBooking.create({ data: { reference: failedReference, name: 'Rollback', email: account, preferredDate: new Date('2030-06-10') } });
    await queueTeamNotification(input, tx);
  }));
  process.env.APP_URL = 'http://localhost:3000';
  assert.equal(await prisma.consultationBooking.count({ where: { reference: failedReference } }), 0);
  await prisma.notificationJob.update({ where: { id: jobId }, data: { status: 'PENDING', attempts: 6, lockedUntil: new Date(0) } });
  await retryPendingNotifications();
  assert.equal((await prisma.notificationJob.findUniqueOrThrow({ where: { id: jobId } })).status, 'FAILED');
  console.log('PASS: PostgreSQL shared login buckets, expiry, fail-closed behavior, notification transaction/rollback, concurrent lease and retry recovery (isolated database; email mocked).');
})().catch(error => { originalError(error); process.exitCode=1; }).finally(async () => {
  global.fetch = originalFetch; console.error = originalError;
  await prisma.notificationJob.deleteMany({ where: { id: { in: ids } } });
  await prisma.consultationBooking.deleteMany({ where: { reference: { in: references } } });
  await prisma.authRateLimit.deleteMany();
  await prisma.$disconnect();
});
