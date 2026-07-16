import type { PreviewKind } from "../lib/content";

export function TermPreview({ kind, compact = false }: { kind: PreviewKind; compact?: boolean }) {
  return (
    <div className={`term-preview preview-${kind} ${compact ? "is-compact" : ""}`} aria-hidden="true">
      {kind === "button" && <button tabIndex={-1}>继续 <span>→</span></button>}
      {kind === "modal" && <div className="mini-screen"><span className="mini-scrim" /><div className="mini-modal"><b>删除项目？</b><small>此操作无法撤销</small><i><em>取消</em><strong>删除</strong></i></div></div>}
      {kind === "toast" && <div className="mini-toast"><b>✓</b><span><strong>保存成功</strong><small>更改已同步</small></span></div>}
      {kind === "tooltip" && <div className="tooltip-demo"><span>快捷键 ⌘K</span><button tabIndex={-1}>?</button></div>}
      {kind === "tabs" && <div className="mini-tabs"><span className="is-active">概览</span><span>活动</span><span>设置</span><i>1,248<small>本周访问</small></i></div>}
      {kind === "accordion" && <div className="mini-accordion"><span><b>什么是 UI 组件？</b><i>⌃</i></span><p>可复用、拥有明确结构与行为的界面部件。</p><span><b>什么是设计令牌？</b><i>⌄</i></span></div>}
      {kind === "toggle" && <div className="toggle-demo"><span><b>深色模式</b><small>跟随系统外观</small></span><i><em /></i></div>}
      {kind === "skeleton" && <div className="mini-skeleton"><i /><span><b /><b /><b /></span></div>}
    </div>
  );
}
