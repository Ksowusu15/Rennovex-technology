const assert = require('node:assert/strict');
const Module = require('node:module');
require('tsx/cjs');
const originalLoad = Module._load;
const originalFetch = global.fetch;
const originalEnv = { ...process.env };
const originalError = console.error;
const nextServer = require('next/server');
const tasks = [], deliveries = [];
let rejectEmail = false, rejectDatabase = false;
Module._load = function (name, ...args) {
  if (name === 'next/server') return { ...nextServer, after: task => tasks.push(task) };
  if (name === '@/lib/site-settings') return {
    getSiteSettings: async () => ({ contactEmail: 'fallback@example.test' }),
  };
  if (name === '@/lib/request-origin') return { rejectCrossOrigin: () => null };
  if (name === '@/lib/rate-limit') return { rateLimit: () => ({ allowed: true }) };
  if (name === '@/lib/client-auth') return {
    getClientSession: async () => ({
      id: 'client-test', name: 'Test client', email: 'client@example.test',
    }),
  };
  if (name === '@/lib/prisma') {
    const model = { create: async () => {
      if (rejectDatabase) throw new Error('Database unavailable');
      return { id: 'saved-test', reference: 'RNX-TEST' };
    } };
    return { prisma: {
      consultationBooking: model, quoteRequest: model,
      message: model, supportRequest: model,
    } };
  }
  return originalLoad.call(this, name, ...args);
};
(async () => {
  console.error = () => {};
  Object.assign(process.env, {
    RESEND_API_KEY: 'test-only', CONTACT_FROM_EMAIL: 'sender@example.test',
    CONTACT_NOTIFICATION_EMAIL: 'team@example.test',
    APP_URL: 'https://rennovex.example.test',
  });
  global.fetch = async (_url, options) => {
    deliveries.push(JSON.parse(options.body));
    return new Response('{}', { status: rejectEmail ? 403 : 200 });
  };
  const person = { name: 'Test client', email: 'client@example.test' };
  const routes = [
    ['bookings', { ...person,
      preferredDate: new Date(Date.now() + 86400000).toISOString(),
      service: 'Website Development',
    }, '/admin/bookings'],
    ['quotes', { ...person, service: 'Website Development',
      requirements: 'A website for our business.',
    }, '/admin/quotes'],
    ['messages', { ...person, message: 'Please discuss our website.' }, '/admin/messages'],
    ['client-support', { subject: 'Project assistance',
      message: 'Please help with the project.',
    }, '/admin/clients/client-test'],
  ];
  for (const [name, payload, dashboard] of routes) {
    const { POST } = require(`../app/api/${name}/route.ts`);
    const request = () => new Request('https://rennovex.example.test/api/' + name, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    assert.ok((await POST(request())).ok, name);
    assert.equal(tasks.length, 1);
    await tasks.shift()();
    const sent = deliveries.at(-1);
    assert.equal(sent.to, 'team@example.test');
    assert.equal(sent.reply_to, person.email);
    assert.ok(sent.text.includes(dashboard));
    rejectEmail = true;
    assert.ok((await POST(request())).ok);
    await tasks.shift()();
    rejectEmail = false;
    rejectDatabase = true;
    assert.equal((await POST(request())).ok, false);
    assert.equal(tasks.length, 0);
    rejectDatabase = false;
  }
  const { notifyTeam } = require('../lib/team-notifications.ts');
  const input = { subject: 'Test\r\nsubject', replyTo: person.email,
    fields: [['Message', 'Test message']], dashboardPath: '/admin/messages',
  };
  delete process.env.CONTACT_NOTIFICATION_EMAIL;
  await notifyTeam(input);
  assert.equal(deliveries.at(-1).to, 'rennovextechnology@gmail.com');
  assert.equal(deliveries.at(-1).subject, 'Test  subject');
  delete process.env.RESEND_API_KEY;
  const count = deliveries.length;
  await notifyTeam(input);
  assert.equal(deliveries.length, count);
  console.log('PASS: four alerts after saved requests; provider failure preserves success; failed saves send nothing; recipient fallback and missing config (mocked; no mail sent).');
})().catch(error => {
  originalError(error); process.exitCode = 1;
}).finally(() => {
  Module._load = originalLoad; global.fetch = originalFetch;
  console.error = originalError;
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) delete process.env[key];
  }
  Object.assign(process.env, originalEnv);
});
