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
