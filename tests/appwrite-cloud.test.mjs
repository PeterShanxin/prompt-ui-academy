import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("uses Appwrite for optional cloud auth and progress", async () => {
  const [authProvider, accountControls, cloudProgress, packageJson] = await Promise.all([
    readFile(new URL("app/components/AuthProvider.tsx", root), "utf8"),
    readFile(new URL("app/components/AccountControls.tsx", root), "utf8"),
    readFile(new URL("app/lib/cloud-progress.ts", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
  ]);

  assert.doesNotMatch(`${authProvider}\n${cloudProgress}\n${packageJson}`, /supabase/i);
  assert.match(packageJson, /"appwrite"/);
  assert.match(packageJson, /"node-appwrite"/);
  assert.match(authProvider, /createEmailToken/);
  assert.match(authProvider, /createOAuth2Session/);
  assert.match(accountControls, /user\.name\.trim\(\)\.slice\(0, 1\)\s*\|\|/);
  assert.match(cloudProgress, /createJWT/);
  assert.match(cloudProgress, /\/api\/progress/);
});

test("ships repeatable private Appwrite database provisioning", () => {
  assert.equal(existsSync(new URL("scripts/setup-appwrite.mjs", root)), true);
  assert.equal(existsSync(new URL("app/lib/appwrite/server.ts", root)), true);
});

test("provisions three server-only tables and the cumulative metric seed", async () => {
  const setup = await readFile(new URL("scripts/setup-appwrite.mjs", root), "utf8");
  assert.match(setup, /learner_profiles/);
  assert.match(setup, /progress_records/);
  assert.match(setup, /community_metrics/);
  assert.match(setup, /permissions:\s*\[\]/g);
  assert.match(setup, /rowSecurity:\s*false/g);
  assert.match(setup, /cumulative_verified_accounts:\s*0/);
  assert.match(setup, /band_key:\s*"founding"/);
  assert.match(setup, /ensureDatabase/);
  assert.match(setup, /ensureTable/);
});

test("removes the obsolete Supabase migration and middleware", () => {
  assert.equal(
    existsSync(new URL("supabase/migrations/20260718081455_create_learning_progress.sql", root)),
    false,
  );
  assert.equal(existsSync(new URL("proxy.ts", root)), false);
});

test("keeps identity, raw counts, and deletion authority on the server", async () => {
  const routePaths = [
    "app/api/progress/route.ts",
    "app/api/progress/merge/route.ts",
    "app/api/community/route.ts",
    "app/api/account/delete/route.ts",
  ];
  for (const path of routePaths) assert.equal(existsSync(new URL(path, root)), true);

  const [progress, merge, community, deletion] = await Promise.all(
    routePaths.map((path) => readFile(new URL(path, root), "utf8")),
  );
  assert.match(`${progress}\n${merge}`, /requireAppwriteUser/);
  assert.doesNotMatch(`${progress}\n${merge}`, /body\.userId|record\.userId/);
  assert.match(community, /\{ band: metric\.band_key \}/);
  assert.doesNotMatch(community, /cumulative_verified_accounts\s*[,}]/);
  assert.match(deletion, /updateStatus[\s\S]+status: false[\s\S]+deleteRow[\s\S]+users\.delete/);
});
