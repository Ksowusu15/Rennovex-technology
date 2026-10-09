const assert = require("node:assert/strict");
const Module = require("node:module");
require("tsx/cjs");
const originalLoad = Module._load;
let checks = 0;
Module._load = function (name, parent, isMain) {
  if (name === "@/lib/auth")
    return {
      requireRole: async (roles) => {
        assert.deepEqual(roles, ["SUPER_ADMIN", "ADMIN"]);
        checks += 1;
        throw new Error("Unauthorized");
      },
    };
  if (name === "next/cache") return { revalidatePath() {} };
  if (name === "@/lib/prisma")
    return {
      prisma: new Proxy(
        {},
        {
          get() {
            throw new Error("Database accessed before authorization");
          },
        },
      ),
    };
  if (name === "@/lib/client-invitations") return {};
  return originalLoad.call(this, name, parent, isMain);
};
const actions = require("../app/admin/clients/actions.ts");
Module._load = originalLoad;
(async () => {
  for (const action of Object.values(actions)) {
    await assert.rejects(action(new FormData()), /Unauthorized/);
  }
  assert.equal(checks, 12);
  console.log(
    "PASS: all 12 client management actions reject unauthorized callers before database access.",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
