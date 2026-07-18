"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ensureLearnerProfile,
  loadCloudProgress,
  mergeGuestProgress,
  saveCloudProgress,
  type LearnerProfile,
} from "../lib/cloud-progress";
import {
  GUEST_PROGRESS_KEY,
  LEGACY_TERMS_KEY,
  calculateCourseProgress,
  createEmptyProgress,
  getAccountMergeKey,
  getAccountPendingKey,
  getAccountProgressKey,
  getBestQuizScore,
  getMasteredTermIds,
  getNextLessonId,
  isLessonCompleted,
  migrateLegacyTerms,
  parseProgressRecord,
  recordLabEvaluation,
  recordQuizResult,
  setLastActivity,
  setProgressItem,
  type LearningProgressRecord,
  type LessonId,
} from "../lib/learning-progress";
import { getBrowserSupabaseClient } from "../lib/supabase/client";
import { useAuth } from "./AuthProvider";

export type SyncStatus =
  | "local"
  | "loading"
  | "syncing"
  | "synced"
  | "offline"
  | "error";

type LearningContextValue = {
  learned: string[];
  progress: number;
  bestQuizScore: number | null;
  nextLessonId: LessonId | null;
  profile: LearnerProfile | null;
  syncStatus: SyncStatus;
  toggleLearned: (id: string) => void;
  toggleLesson: (id: LessonId) => void;
  isLessonCompleted: (id: LessonId) => boolean;
  recordQuizScore: (score: number, maximum: number) => void;
  evaluateLab: () => void;
  noteActivity: (route: string) => void;
  retrySync: () => void;
};

const LearningContext = createContext<LearningContextValue | null>(null);

export function useLearningProgress() {
  const value = useContext(LearningContext);
  if (!value) {
    throw new Error("useLearningProgress must be used inside LearningProgressProvider");
  }
  return value;
}

