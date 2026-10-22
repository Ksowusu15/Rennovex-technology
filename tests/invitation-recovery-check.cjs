const assert = require('node:assert/strict');
const Module = require('node:module');
require('tsx/cjs');
const originalLoad = Module._load;
const originalError = console.error;
let rejectEmail = false;
let client = {
  id: 'client-test', name: 'Test client', email: 'client@example.test', password: null,
  isActive: true, inviteTokenHash: 'previous-valid-hash', inviteTokenExpires: new Date(Date.now() + 600000),
  inviteDeliveryStatus: 'SENT',
};
Module._load = function(name, ...args) {
  if (name === '@/lib/prisma') return { prisma: { client: {
    findUniqueOrThrow: async () => ({ ...client }),
    updateMany: async ({ where, data }) => {
      for (const [key, value] of Object.entries(where)) if (client[key] !== value) return { count: 0 };
      Object.assign(client, data);
      return { count: 1 };
    },
  } } };
  if (name === '@/lib/app-url') return { getPublicAppUrl: () => 'https://rennovex.example.test' };
  if (name === '@/lib/email') return {
    emailSender: () => 'sender@example.test',
    sendTransactionalEmail: async () => { if (rejectEmail) throw new Error('Provider rejected'); },
  };
  return originalLoad.call(this, name, ...args);
};
(async () => {
  console.error = () => {};
  process.env.RESEND_API_KEY = 'test-only';
  const { deliverClientInvite } = require('../lib/client-invitations.ts');
  const previous = { ...client };
  rejectEmail = true;
  assert.equal(await deliverClientInvite(client), false);
  assert.equal(client.inviteTokenHash, previous.inviteTokenHash);
  assert.equal(client.inviteTokenExpires, previous.inviteTokenExpires);
  assert.equal(client.inviteDeliveryStatus, 'FAILED');
  rejectEmail = false;
  assert.equal(await deliverClientInvite(client), true);
  assert.notEqual(client.inviteTokenHash, previous.inviteTokenHash);
  assert.equal(client.inviteDeliveryStatus, 'SENT');
  client.password = 'activated-hash';
  await assert.rejects(deliverClientInvite(client), /awaiting activation/);
  client.password = null; client.isActive = false;
  await assert.rejects(deliverClientInvite(client), /awaiting activation/);
  console.log('PASS: failed invitation preserves previous link, resend succeeds, activated and inactive accounts cannot be reinvited (mocked; no mail sent).');
})().catch(error => { originalError(error); process.exitCode=1; }).finally(() => {
  Module._load = originalLoad; console.error = originalError; delete process.env.RESEND_API_KEY;
});
