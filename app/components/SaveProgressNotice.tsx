"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useI18n } from "./I18n";
import { useLearningProgress } from "./LearningProgressProvider";

const dismissalKey = "prompt-ui-save-progress-dismissed";

export function SaveProgressNotice() {
  const { status, openAuth } = useAuth();
  const { progress, learned } = useLearningProgress();
  const { pick } = useI18n();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    try { return window.sessionStorage.getItem(dismissalKey) === "true"; } catch { return false; }
  });

  if (status !== "signed_out" || dismissed || (progress === 0 && learned.length === 0)) {
    return null;
  }

  return (
    <aside className="save-progress-notice" aria-label={pick("保存学习进度", "Save learning progress")}>
      <span aria-hidden="true">✓</span>
      <p><b>{pick("已保存在此设备", "Saved on this device")}</b>{pick("登录后可在任何设备继续。", "Sign in to continue on any device.")}</p>
      <button type="button" onClick={openAuth}>{pick("保存到云端", "Save to cloud")}</button>
      <button
        className="dismiss-save-notice"
        type="button"
        aria-label={pick("关闭提示", "Dismiss message")}
        onClick={() => {
          setDismissed(true);
          try { window.sessionStorage.setItem(dismissalKey, "true"); } catch { /* Session-only dismissal remains in memory. */ }
        }}
      >×</button>
    </aside>
  );
}
