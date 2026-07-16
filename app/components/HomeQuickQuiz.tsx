"use client";

import { useState } from "react";

export function HomeQuickQuiz() {
  const options = ["切换开关", "标签页", "滑块"];
  const [answer, setAnswer] = useState<string | null>(null);
  const isCorrect = answer === "切换开关";

  return (
    <section className="quiz-card" aria-labelledby="quiz-title">
      <div className="quiz-card__topline"><span>交互练习 01</span><span className="live-dot"><i /> 可操作</span></div>
      <div className="quiz-card__heading"><div><p className="eyebrow">看见 → 命名</p><h2 id="quiz-title">你认识这个部件吗？</h2></div><span className="quiz-counter">01 / 03</span></div>
      <div className="settings-demo" aria-label="一个手机设置界面的示例">
        <div className="phone-bar"><strong>9:41</strong><span>● ● ▰</span></div><div className="settings-title"><span aria-hidden="true">←</span><strong>设置</strong></div>
        <div className="settings-list"><div className="setting-row"><span className="setting-icon bell">●</span><span>消息通知</span><span className="switch is-on" aria-hidden="true"><i /></span><span className="callout-line" aria-hidden="true" /><span className="callout-number" aria-hidden="true">1</span></div><div className="setting-row muted-row"><span className="setting-icon moon">◒</span><span>深色模式</span><span className="switch" aria-hidden="true"><i /></span></div><div className="setting-row muted-row"><span className="setting-icon text-icon">Aa</span><span>字体大小</span><span className="setting-value">标准 ›</span></div></div>
      </div>
      <div className="answer-grid" aria-label="选择部件名称">{options.map((option) => <button key={option} type="button" className={`answer-option ${answer === option ? "selected" : ""} ${answer && option === "切换开关" ? "correct" : ""}`} onClick={() => setAnswer(option)} aria-pressed={answer === option}>{option}</button>)}</div>
      <div className={`quiz-feedback ${answer ? "is-visible" : ""}`} aria-live="polite">{answer ? <><strong>{isCorrect ? "答对了 - Switch / Toggle" : "差一点，它叫切换开关"}</strong><span>用于在两个互斥状态之间立即切换。<a href="/dictionary">去词典继续学 →</a></span></> : <span>选择一个答案，即时查看解释</span>}</div>
    </section>
  );
}
