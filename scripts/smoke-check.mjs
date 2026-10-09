const base = process.argv[2];
if (!base || !/^https?:\/\//.test(base)) {
  console.error("Usage: npm run smoke -- https://your-deployment-url");
  process.exit(1);
}
let failures = 0;
for (const path of [
  "/",
  "/about",
  "/services",
  "/projects",
  "/case-studies",
  "/contact",
  "/client-portal",
  "/admin/login",
  "/robots.txt",
  "/sitemap.xml",
  "/api/health",
]) {
  try {
    const response = await fetch(new URL(path, base), {
      signal: AbortSignal.timeout(20000),
      redirect: "manual",
    });
    const okay = response.status === 200;
    console.log(`${okay ? "PASS" : "FAIL"}: ${path} (${response.status})`);
    if (!okay) failures += 1;
    if (path === "/robots.txt" && okay) {
      const text = await response.text();
      if (
        !text.includes("Disallow: /client-portal") ||
        !text.includes("Disallow: /admin")
      ) {
        console.log("FAIL: robots exclusion");
        failures += 1;
      }
    }
  } catch {
    console.log(`FAIL: ${path} (unreachable or timed out)`);
    failures += 1;
  }
}
console.log(
  "Read-only route checks. Protected Vercel previews need an authenticated browser instead.",
);
console.log(
  "Successful statuses do not verify page content, email, forms or authenticated workflows.",
);
process.exitCode = failures ? 1 : 0;
