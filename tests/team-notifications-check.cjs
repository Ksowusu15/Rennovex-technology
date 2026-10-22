const assert = require('node:assert/strict');
const Module = require('node:module');
require('tsx/cjs');
const originalLoad = Module._load;
const originalFetch = global.fetch;
const originalEnv = { ...process.env };
const originalError = console.error;
const nextServer = require('next/server');
const tasks = [], deliveries = [], jobs = new Map();
let rejectEmail = false, rejectDatabase = false, rejectQueue = false;
let savedCount = 0, sequence = 0;
function matches(job, where) {
  return (!where.id || job.id === where.id) &&
    (!where.status || job.status === where.status) &&
    (!where.attempts?.lt || job.attempts < where.attempts.lt) &&
    (!where.attempts?.gte || job.attempts >= where.attempts.gte) &&
    (!where.nextAttemptAt || job.nextAttemptAt <= where.nextAttemptAt.lte) &&
    (!where.OR || !job.lockedUntil || job.lockedUntil <= where.OR[1].lockedUntil.lte);
}
function update(job, data) {
  const { attempts, ...other } = data;
  Object.assign(job, other);
  if (attempts !== undefined) job.attempts = typeof attempts === 'number' ? attempts : job.attempts + attempts.increment;
}
const notificationJob = {
  create: async ({ data }) => {
    if (rejectQueue) throw new Error('Queue unavailable');
    const job = { id: `job-${++sequence}`, status: 'PENDING', attempts: 0,
      nextAttemptAt: new Date(), lockedUntil: null, ...data };
    jobs.set(job.id, job);
    return { ...job };
  },
  updateMany: async ({ where, data }) => {
    let count = 0;
    for (const job of jobs.values()) if (matches(job, where)) { update(job, data); count++; }
    return { count };
  },
  findUniqueOrThrow: async ({ where }) => ({ ...jobs.get(where.id) }),
  update: async ({ where, data }) => { update(jobs.get(where.id), data); },
  findMany: async ({ where, take }) => [...jobs.values()].filter(job => matches(job, where)).slice(0, take),
};
const model = { create: async () => {
  if (rejectDatabase) throw new Error('Database unavailable');
  savedCount++;
  return { id: 'saved-test', reference: 'RNX-TEST' };
} };
const prisma = {
  consultationBooking: model, quoteRequest: model, message: model, supportRequest: model,
  notificationJob, authRateLimit: { deleteMany: async () => ({ count: 0 }) },
  $transaction: async callback => {
    const before = savedCount;
    try { return await callback(prisma); } catch (error) { savedCount = before; throw error; }
  },
};
Module._load = function (name, ...args) {
  if (name === 'next/server') return { ...nextServer, after: task => tasks.push(task) };
  if (name === '@/lib/request-origin') return { rejectCrossOrigin: () => null };
  if (name === '@/lib/rate-limit') return { rateLimit: () => ({ allowed: true }) };
  if (name === '@/lib/client-auth') return {
    getClientSession: async () => ({ id: 'client-test', name: 'Test client', email: 'client@example.test' }),
  };
  if (name === '@/lib/prisma') return { prisma };
  return originalLoad.call(this, name, ...args);
};
(async () => {
  console.error = () => {};
  Object.assign(process.env, {
    RESEND_API_KEY: 'test-only', CONTACT_FROM_EMAIL: 'sender@example.test',
    CONTACT_NOTIFICATION_EMAIL: 'team@example.test', APP_URL: 'https://rennovex.example.test',
  });
  global.fetch = async (_url, options) => {
    deliveries.push({ ...JSON.parse(options.body), idempotency: options.headers['Idempotency-Key'] });
    return new Response('{}', { status: rejectEmail ? 503 : 200 });
  };
  const person = { name: 'Test client', email: 'client@example.test' };
  const routes = [
    ['bookings', { ...person, preferredDate: '2030-06-10T09:30:00+05:30' }, '/admin/bookings'],
    ['quotes', { ...person, service: 'Website Development', requirements: 'A website for our business.' }, '/admin/quotes'],
    ['messages', { ...person, message: 'Please discuss our website.' }, '/admin/messages'],
    ['client-support', { subject: 'Project assistance', message: 'Please help with the project.' }, '/admin/clients/client-test'],
  ];
  for (const [name, payload, dashboard] of routes) {
    const { POST } = require(`../app/api/${name}/route.ts`);
    const request = input => new Request('https://rennovex.example.test/api/' + name, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input || payload),
    });
    const count = deliveries.length;
    assert.ok((await POST(request())).ok, name);
    assert.equal(deliveries.length, count, 'No email before commit/after callback');
    assert.equal(tasks.length, 1);
    await tasks.shift()();
    const sent = deliveries.at(-1);
    assert.equal(sent.to, 'team@example.test');
    assert.equal(sent.reply_to, person.email);
    assert.ok(sent.text.includes(dashboard));
    assert.ok(sent.idempotency.startsWith('notification/'));
    rejectEmail = true;
    assert.ok((await POST(request())).ok);
    await tasks.shift()();
    const job = [...jobs.values()].at(-1);
    assert.equal(job.status, 'PENDING');
    assert.equal(job.attempts, 1);
    assert.ok(job.lastError);
    rejectEmail = false;
    job.nextAttemptAt = new Date(0);
    const { deliverNotification } = require('../lib/team-notifications.ts');
    await Promise.all([deliverNotification(job.id), deliverNotification(job.id)]);
    assert.equal(job.status, 'SENT');
    assert.equal(job.attempts, 2, 'Only one concurrent worker claims the retry');
    assert.equal(deliveries.at(-1).idempotency, `notification/${job.id}`);
    const saved = savedCount;
    rejectQueue = true;
    assert.equal((await POST(request())).ok, false);
    assert.equal(savedCount, saved, 'Request rolls back if queue insert fails');
    assert.equal(tasks.length, 0);
    rejectQueue = false;
    rejectDatabase = true;
    assert.equal((await POST(request())).ok, false);
    assert.equal(tasks.length, 0);
    rejectDatabase = false;
    if (name === 'bookings') {
      assert.equal((await POST(request({ ...payload, preferredDate: '2030-06-10T09:30' }))).status, 400);
    }
  }
  const { queueTeamNotification, deliverNotification, retryPendingNotifications } = require('../lib/team-notifications.ts');
  delete process.env.CONTACT_NOTIFICATION_EMAIL;
  const id = await queueTeamNotification({ subject: 'Test\r\nsubject', replyTo: person.email,
    fields: [['Message', 'Test message']], dashboardPath: '/admin/messages' }, prisma);
  assert.equal(jobs.get(id).payload.to, 'rennovextechnology@gmail.com');
  assert.equal(jobs.get(id).payload.subject, 'Test  subject');
  delete process.env.RESEND_API_KEY;
  await deliverNotification(id);
  assert.equal(jobs.get(id).status, 'PENDING');
  jobs.get(id).attempts = 5;
  jobs.get(id).nextAttemptAt = new Date(0);
  await deliverNotification(id);
  assert.equal(jobs.get(id).status, 'FAILED');
  const orphan = jobs.get(id);
  orphan.status = 'PENDING'; orphan.lockedUntil = new Date(0);
  await retryPendingNotifications();
  assert.equal(orphan.status, 'FAILED', 'Crashed final attempt becomes visible failure');
  const { GET } = require('../app/api/cron/notifications/route.ts');
  delete process.env.CRON_SECRET;
  assert.equal((await GET(new Request('https://example.test/api/cron/notifications'))).status, 401);
  process.env.CRON_SECRET = 'test-only-cron';
  assert.equal((await GET(new Request('https://example.test/api/cron/notifications', { headers: { authorization: 'Bearer wrong' } }))).status, 401);
  console.log('PASS: transactional alerts for four routes, offset validation, provider retries, concurrent claims, stable idempotency, failure state and worker authorization (mocked; no mail sent).');
})().catch(error => { originalError(error); process.exitCode = 1; }).finally(() => {
  Module._load = originalLoad; global.fetch = originalFetch; console.error = originalError;
  for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key];
  Object.assign(process.env, originalEnv);
});
