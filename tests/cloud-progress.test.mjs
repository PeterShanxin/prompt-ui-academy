import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("cloud progress requests authenticate with a short-lived Appwrite JWT", async () => {
  const source = await readFile(
    new URL("../app/lib/cloud-progress.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /account\.createJWT\(\)/);
  assert.match(source, /Authorization: `Bearer \$\{jwt\}`/);
  assert.match(source, /body: JSON\.stringify\(\{ record \}\)/);
  assert.doesNotMatch(source, /body: JSON\.stringify\(\{[^}]*userId/);
});

test("signed-in sync ignores stale completions after the active user changes", async () => {
  const source = await readFile(
    new URL("../app/components/LearningProgressProvider.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /const syncContext = useRef\(0\)/);
  assert.match(source, /previousUserId\.current === userId/);
  assert.match(source, /contextVersion === syncContext\.current/);
});

test("initial cloud flush preserves a newer pending local edit", async () => {
  const source = await readFile(
    new URL("../app/components/LearningProgressProvider.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /const pendingBeforeSave = window\.localStorage\.getItem/);
  assert.match(source, /const pendingAfterSave = window\.localStorage\.getItem/);
  assert.match(source, /pendingAfterSave === pendingBeforeSave/);
  assert.match(source, /if \(pendingUnchanged\)[\s\S]+removeItem/);
  assert.match(source, /if \(!pendingUnchanged\) return/);
});

test("retries a failed first-login import through the additive merge", async () => {
  const source = await readFile(
    new URL("../app/components/LearningProgressProvider.tsx", import.meta.url),
    "utf8",
  );

  const queued = source.slice(source.indexOf("const queueCloudSync"));

  // The retry paths funnel through queueCloudSync. While the merge marker is
  // absent the sync must go to the merge endpoint, never the reconciling PUT.
  assert.match(queued, /getItem\(mergeKey\) !== "true"/);
  assert.match(queued, /await mergeGuestProgress\(account, guestRef\.current\)/);
  assert.match(queued, /setItem\(mergeKey, "true"\)/);
  assert.match(
    queued,
    /pending\.items\.length \|\| pending\.lastRoute[\s\S]{0,120}saveCloudProgress\(account, pending\)/,
  );

  // The guest record is mirrored into a ref so the retry sends the same
  // payload the initial import would have, without rebuilding the callback.
  assert.match(source, /const guestRef = useRef\(guestRecord\)/);
  assert.match(source, /guestRef\.current = next;\s*setGuestRecord\(next\)/);

  // Guest state is written only through replaceGuestRecord, so the ref can
  // never drift from the state the retry payload is read from.
  assert.equal(source.match(/setGuestRecord\(/g).length, 1);
});
