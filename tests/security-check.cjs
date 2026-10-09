const assert = require("node:assert/strict");
require("tsx/cjs");
const { getAuthSecret } = require("../lib/auth-secret.ts");
const { csvCell } = require("../lib/csv.ts");
const { newPasswordSchema } = require("../lib/password-policy.ts");
const { getPublicAppUrl } = require("../lib/app-url.ts");
const { rejectCrossOrigin } = require("../lib/request-origin.ts");
const { safeFileUrl } = require("../lib/safe-url.ts");
const { rateLimit } = require("../lib/rate-limit.ts");

const original = { ...process.env };
try {
  process.env.NODE_ENV = "production";
  delete process.env.AUTH_SECRET;
  assert.throws(getAuthSecret, /AUTH_SECRET/);
  process.env.AUTH_SECRET = "short";
  assert.throws(getAuthSecret, /32 characters/);
  process.env.AUTH_SECRET = "a".repeat(64);
  assert.equal(getAuthSecret().length, 64);

  delete process.env.APP_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXTAUTH_URL;
  assert.throws(
    () => getPublicAppUrl(new Request("https://attacker.test")),
    /required/,
  );
  process.env.APP_URL = "http://example.test";
  assert.throws(getPublicAppUrl, /HTTPS/);
  delete process.env.VERCEL;
  delete process.env.VERCEL_ENV;
  for (const host of ["localhost", "127.0.0.1", "[::1]"]) {
    process.env.APP_URL = `http://${host}:3000`;
    assert.equal(getPublicAppUrl(), `http://${host}:3000`);
  }
  process.env.VERCEL = "1";
  assert.throws(getPublicAppUrl, /HTTPS/);
  delete process.env.VERCEL;
  process.env.VERCEL_ENV = "preview";
  assert.throws(getPublicAppUrl, /HTTPS/);
  delete process.env.VERCEL_ENV;
  for (const host of ["localhost.attacker.test", "192.168.1.100"]) {
    process.env.APP_URL = `http://${host}:3000`;
    assert.throws(getPublicAppUrl, /HTTPS/);
  }
  process.env.APP_URL = "ftp://localhost";
  assert.throws(getPublicAppUrl, /HTTP or HTTPS/);

  process.env.APP_URL = "https://rennovex.test";
  assert.equal(
    getPublicAppUrl(new Request("https://other.test")),
    "https://rennovex.test",
  );

  assert.equal(
    rejectCrossOrigin(
      new Request("https://rennovex.test/api/test", {
        headers: {
          origin: "https://rennovex.test",
          "sec-fetch-site": "same-origin",
        },
      }),
    ),
    null,
  );
  assert.equal(
    rejectCrossOrigin(
      new Request("https://rennovex.test/api/test", {
        headers: { origin: "https://attacker.test" },
      }),
    ).status,
    403,
  );
  assert.equal(
    rejectCrossOrigin(
      new Request("https://rennovex.test/api/test", {
        headers: { "sec-fetch-site": "cross-site" },
      }),
    ).status,
    403,
  );

  assert.equal(
    rejectCrossOrigin(
      new Request("http://localhost:3000/api/bookings", {
        headers: {
          origin: "http://192.168.1.100:3000",
          host: "192.168.1.100:3000",
        },
      }),
    ),
    null,
  );
  assert.equal(
    rejectCrossOrigin(
      new Request("https://rennovex.test/api/bookings", {
        headers: {
          origin: "https://attacker.test",
          host: "rennovex.test",
          "x-forwarded-host": "attacker.test",
        },
      }),
    ).status,
    403,
  );

  // LAN access or a proxy may leave an internal URL on the server.
  assert.equal(
    rejectCrossOrigin(
      new Request("http://localhost:3000/api/bookings", {
        headers: {
          origin: "http://192.168.1.100:3000",
          "sec-fetch-site": "same-origin",
        },
      }),
    ),
    null,
  );
  assert.equal(
    rejectCrossOrigin(
      new Request("http://localhost:3000/api/bookings", {
        headers: {
          origin: "https://rennovex.test",
          "sec-fetch-site": "cross-site",
        },
      }),
    ).status,
    403,
  );
  assert.equal(
    rejectCrossOrigin(
      new Request("https://rennovex.test/api/bookings", {
        headers: {
          origin: "https://untrusted.rennovex.test",
          "sec-fetch-site": "same-site",
        },
      }),
    ).status,
    403,
  );

  assert.equal(safeFileUrl("javascript:alert(1)"), null);
  assert.equal(safeFileUrl("https://user:password@example.test/file"), null);
  assert.equal(
    safeFileUrl("https://example.test/file.pdf"),
    "https://example.test/file.pdf",
  );
  assert.equal(
    csvCell('=HYPERLINK("https://example.test")').startsWith("\"'"),
    true,
  );
  assert.equal(csvCell("\t=1+1").startsWith("\"'"), true);
  assert.equal(csvCell('ordinary "text"'), '"ordinary ""text"""');
  assert.equal(newPasswordSchema.safeParse("Secure123!").success, true);
  assert.equal(newPasswordSchema.safeParse("weak").success, false);
  assert.equal(newPasswordSchema.safeParse("Aa1" + "界".repeat(24)).success, false);

  const request = new Request("https://rennovex.test", {
    headers: { "x-forwarded-for": "192.0.2.20" },
  });
  const bucket = `test-${Date.now()}`;
  assert.equal(rateLimit(request, bucket, 2, 60000).allowed, true);
  assert.equal(rateLimit(request, bucket, 2, 60000).allowed, true);
  assert.equal(rateLimit(request, bucket, 2, 60000).allowed, false);
  console.log(
    "PASS: production secrets, trusted URLs, origins, CSV safety, password policy and throttling.",
  );
} finally {
  for (const key of Object.keys(process.env))
    if (!(key in original)) delete process.env[key];
  Object.assign(process.env, original);
}
