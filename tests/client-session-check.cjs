const assert = require("node:assert/strict");
const Module = require("node:module");
require("tsx/cjs");
const originalLoad = Module._load;
const originalSecret = process.env.AUTH_SECRET;
process.env.AUTH_SECRET = "test-only-random-secret-for-session-tests-0123456789";
const cookies = new Map();
let client = {
  id: "client-1",
  email: "client@example.test",
  name: "Client",
  password: "bcrypt-hash-one",
  isActive: true,
};
Module._load = function (name, parent, isMain) {
  if (name === "next/headers")
    return {
      cookies: async () => ({
        get: (key) => (cookies.has(key) ? { value: cookies.get(key) } : undefined),
        set: (key, value) => cookies.set(key, value),
        delete: (key) => cookies.delete(key),
      }),
    };
  if (name === "@/lib/prisma")
    return {
      prisma: { client: { findUnique: async () => client } },
    };
  return originalLoad.call(this, name, parent, isMain);
};
const { createClientSession, getClientSession } = require("../lib/client-auth.ts");
Module._load = originalLoad;
(async () => {
  await createClientSession(client);
  assert.equal((await getClientSession()).id, "client-1");
  client.isActive = false;
  assert.equal(await getClientSession(), null);
  client.isActive = true;
  client.password = "bcrypt-hash-two";
  assert.equal(await getClientSession(), null);
  await createClientSession(client);
  assert.equal((await getClientSession()).id, "client-1");
  const { SignJWT } = await import("jose");
  const key = new TextEncoder().encode(process.env.AUTH_SECRET);
  const legacy = await new SignJWT({ type: "client", clientId: "client-1" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(key);
  cookies.set("rennovex_client_session", legacy);
  assert.equal(await getClientSession(), null);
  const expired = await new SignJWT({ type: "client", clientId: "client-1" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(1)
    .sign(key);
  cookies.set("rennovex_client_session", expired);
  assert.equal(await getClientSession(), null);
  cookies.set("rennovex_client_session", "invalid.token.signature");
  assert.equal(await getClientSession(), null);
  console.log(
    "PASS: valid client session, account deactivation, password revocation, renewed session and invalid signature.",
  );
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    if (originalSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = originalSecret;
  });
