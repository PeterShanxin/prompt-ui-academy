import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateCourseProgress,
  createEmptyProgress,
  firstLoginMerge,
  getAccountProgressKey,
  getNextLessonId,
  migrateLegacyTerms,
  recordQuizResult,
  setProgressItem,
} from "../app/lib/learning-progress.ts";

test("migrates valid legacy term ids without duplicates", () => {
  const migrated = migrateLegacyTerms(
    JSON.stringify(["modal", "modal", "unknown", 7, "toast"]),
    "2026-07-18T08:00:00.000Z",
  );

  assert.deepEqual(
    migrated.items.map(({ kind, itemId, completed }) => ({
      kind,
      itemId,
      completed,
    })),
    [
      { kind: "term", itemId: "modal", completed: true },
      { kind: "term", itemId: "toast", completed: true },
    ],
  );
});

test("course progress starts at zero and gives equal weight to nine lessons", () => {
  const empty = createEmptyProgress();
  const oneLesson = setProgressItem(empty, {
    kind: "lesson",
    itemId: "ui-components-patterns-structure",
    completed: true,
    updatedAt: "2026-07-18T08:00:00.000Z",
  });

  assert.equal(calculateCourseProgress(empty), 0);
  assert.equal(calculateCourseProgress(oneLesson), 11);
  assert.equal(getNextLessonId(oneLesson), "ui-navigation-inputs");
});

test("quiz results retain the highest score and complete the review lesson", () => {
  const first = recordQuizResult(
    createEmptyProgress(),
    3,
    4,
    "2026-07-18T08:00:00.000Z",
  );
  const lower = recordQuizResult(
    first,
    2,
    4,
    "2026-07-18T09:00:00.000Z",
  );

  assert.equal(
    lower.items.find((item) => item.kind === "quiz")?.bestScore,
    3,
  );
  assert.equal(
    lower.items.find(
      (item) =>
        item.kind === "lesson" && item.itemId === "prompt-quiz-review",
    )?.completed,
    true,
  );
});

test("first-login merge is additive and uses the highest quiz score", () => {
  const cloud = recordQuizResult(
    setProgressItem(createEmptyProgress(), {
      kind: "lesson",
      itemId: "ui-components-patterns-structure",
      completed: true,
      updatedAt: "2026-07-18T08:00:00.000Z",
    }),
    2,
    4,
    "2026-07-18T08:00:00.000Z",
  );
  const guest = recordQuizResult(
    setProgressItem(createEmptyProgress(), {
      kind: "lesson",
      itemId: "motion-enter-exit",
      completed: true,
      updatedAt: "2026-07-18T09:00:00.000Z",
    }),
    4,
    4,
    "2026-07-18T09:00:00.000Z",
  );

  const merged = firstLoginMerge(cloud, guest);

  assert.equal(calculateCourseProgress(merged), 33);
  assert.equal(
    merged.items.find((item) => item.kind === "quiz")?.bestScore,
    4,
  );
});

test("account caches use isolated storage keys", () => {
  assert.equal(
    getAccountProgressKey("user-a"),
    "prompt-ui-progress:v2:account:user-a",
  );
  assert.notEqual(getAccountProgressKey("user-a"), getAccountProgressKey("user-b"));
});
