import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("saveCloudState reuses the learner activity timestamp instead of write time", async () => {
  const source = await readFile(
    new URL("../app/lib/cloud-progress.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /if \(!record\.lastRoute \|\| !record\.lastActivityAt\) return;/);
  assert.match(source, /last_activity_at: record\.lastActivityAt/);
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
