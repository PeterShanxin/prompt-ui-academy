"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useI18n } from "./I18n";
import { useLearningProgress } from "./LearningProgressProvider";

export function AccountControls() {
  const { status, user, openAuth, signOut, deleteAccount } = useAuth();
  const { profile, syncStatus, retrySync } = useLearningProgress();
  const { pick } = useI18n();
  const [busy, setBusy] = useState(false);

  if (status === "disabled") return null;
  if (status === "loading") {
    return <span className="account-loading" aria-label={pick("正在检查登录状态", "Checking sign-in status")} />;
  }
  if (!user) {
    return (
      <button className="save-progress-button" type="button" onClick={openAuth}>
        {pick("保存进度", "Save progress")}
      </button>
    );
  }

  const initials = user.name.trim().slice(0, 1)
    || user.email.slice(0, 1).toUpperCase()
    || "✓";
  const unsynced = syncStatus === "syncing" || syncStatus === "offline" || syncStatus === "error";

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try { await action(); } finally { setBusy(false); }
  };

  return (
    <details className="account-menu">
      <summary aria-label={pick("打开账户菜单", "Open account menu")}><span>{initials}</span></summary>
      <div>
        <p>{user.email}</p>
        {profile && <strong>{profile.pioneerNumber <= 100
          ? pick(`创始学员 #${profile.pioneerNumber}`, `Founding learner #${profile.pioneerNumber}`)
          : pick(`学员 #${profile.pioneerNumber}`, `Learner #${profile.pioneerNumber}`)}</strong>}
        <span className={`account-sync sync-${syncStatus}`}>{syncLabel(syncStatus, pick)}</span>
        {unsynced && <button type="button" onClick={retrySync}>{pick("重试同步", "Retry sync")}</button>}
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (unsynced && !window.confirm(pick("仍有进度未同步。仍要退出并丢弃这些更改吗？", "Some progress has not synced. Sign out and discard those changes?"))) return;
            void run(signOut);
          }}
        >{pick("退出登录", "Sign out")}</button>
        <button
          className="delete-account-button"
          type="button"
          disabled={busy}
          onClick={() => {
            if (!window.confirm(pick("删除账户及云端学习进度？此操作无法撤销。", "Delete your account and cloud progress? This cannot be undone."))) return;
            void run(deleteAccount);
          }}
        >{pick("删除账户", "Delete account")}</button>
      </div>
    </details>
  );
}

function syncLabel(status: string, pick: (zh: string, en: string) => string) {
  switch (status) {
    case "syncing": return pick("正在保存…", "Saving…");
    case "synced": return pick("已同步", "Synced");
    case "offline": return pick("已存本机，等待同步", "Saved here, waiting to sync");
    case "error": return pick("进度在本机安全保存", "Progress is safe on this device");
    case "loading": return pick("正在合并进度…", "Combining progress…");
    default: return pick("保存在此设备", "Saved on this device");
  }
}
