import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production", {
  info() {},
  error() {},
});

let failures = 0;
function check(name, valid, explanation) {
  console.log(
    `${valid ? "PASS" : "FAIL"}: ${name}${valid ? "" : ` — ${explanation}`}`,
  );
  if (!valid) failures += 1;
}
for (const name of ["DATABASE_URL", "DIRECT_URL"]) {
  let valid = false;
  try {
    const url = new URL(process.env[name]);
    valid =
      ["postgres:", "postgresql:"].includes(url.protocol) &&
      Boolean(url.hostname && url.username && url.password) &&
      ["require", "verify-ca", "verify-full"].includes(
        url.searchParams.get("sslmode"),
      ) &&
      !/[<>]|USER|PASSWORD|your-|HOST/.test(process.env[name]);
  } catch {
    /* Report the name, never the connection string. */
  }
  check(name, valid, "Set a real PostgreSQL connection URL with TLS.");
}
for (const name of ["APP_URL", "NEXT_PUBLIC_SITE_URL"]) {
  let valid = false;
  try {
    const url = new URL(process.env[name]);
    valid =
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !/localhost|\.example$/.test(url.hostname) &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash;
  } catch {
    /* Report without values. */
  }
  check(name, valid, "Use the HTTPS origin of the intended deployment.");
}
check(
  "Matching app and public URLs",
  Boolean(process.env.APP_URL && process.env.NEXT_PUBLIC_SITE_URL) &&
    process.env.APP_URL?.replace(/\/$/, "") ===
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, ""),
  "Keep both URLs aligned for this environment.",
);
check(
  "AUTH_SECRET",
  Boolean(
    process.env.AUTH_SECRET?.length >= 32 &&
    !/development-only|change.?me|placeholder/i.test(process.env.AUTH_SECRET),
  ),
  "Use a unique random secret of at least 32 characters.",
);
for (const name of [
  "RESEND_API_KEY",
  "CRON_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
]) {
  check(
    name,
    Boolean(process.env[name]?.trim()),
    "Configure this value before launch.",
  );
}
const adminFrom = process.env.ADMIN_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
const clientFrom = process.env.RESEND_FROM_EMAIL || process.env.ADMIN_FROM_EMAIL;
const contactFrom = process.env.CONTACT_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
for (const [name, value] of [
  ["Admin sender", adminFrom],
  ["Client sender", clientFrom],
  ["Contact sender", contactFrom],
]) {
  check(
    name,
    Boolean(value && /^(?:[^<>]+<)?[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+>?$/.test(value)),
    "Set a sender address on your verified Resend domain.",
  );
}
console.log(
  "Contact recipient: verify site settings or CONTACT_NOTIFICATION_EMAIL.",
);
console.log(
  "Values are hidden. Sender-domain ownership and actual delivery require live testing.",
);
process.exitCode = failures ? 1 : 0;
