export const PROGRESS_SCHEMA_VERSION = 2;
export const LEGACY_TERMS_KEY = "ui-language-progress";
export const GUEST_PROGRESS_KEY = "prompt-ui-progress:v2:guest";

export const LESSON_IDS = [
  "ui-components-patterns-structure",
  "ui-navigation-inputs",
  "ui-overlays-feedback",
  "motion-enter-exit",
  "motion-duration-easing",
  "motion-spring-stagger",
  "prompt-five-part",
  "prompt-vague-to-precise",
  "prompt-quiz-review",
] as const;

export const TERM_IDS = [
  "button",
  "modal",
  "toast",
  "tooltip",
  "tabs",
  "accordion",
  "toggle",
  "skeleton",
] as const;

export const QUIZ_ID = "ui-vocabulary-v1";
export const LAB_ID = "prompt-lab-v1";

export type LessonId = (typeof LESSON_IDS)[number];
export type ProgressKind = "lesson" | "term" | "quiz" | "lab";

export type ProgressItem = {
  kind: ProgressKind;
  itemId: string;
  completed: boolean;
  bestScore?: number;
  updatedAt: string;
};

export type LearningProgressRecord = {
  schemaVersion: typeof PROGRESS_SCHEMA_VERSION;
  items: ProgressItem[];
  lastRoute: string | null;
  lastActivityAt: string | null;
};

const learningRoutes = new Set([
  "/learn",
  "/dictionary",
  "/motion",
  "/quiz",
  "/lab",
]);

const validIds: Record<ProgressKind, ReadonlySet<string>> = {
  lesson: new Set(LESSON_IDS),
  term: new Set(TERM_IDS),
  quiz: new Set([QUIZ_ID]),
  lab: new Set([LAB_ID]),
};

export function createEmptyProgress(): LearningProgressRecord {
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    items: [],
    lastRoute: null,
    lastActivityAt: null,
  };
}

export function getAccountProgressKey(userId: string): string {
  return `prompt-ui-progress:v2:account:${userId}`;
}

export function getAccountMergeKey(userId: string): string {
  return `prompt-ui-progress:v2:merged:${userId}`;
}

export function getAccountPendingKey(userId: string): string {
  return `prompt-ui-progress:v2:pending:${userId}`;
}

export function migrateLegacyTerms(
  raw: string | null,
  updatedAt = new Date().toISOString(),
): LearningProgressRecord {
  if (!raw) return createEmptyProgress();

  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return createEmptyProgress();

    const seen = new Set<string>();
    const items = value.flatMap((item): ProgressItem[] => {
      if (
        typeof item !== "string" ||
        seen.has(item) ||
        !validIds.term.has(item)
      ) {
        return [];
      }
      seen.add(item);
      return [{ kind: "term", itemId: item, completed: true, updatedAt }];
    });

    return { ...createEmptyProgress(), items };
  } catch {
    return createEmptyProgress();
  }
}

export function parseProgressRecord(raw: string | null): LearningProgressRecord {
  if (!raw) return createEmptyProgress();

  try {
    const value: unknown = JSON.parse(raw);
    if (!isObject(value) || value.schemaVersion !== PROGRESS_SCHEMA_VERSION) {
      return createEmptyProgress();
    }

    const items = Array.isArray(value.items)
      ? value.items.flatMap((item): ProgressItem[] => {
          const parsed = parseItem(item);
          return parsed ? [parsed] : [];
        })
      : [];
    const lastRoute =
      typeof value.lastRoute === "string" && learningRoutes.has(value.lastRoute)
        ? value.lastRoute
        : null;
    const lastActivityAt = parseTimestamp(value.lastActivityAt);

    return {
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      items: deduplicateItems(items),
      lastRoute,
      lastActivityAt,
    };
  } catch {
    return createEmptyProgress();
  }
}

export function setProgressItem(
  record: LearningProgressRecord,
  item: ProgressItem,
): LearningProgressRecord {
  const parsed = parseItem(item);
  if (!parsed) return record;

  const items = record.items.filter(
    (current) =>
      current.kind !== parsed.kind || current.itemId !== parsed.itemId,
  );
  items.push(parsed);
  return { ...record, items };
}

export function setLastActivity(
  record: LearningProgressRecord,
  route: string,
  updatedAt = new Date().toISOString(),
): LearningProgressRecord {
  if (!learningRoutes.has(route) || !parseTimestamp(updatedAt)) return record;
  return { ...record, lastRoute: route, lastActivityAt: updatedAt };
}