export function LearningProgressProvider({ children }: { children: ReactNode }) {
  const { user, status: authStatus } = useAuth();
  const client = useMemo(() => getBrowserSupabaseClient(), []);
  const [record, setRecord] = useState<LearningProgressRecord>(createEmptyProgress);
  const [guestRecord, setGuestRecord] = useState<LearningProgressRecord>(createEmptyProgress);
  const [guestRestored, setGuestRestored] = useState(false);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const recordRef = useRef(record);
  const syncQueue = useRef(Promise.resolve());
  const latestSync = useRef(0);
  const syncContext = useRef(0);
  const previousUserId = useRef<string | null>(null);
  const retryAttempts = useRef(0);

  const replaceRecord = useCallback((next: LearningProgressRecord) => {
    recordRef.current = next;
    setRecord(next);
  }, []);

  const persist = useCallback((next: LearningProgressRecord, userId?: string) => {
    try {
      window.localStorage.setItem(
        userId ? getAccountProgressKey(userId) : GUEST_PROGRESS_KEY,
        JSON.stringify(next),
      );
    } catch {
      // Keep progress in memory when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      let restored = createEmptyProgress();
      try {
        const saved = window.localStorage.getItem(GUEST_PROGRESS_KEY);
        restored = saved
          ? parseProgressRecord(saved)
          : migrateLegacyTerms(window.localStorage.getItem(LEGACY_TERMS_KEY));
        window.localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(restored));
      } catch {
        // Empty progress remains usable when browser storage is unavailable.
      }
      setGuestRecord(restored);
      replaceRecord(restored);
      setSyncStatus("local");
      setGuestRestored(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, [replaceRecord]);

  useEffect(() => {
    const oldUserId = previousUserId.current;
    const nextUserId = user?.id ?? null;
    if (oldUserId !== nextUserId) {
      syncContext.current += 1;
      latestSync.current = 0;
      syncQueue.current = Promise.resolve();
      retryAttempts.current = 0;
    }
    if (oldUserId && oldUserId !== nextUserId) {
      try {
        window.localStorage.removeItem(getAccountProgressKey(oldUserId));
        window.localStorage.removeItem(getAccountPendingKey(oldUserId));
      } catch {
        // Account cache is best-effort cleanup.
      }
    }
    previousUserId.current = nextUserId;

    if (!user || !client) {
      const reset = window.setTimeout(() => {
        setProfile(null);
        if (authStatus !== "loading") {
          replaceRecord(guestRecord);
          setSyncStatus("local");
        }
      }, 0);
      return () => window.clearTimeout(reset);
    }

    if (!guestRestored) return;

    let active = true;

    void (async () => {
      await Promise.resolve();
      if (!active) return;
      setSyncStatus("loading");
      try {
        const pending = parseProgressRecord(
          window.localStorage.getItem(getAccountPendingKey(user.id)),
        );
        const cached = pending.items.length || pending.lastRoute
          ? pending
          : parseProgressRecord(
              window.localStorage.getItem(getAccountProgressKey(user.id)),
            );
        if (cached.items.length) replaceRecord(cached);
      } catch {
        // Cloud load below remains canonical.
      }
      try {
        const learner = await ensureLearnerProfile(client);
        const mergeKey = getAccountMergeKey(user.id);
        if (window.localStorage.getItem(mergeKey) !== "true") {
          await mergeGuestProgress(client, guestRecord);
          window.localStorage.setItem(mergeKey, "true");
        }
        let cloud = await loadCloudProgress(client, user.id);
        const pending = parseProgressRecord(
          window.localStorage.getItem(getAccountPendingKey(user.id)),
        );
        if (pending.items.length || pending.lastRoute) {
          replaceRecord(pending);
          cloud = await saveCloudProgress(client, user.id, pending);
          window.localStorage.removeItem(getAccountPendingKey(user.id));
        }
        if (!active) return;
        setProfile(learner);
        replaceRecord(cloud);
        persist(cloud, user.id);
        setSyncStatus("synced");
      } catch {
        if (!active) return;
        setSyncStatus(navigator.onLine ? "error" : "offline");
      }
    })();

    return () => {
      active = false;
    };
  }, [authStatus, client, guestRecord, guestRestored, persist, replaceRecord, user]);

  const queueCloudSync = useCallback(
    (snapshot: LearningProgressRecord) => {
      if (!user || !client) return;
      const userId = user.id;
      const version = ++latestSync.current;
      const contextVersion = syncContext.current;
      setSyncStatus("syncing");
      syncQueue.current = syncQueue.current
        .catch(() => undefined)
        .then(async () => {
          const canonical = await saveCloudProgress(client, userId, snapshot);
          if (
            version === latestSync.current &&
            contextVersion === syncContext.current &&
            previousUserId.current === userId
          ) {
            replaceRecord(canonical);
            persist(canonical, userId);
            window.localStorage.removeItem(getAccountPendingKey(userId));
            retryAttempts.current = 0;
            setSyncStatus("synced");
          }
        })
        .catch(() => {
          if (
            version === latestSync.current &&
            contextVersion === syncContext.current &&
            previousUserId.current === userId
          ) {
            setSyncStatus(navigator.onLine ? "error" : "offline");
          }
        });
    },
    [client, persist, replaceRecord, user],
  );

  const apply = useCallback(
    (next: LearningProgressRecord) => {
      replaceRecord(next);
      if (user) {
        persist(next, user.id);
        try {
          window.localStorage.setItem(
            getAccountPendingKey(user.id),
            JSON.stringify(next),
          );
        } catch {
          // The account cache still retains the latest state when possible.
        }
        queueCloudSync(next);
      } else {
        setGuestRecord(next);
        persist(next);
        setSyncStatus("local");
      }
    },
    [persist, queueCloudSync, replaceRecord, user],
  );

  const toggleLearned = useCallback(
    (id: string) => {
      const completed = recordRef.current.items.some(
        (item) => item.kind === "term" && item.itemId === id && item.completed,
      );
      apply(
        setProgressItem(recordRef.current, {
          kind: "term",
          itemId: id,
          completed: !completed,
          updatedAt: new Date().toISOString(),
        }),
      );
    },
    [apply],
  );

  const toggleLesson = useCallback(
    (id: LessonId) => {
      apply(
        setProgressItem(recordRef.current, {
          kind: "lesson",
          itemId: id,
          completed: !isLessonCompleted(recordRef.current, id),
          updatedAt: new Date().toISOString(),
        }),
      );
    },
    [apply],
  );

  const noteActivity = useCallback(
    (route: string) => {
      if (!guestRestored) return;
      const next = setLastActivity(recordRef.current, route);
      if (next !== recordRef.current) apply(next);
    },
    [apply, guestRestored],
  );

  useEffect(() => {
    const retry = () => {
      if (user && (syncStatus === "offline" || syncStatus === "error")) {
        retryAttempts.current = 0;
        queueCloudSync(recordRef.current);
      }
    };
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, [queueCloudSync, syncStatus, user]);

  useEffect(() => {
    if (!user || syncStatus !== "error" || !navigator.onLine) return;
    if (retryAttempts.current >= 5) return;

    const delay = Math.min(2 ** retryAttempts.current * 1000, 16000);
    retryAttempts.current += 1;
    const timer = window.setTimeout(() => {
      queueCloudSync(recordRef.current);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [queueCloudSync, syncStatus, user]);

  const value = useMemo<LearningContextValue>(
    () => ({
      learned: getMasteredTermIds(record),
      progress: calculateCourseProgress(record),
      bestQuizScore: getBestQuizScore(record),
      nextLessonId: getNextLessonId(record),
      profile,
      syncStatus,
      toggleLearned,
      toggleLesson,
      isLessonCompleted: (id) => isLessonCompleted(record, id),
      recordQuizScore: (score, maximum) =>
        apply(recordQuizResult(recordRef.current, score, maximum)),
      evaluateLab: () => apply(recordLabEvaluation(recordRef.current)),
      noteActivity,
      retrySync: () => {
        retryAttempts.current = 0;
        queueCloudSync(recordRef.current);
      },
    }),
    [
      apply,
      noteActivity,
      profile,
      queueCloudSync,
      record,
      syncStatus,
      toggleLearned,
      toggleLesson,
    ],
  );

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}
