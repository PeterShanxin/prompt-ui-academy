import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createEmptyProgress,
  selectStartupRecord,
  setProgressItem,
} from "../app/lib/learning-progress.ts";

function recordWithLesson(lessonId) {
  return setProgressItem(createEmptyProgress(), {
    kind: "lesson",
    itemId: lessonId,
    completed: true,
    updatedAt: "2026-07-20T08:00:00.000Z",
  });
}

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

test("a usable account snapshot outranks the guest restore on startup", () => {
  const guest = recordWithLesson("ui-navigation-inputs");
  const cachedAccount = recordWithLesson("prompt-five-part");

  // A signed-in learner, and a learner whose session has not resolved yet,
  // must see the account snapshot instead of a beat of guest numbers.
  assert.equal(
    selectStartupRecord({ guest, cachedAccount, accountSessionPossible: true }),
    cachedAccount,
  );
});

test("an unusable account snapshot never displaces the guest record", () => {
  const guest = recordWithLesson("ui-navigation-inputs");
  const cachedAccount = recordWithLesson("prompt-five-part");

  // Auth resolved signed out or disabled: no session reaches this device, so a
  // snapshot left by an expired session must not show its numbers.
  assert.equal(
    selectStartupRecord({ guest, cachedAccount, accountSessionPossible: false }),
    guest,
  );
  // No snapshot at all, and a snapshot that parsed to an empty record (missing,
  // malformed, or written for a brand-new account) are both worthless.
  assert.equal(
    selectStartupRecord({ guest, cachedAccount: null, accountSessionPossible: true }),
    guest,
  );
  assert.equal(
    selectStartupRecord({
      guest,
      cachedAccount: createEmptyProgress(),
      accountSessionPossible: true,
    }),
    guest,
  );
});

test("the startup restore delegates precedence and attributes the snapshot", async () => {
  const source = await readFile(
    new URL("../app/components/LearningProgressProvider.tsx", import.meta.url),
    "utf8",
  );

  const restore = source.slice(
    source.indexOf("const readCachedAccountRecord"),
    source.indexOf("setGuestRestored(true)"),
  );

  // The snapshot is read by owner, never by scanning for any account key, so a
  // second learner's leftovers can never be presented as this learner's.
  assert.match(restore, /getItem\(LAST_ACCOUNT_KEY\)/);
  assert.match(restore, /getAccountProgressKey\(accountId\)/);
  assert.doesNotMatch(restore, /localStorage\.key\(/);

  // The precedence decision lives in the tested pure helper.
  assert.match(restore, /selectStartupRecord\(\{/);
  assert.match(restore, /cachedAccount: readCachedAccountRecord\(\)/);
  assert.match(
    restore,
    /accountSessionPossible =\s*authStatusRef\.current === "loading" \|\| authStatusRef\.current === "signed_in"/,
  );

  // Guest progress still surfaces immediately when the guest record wins, and
  // the "local" badge waits for auth so it cannot churn into "synced".
  assert.match(
    restore,
    /startup === restored && authStatusRef\.current !== "loading"[\s\S]*?setSyncStatus\("local"\)/,
  );

  // Persisting an account record records its owner, otherwise the snapshot is
  // unattributable on the next mount.
  assert.match(source, /setItem\(LAST_ACCOUNT_KEY, userId\)/);
});

test("navigation alone never issues a cloud write", async () => {
  const source = await readFile(
    new URL("../app/components/LearningProgressProvider.tsx", import.meta.url),
    "utf8",
  );

  const start = source.indexOf("const noteActivity = useCallback");
  const noteActivity = source.slice(start, source.indexOf("\n  );", start));

  // Route notes update local state only. Routing them through apply() would
  // queue a cloud PUT and flip the badge to "syncing" on every page view.
  assert.doesNotMatch(noteActivity, /apply\(/);
  assert.doesNotMatch(noteActivity, /queueCloudSync\(/);
  assert.doesNotMatch(noteActivity, /setSyncStatus\(/);
  assert.doesNotMatch(noteActivity, /getAccountPendingKey\(/);
  assert.match(noteActivity, /persist\(next, user\.id\)/);
});

test("a route note never mirrors an account record into guest storage", async () => {
  const source = await readFile(
    new URL("../app/components/LearningProgressProvider.tsx", import.meta.url),
    "utf8",
  );

  const start = source.indexOf("const noteActivity = useCallback");
  const noteActivity = source.slice(start, source.indexOf("\n  );", start));

  // Before auth resolves, a null user does not mean "guest" -- the shown record
  // may be the account snapshot. Noting a route then would overwrite the
  // device's guest progress with it and later merge it into another account.
  assert.match(noteActivity, /authStatus === "loading"\) return/);
  assert.match(noteActivity, /\[authStatus, guestRestored/);

  // The signed-out branch reads the guest record itself rather than whatever
  // the startup restore put on screen, so the two can never be conflated.
  const split = noteActivity.indexOf("persist(next, user.id)");
  const signedIn = noteActivity.slice(0, split);
  const signedOut = noteActivity.slice(split);
  assert.match(signedIn, /setLastActivity\(recordRef\.current, route\)/);
  assert.match(signedOut, /setLastActivity\(guestRef\.current, route\)/);
  assert.match(signedOut, /replaceGuestRecord\(next\)/);
  assert.doesNotMatch(signedOut, /recordRef\.current/);
});

test("a resolved signed-out load drops the stale account snapshot", async () => {
  const source = await readFile(
    new URL("../app/components/LearningProgressProvider.tsx", import.meta.url),
    "utf8",
  );

  // A session that lapsed outside this tab leaves an account snapshot behind,
  // and no user-change cleanup runs for it on a fresh mount.
  assert.match(source, /const forgetAccountCache = useCallback/);
  assert.match(source, /if \(navigator\.onLine\) forgetAccountCache\(\)/);

  const forgetStart = source.indexOf("const forgetAccountCache");
  const forget = source.slice(forgetStart, source.indexOf("\n  }, []);", forgetStart));
  // Unflushed edits live in the pending key and must survive the cleanup.
  assert.doesNotMatch(forget, /getAccountPendingKey/);
});

test("internal navigation uses next/link so the progress provider stays mounted", async () => {
  const componentFiles = [
    "AppShell.tsx",
    "CoursePageViews.tsx",
    "HomePageView.tsx",
    "HomeQuickQuiz.tsx",
    "KnowledgeQuiz.tsx",
    "LearnOverview.tsx",
    "NextStop.tsx",
  ];

  for (const file of componentFiles) {
    const source = await readFile(
      new URL(`../app/components/${file}`, import.meta.url),
      "utf8",
    );
    // A raw <a href="/..."> is a full document load, which remounts
    // LearningProgressProvider and replays its guest-first startup sequence.
    assert.doesNotMatch(
      source,
      /<a[^>]*\shref=(?:"\/|\{)/,
      `${file} still uses a native anchor for an internal route`,
    );
  }

  const nextStop = await readFile(
    new URL("../app/components/NextStop.tsx", import.meta.url),
    "utf8",
  );
  assert.match(nextStop, /import Link from "next\/link"/);
  assert.match(nextStop, /<Link href=\{href\}>/);
});
