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
  loadCloudProgress,
  mergeGuestProgress,
  saveCloudProgress,
  type LearnerProfile,
} from "../lib/cloud-progress";
import {
  GUEST_PROGRESS_KEY,
  LAST_ACCOUNT_KEY,
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
  selectStartupRecord,
  setLastActivity,
  setProgressItem,
  type LearningProgressRecord,
  type LessonId,
} from "../lib/learning-progress";
import { getBrowserAppwriteAccount } from "../lib/appwrite/client";
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
  const account = useMemo(() => getBrowserAppwriteAccount(), []);
  const [record, setRecord] = useState<LearningProgressRecord>(createEmptyProgress);
  const [guestRecord, setGuestRecord] = useState<LearningProgressRecord>(createEmptyProgress);
  const [guestRestored, setGuestRestored] = useState(false);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const recordRef = useRef(record);
  const guestRef = useRef(guestRecord);
  const syncQueue = useRef(Promise.resolve());
  const latestSync = useRef(0);
  const syncContext = useRef(0);
  const previousUserId = useRef<string | null>(null);
  const retryAttempts = useRef(0);
  const authStatusRef = useRef(authStatus);

  useEffect(() => {
    authStatusRef.current = authStatus;
  }, [authStatus]);

  const replaceRecord = useCallback((next: LearningProgressRecord) => {
    recordRef.current = next;
    setRecord(next);
  }, []);

  const replaceGuestRecord = useCallback((next: LearningProgressRecord) => {
    guestRef.current = next;
    setGuestRecord(next);
  }, []);

  const persist = useCallback((next: LearningProgressRecord, userId?: string) => {
    try {
      if (!userId) {
        window.localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(next));
        return;
      }
      window.localStorage.setItem(getAccountProgressKey(userId), JSON.stringify(next));
      // An account snapshot is only usable on the next mount when this device
      // also remembers whose it is, so the owner is recorded alongside it.
      window.localStorage.setItem(LAST_ACCOUNT_KEY, userId);
    } catch {
      // Keep progress in memory when browser storage is unavailable.
    }
  }, []);

  const readCachedAccountRecord = useCallback((): LearningProgressRecord | null => {
    try {
      const accountId = window.localStorage.getItem(LAST_ACCOUNT_KEY);
      if (!accountId) return null;
      return parseProgressRecord(
        window.localStorage.getItem(getAccountProgressKey(accountId)),
      );
    } catch {
      // Guest progress stays the fallback when browser storage is unavailable.
    }
    return null;
  }, []);

  const forgetAccountCache = useCallback(() => {
    try {
      const accountId = window.localStorage.getItem(LAST_ACCOUNT_KEY);
      window.localStorage.removeItem(LAST_ACCOUNT_KEY);
      // The pending key is deliberately kept: it holds edits that never reached
      // the cloud and must survive until the same account signs in again.
      if (accountId) window.localStorage.removeItem(getAccountProgressKey(accountId));
    } catch {
      // Account cache cleanup is best-effort.
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
      replaceGuestRecord(restored);
      // A signed-in learner must never see the guest record, so an account
      // snapshot this device wrote outranks the guest restore until the cloud
      // load settles. A resolved signed-out or disabled status proves no
      // session reaches this device, so the snapshot cannot win then.
      const accountSessionPossible =
        authStatusRef.current === "loading" || authStatusRef.current === "signed_in";
      const startup = selectStartupRecord({
        guest: restored,
        cachedAccount: readCachedAccountRecord(),
        accountSessionPossible,
      });
      replaceRecord(startup);
      // While auth is unresolved the account effect owns the status, so the
      // badge never churns local -> loading -> synced on a first-party load.
      if (startup === restored && authStatusRef.current !== "loading") {
        setSyncStatus("local");
      }
      setGuestRestored(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, [readCachedAccountRecord, replaceGuestRecord, replaceRecord]);

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
        if (window.localStorage.getItem(LAST_ACCOUNT_KEY) === oldUserId) {
          window.localStorage.removeItem(LAST_ACCOUNT_KEY);
        }
      } catch {
        // Account cache is best-effort cleanup.
      }
    }
    previousUserId.current = nextUserId;

    if (!user || !account) {
      const reset = window.setTimeout(() => {
        setProfile(null);
        if (authStatus !== "loading") {
          // Auth resolved without a session while the network was reachable,
          // so any account snapshot still on this device is stale (expired
          // session, cleared cookies) and must not outrank a future guest
          // restore. Offline also resolves to signed out, so the cache is
          // kept in that case.
          if (navigator.onLine) forgetAccountCache();
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
        const mergeKey = getAccountMergeKey(user.id);
        let snapshot;
        if (window.localStorage.getItem(mergeKey) !== "true") {
          snapshot = await mergeGuestProgress(account, guestRecord);
          window.localStorage.setItem(mergeKey, "true");
        } else {
          snapshot = await loadCloudProgress(account);
        }
        let cloud = snapshot.record;
        const pendingKey = getAccountPendingKey(user.id);
        const pendingBeforeSave = window.localStorage.getItem(pendingKey);
        const pending = parseProgressRecord(pendingBeforeSave);
        let pendingUnchanged = true;
        if (pending.items.length || pending.lastRoute) {
          replaceRecord(pending);
          cloud = await saveCloudProgress(account, pending);
          const pendingAfterSave = window.localStorage.getItem(pendingKey);
          pendingUnchanged = pendingAfterSave === pendingBeforeSave;
          if (pendingUnchanged) window.localStorage.removeItem(pendingKey);
        }
        if (!active) return;
        setProfile(snapshot.profile);
        if (!pendingUnchanged) return;
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
  }, [
    account,
    authStatus,
    forgetAccountCache,
    guestRecord,
    guestRestored,
    persist,
    replaceRecord,
    user,
  ]);

  const queueCloudSync = useCallback(
    (snapshot: LearningProgressRecord) => {
      if (!user || !account) return;
      const userId = user.id;
      const version = ++latestSync.current;
      const contextVersion = syncContext.current;
      setSyncStatus("syncing");
      syncQueue.current = syncQueue.current
        .catch(() => undefined)
        .then(async () => {
          const mergeKey = getAccountMergeKey(userId);
          const pendingKey = getAccountPendingKey(userId);
          let canonical: LearningProgressRecord;
          let importedProfile: LearnerProfile | null = null;
          if (window.localStorage.getItem(mergeKey) !== "true") {
            // The first-login import never completed, so retry it through the
            // additive merge. A reconciling PUT here would let a newer guest
            // `completed: false` revert a cloud completion the import exists
            // to preserve. Only genuine post-sign-in edits are flushed after.
            const imported = await mergeGuestProgress(account, guestRef.current);
            window.localStorage.setItem(mergeKey, "true");
            importedProfile = imported.profile;
            const pending = parseProgressRecord(
              window.localStorage.getItem(pendingKey),
            );
            canonical = pending.items.length || pending.lastRoute
              ? await saveCloudProgress(account, pending)
              : imported.record;
          } else {
            canonical = await saveCloudProgress(account, snapshot);
          }
          if (
            version === latestSync.current &&
            contextVersion === syncContext.current &&
            previousUserId.current === userId
          ) {
            if (importedProfile) setProfile(importedProfile);
            replaceRecord(canonical);
            persist(canonical, userId);
            window.localStorage.removeItem(pendingKey);
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
    [account, persist, replaceRecord, user],
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
        replaceGuestRecord(next);
        persist(next);
        setSyncStatus("local");
      }
    },
    [persist, queueCloudSync, replaceGuestRecord, replaceRecord, user],
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
      // While auth is unresolved a null user does not mean "guest": the shown
      // record may be the account snapshot. Mirroring it into guest storage
      // here would destroy the device's guest progress and later merge one
      // learner's lessons into another's account. The callback identity
      // changes when authStatus settles, which replays the note.
      if (authStatus === "loading") return;
      // `lastRoute` is a bookmark, not an achievement. It rides along with the
      // next real progress write instead of spending a cloud round trip and a
      // "syncing" badge on every page view.
      if (user) {
        const next = setLastActivity(recordRef.current, route);
        if (next === recordRef.current) return;
        replaceRecord(next);
        persist(next, user.id);
        return;
      }
      // Signed out, so the guest record is the only source of truth. Reading it
      // from guestRef keeps the note off whatever the startup restore showed.
      const next = setLastActivity(guestRef.current, route);
      if (next === guestRef.current) return;
      replaceGuestRecord(next);
      replaceRecord(next);
      persist(next);
    },
    [authStatus, guestRestored, persist, replaceGuestRecord, replaceRecord, user],
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
