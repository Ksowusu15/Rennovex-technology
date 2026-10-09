const assert = require("node:assert/strict");
require("tsx/cjs");
const { formRequest } = require("../lib/form-request.ts");
(async () => {
  global.fetch = async () => new Response('{"ok":true}', { status: 201 });
  assert.equal((await formRequest("/test", {})).status, 201);
  global.fetch = async () =>
    new Response('{"error":"Invalid email"}', { status: 400 });
  assert.equal(
    (await (await formRequest("/test", {})).json()).error,
    "Invalid email",
  );
  global.fetch = async () => {
    throw new TypeError("Failed to fetch");
  };
  await assert.rejects(formRequest("/test", {}), /Check your connection/);
  global.fetch = async () =>
    new Response("<html>Bad gateway</html>", { status: 502 });
  await assert.rejects(formRequest("/test", {}), /could not process/);
  const realSetTimeout = global.setTimeout;
  global.setTimeout = (callback) => realSetTimeout(callback, 5);
  global.fetch = async (_, options) => ({
    text: () =>
      new Promise((_, reject) => {
        options.signal.addEventListener("abort", () => reject(new Error("Aborted")));
      }),
  });
  await assert.rejects(formRequest("/test", {}), /taking longer/);
  global.setTimeout = realSetTimeout;
  console.log(
    "PASS: success, HTTP validation error, offline, invalid response and stalled body timeout.",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
