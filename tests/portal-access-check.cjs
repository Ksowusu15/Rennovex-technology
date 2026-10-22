const assert = require('node:assert/strict');
const Module = require('node:module');
require('tsx/cjs');
const originalLoad = Module._load;
const calls = [];
const capture = model => ({
  count: async args => { calls.push({ model, ...args }); return 0; },
  findMany: async args => { calls.push({ model, ...args }); return []; },
});
Module._load = function(name, ...args) {
  if (name === '@/lib/client-workspace') return {
    requirePortalClient: async () => ({ id: 'authenticated-client', name: 'Test Client' }),
    invoiceTotals: () => [],
  };
  if (name === '@/lib/prisma') return { prisma: {
    clientProject: capture('projects'), clientInvoice: capture('invoices'),
    supportRequest: capture('support'), clientFile: capture('files'), clientUpdate: capture('updates'),
  } };
  return originalLoad.call(this, name, ...args);
};
(async () => {
  for (const route of ['dashboard', 'projects', 'invoices', 'support']) {
    calls.length = 0;
    const page = require(`../app/client-portal/${route}/page.tsx`).default;
    await page({ searchParams: Promise.resolve({ page: '999', status: 'completed' }) });
    assert.ok(calls.length > 0, route);
    for (const query of calls) {
      assert.equal(query.model === 'files' ? query.where.project.clientId : query.where.clientId,
        'authenticated-client', `${route}: ${query.model} must be scoped to the authenticated client`);
      if (query.model === 'invoices') {
        assert.ok(query.where.status.not === 'DRAFT' || query.where.status.notIn?.includes('DRAFT'), 'Draft invoices must be excluded');
      }
      if (query.skip !== undefined) assert.equal(query.skip, 0, 'Empty result pagination clamps to page 1');
    }
  }
  console.log('PASS: all client workspace queries stay account-scoped; drafts hidden; pagination bounded.');
})().catch(error => { console.error(error); process.exitCode=1; }).finally(() => { Module._load = originalLoad; });