export function recordQuizResult(
  record: LearningProgressRecord,
  score: number,
  maximum: number,
  updatedAt = new Date().toISOString(),
): LearningProgressRecord {
  if (
    !Number.isInteger(score) ||
    !Number.isInteger(maximum) ||
    maximum !== 4 ||
    score < 0 ||
    score > maximum
  ) {
    return record;
  }

  const currentBest = getBestQuizScore(record);
  const withQuiz = setProgressItem(record, {
    kind: "quiz",
    itemId: QUIZ_ID,
    completed: true,
    bestScore: Math.max(currentBest ?? 0, score),
    updatedAt,
  });
  return setProgressItem(withQuiz, {
    kind: "lesson",
    itemId: "prompt-quiz-review",
    completed: true,
    updatedAt,
  });
}

export function recordLabEvaluation(
  record: LearningProgressRecord,
  updatedAt = new Date().toISOString(),
): LearningProgressRecord {
  const withLab = setProgressItem(record, {
    kind: "lab",
    itemId: LAB_ID,
    completed: true,
    updatedAt,
  });
  return setProgressItem(withLab, {
    kind: "lesson",
    itemId: "prompt-vague-to-precise",
    completed: true,
    updatedAt,
  });
}

export function firstLoginMerge(
  cloud: LearningProgressRecord,
  guest: LearningProgressRecord,
): LearningProgressRecord {
  const merged = new Map<string, ProgressItem>();

  for (const item of [...cloud.items, ...guest.items]) {
    const key = `${item.kind}:${item.itemId}`;
    const current = merged.get(key);
    if (!current) {
      merged.set(key, item);
      continue;
    }

    const updatedAt = newerTimestamp(current.updatedAt, item.updatedAt);
    merged.set(key, {
      ...current,
      completed: current.completed || item.completed,
      ...(item.kind === "quiz"
        ? { bestScore: Math.max(current.bestScore ?? 0, item.bestScore ?? 0) }
        : {}),
      updatedAt,
    });
  }

  const guestIsNewer =
    guest.lastActivityAt &&
    (!cloud.lastActivityAt || guest.lastActivityAt > cloud.lastActivityAt);

  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    items: [...merged.values()],
    lastRoute: guestIsNewer ? guest.lastRoute : cloud.lastRoute,
    lastActivityAt: guestIsNewer
      ? guest.lastActivityAt
      : cloud.lastActivityAt,
  };
}

export function calculateCourseProgress(record: LearningProgressRecord): number {
  const completed = new Set(
    record.items
      .filter((item) => item.kind === "lesson" && item.completed)
      .map((item) => item.itemId),
  );
  return Math.round((completed.size / LESSON_IDS.length) * 100);
}

export function getNextLessonId(
  record: LearningProgressRecord,
): LessonId | null {
  const completed = new Set(
    record.items
      .filter((item) => item.kind === "lesson" && item.completed)
      .map((item) => item.itemId),
  );
  return LESSON_IDS.find((id) => !completed.has(id)) ?? null;
}

export function getMasteredTermIds(record: LearningProgressRecord): string[] {
  return record.items
    .filter((item) => item.kind === "term" && item.completed)
    .map((item) => item.itemId);
}

export function getBestQuizScore(
  record: LearningProgressRecord,
): number | null {
  return (
    record.items.find(
      (item) => item.kind === "quiz" && item.itemId === QUIZ_ID,
    )?.bestScore ?? null
  );
}

export function isLessonCompleted(
  record: LearningProgressRecord,
  lessonId: LessonId,
): boolean {
  return record.items.some(
    (item) =>
      item.kind === "lesson" && item.itemId === lessonId && item.completed,
  );
}

function parseItem(value: unknown): ProgressItem | null {
  if (!isObject(value)) return null;
  if (
    typeof value.kind !== "string" ||
    !isProgressKind(value.kind) ||
    typeof value.itemId !== "string" ||
    !validIds[value.kind].has(value.itemId) ||
    typeof value.completed !== "boolean"
  ) {
    return null;
  }

  const updatedAt = parseTimestamp(value.updatedAt);
  if (!updatedAt) return null;

  const bestScore =
    value.kind === "quiz" &&
    Number.isInteger(value.bestScore) &&
    Number(value.bestScore) >= 0 &&
    Number(value.bestScore) <= 4
      ? Number(value.bestScore)
      : undefined;

  return {
    kind: value.kind,
    itemId: value.itemId,
    completed: value.completed,
    ...(bestScore === undefined ? {} : { bestScore }),
    updatedAt,
  };
}

function deduplicateItems(items: ProgressItem[]): ProgressItem[] {
  const result = new Map<string, ProgressItem>();
  for (const item of items) {
    const key = `${item.kind}:${item.itemId}`;
    const current = result.get(key);
    if (!current || item.updatedAt >= current.updatedAt) result.set(key, item);
  }
  return [...result.values()];
}

function parseTimestamp(value: unknown): string | null {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) return null;
  return value;
}

function newerTimestamp(left: string, right: string): string {
  return left >= right ? left : right;
}

function isProgressKind(value: string): value is ProgressKind {
  return value === "lesson" || value === "term" || value === "quiz" || value === "lab";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
