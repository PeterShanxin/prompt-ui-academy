"use client";

import type { PreviewKind } from "../lib/content";
import { useI18n } from "./I18n";

export function TermPreview({ kind, compact = false }: { kind: PreviewKind; compact?: boolean }) {
  const { pick } = useI18n();
  return (
    <div className={`term-preview preview-${kind} ${compact ? "is-compact" : ""}`} aria-hidden="true">
      {kind === "button" && <button tabIndex={-1}>{pick("继续", "Continue")} <span>→</span></button>}
      {kind === "modal" && <div className="mini-screen"><span className="mini-scrim" /><div className="mini-modal"><b>{pick("删除项目？", "Delete project?")}</b><small>{pick("此操作无法撤销", "This cannot be undone")}</small><i><em>{pick("取消", "Cancel")}</em><strong>{pick("删除", "Delete")}</strong></i></div></div>}
      {kind === "toast" && <div className="mini-toast"><b>✓</b><span><strong>{pick("保存成功", "Saved")}</strong><small>{pick("更改已同步", "Changes synced")}</small></span></div>}
      {kind === "tooltip" && <div className="tooltip-demo"><span>{pick("快捷键", "Shortcut")} ⌘K</span><button tabIndex={-1}>?</button></div>}
      {kind === "tabs" && <div className="mini-tabs"><span className="is-active">{pick("概览", "Overview")}</span><span>{pick("活动", "Activity")}</span><span>{pick("设置", "Settings")}</span><i>1,248<small>{pick("本周访问", "Visits this week")}</small></i></div>}
      {kind === "accordion" && <div className="mini-accordion"><span><b>{pick("什么是 UI 组件？", "What is a UI component?")}</b><i>⌃</i></span><p>{pick("可复用、拥有明确结构与行为的界面部件。", "A reusable interface element with defined structure and behavior.")}</p><span><b>{pick("什么是设计令牌？", "What is a design token?")}</b><i>⌄</i></span></div>}
      {kind === "toggle" && <div className="toggle-demo"><span><b>{pick("深色模式", "Dark mode")}</b><small>{pick("跟随系统外观", "Follow system")}</small></span><i><em /></i></div>}
      {kind === "skeleton" && <div className="mini-skeleton"><i /><span><b /><b /><b /></span></div>}
    </div>
  );
}
