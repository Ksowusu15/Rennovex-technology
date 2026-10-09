const assert = require("node:assert/strict");
require("tsx/cjs");
const { sendTransactionalEmail, emailSender } = require("../lib/email.ts");
const original = { ...process.env };
const originalFetch = global.fetch;
(async () => {
  process.env.RESEND_API_KEY = "test-only-key";
  process.env.ADMIN_FROM_EMAIL = "admin@example.test";
  delete process.env.RESEND_FROM_EMAIL;
  assert.equal(emailSender("client"), "admin@example.test");
  global.fetch = async () => new Response("{}", { status: 200 });
  await sendTransactionalEmail({
    from: "admin@example.test",
    to: "test@example.test",
    subject: "Test",
    text: "Test",
  });
  global.fetch = async () => new Response("rejected", { status: 403 });
  await assert.rejects(
    sendTransactionalEmail({
      from: "admin@example.test",
      to: "test@example.test",
      subject: "Test",
    }),
    /rejected delivery/,
  );
  delete process.env.RESEND_API_KEY;
  await assert.rejects(
    sendTransactionalEmail({
      from: "admin@example.test",
      to: "test@example.test",
      subject: "Test",
    }),
    /RESEND_API_KEY/,
  );
  console.log(
    "PASS: email sender fallback, accepted request, provider rejection and missing configuration (mocked; no email sent).",
  );
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    global.fetch = originalFetch;
    for (const key of Object.keys(process.env))
      if (!(key in original)) delete process.env[key];
    Object.assign(process.env, original);
  });
