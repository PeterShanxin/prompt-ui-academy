"use client";

import { useState } from "react";
import { useI18n } from "./I18n";

export function HomeQuickQuiz() {
  const { pick } = useI18n();
  const options = [
    { id: "switch", zh: "切换开关", en: "Switch" },
    { id: "tabs", zh: "标签页", en: "Tabs" },
    { id: "slider", zh: "滑块", en: "Slider" },
  ];
  const [answer, setAnswer] = useState<string | null>(null);
  const isCorrect = answer === "switch";

  return (
    <section className="quiz-card" aria-labelledby="quiz-title">
      <div className="quiz-card__topline"><span>{pick("交互练习 01", "INTERACTIVE PRACTICE 01")}</span><span className="live-dot"><i /> {pick("可操作", "LIVE")}</span></div>
      <div className="quiz-card__heading"><div><p className="eyebrow">{pick("看见 → 命名", "SEE → NAME")}</p><h2 id="quiz-title">{pick("你认识这个部件吗？", "Can you name this component?")}</h2></div><span className="quiz-counter">01 / 03</span></div>
      <div className="settings-demo" aria-label={pick("一个手机设置界面的示例", "An example mobile settings screen")}>
        <div className="phone-bar"><strong>9:41</strong><span>● ● ▰</span></div><div className="settings-title"><span aria-hidden="true">←</span><strong>{pick("设置", "Settings")}</strong></div>
        <div className="settings-list"><div className="setting-row"><span className="setting-icon bell">●</span><span>{pick("消息通知", "Notifications")}</span><span className="switch is-on" aria-hidden="true"><i /></span><span className="callout-line" aria-hidden="true" /><span className="callout-number" aria-hidden="true">1</span></div><div className="setting-row muted-row"><span className="setting-icon moon">◒</span><span>{pick("深色模式", "Dark mode")}</span><span className="switch" aria-hidden="true"><i /></span></div><div className="setting-row muted-row"><span className="setting-icon text-icon">Aa</span><span>{pick("字体大小", "Text size")}</span><span className="setting-value">{pick("标准", "Default")} ›</span></div></div>
      </div>
      <div className="answer-grid" aria-label={pick("选择部件名称", "Choose the component name")}>{options.map((option) => <button key={option.id} type="button" className={`answer-option ${answer === option.id ? "selected" : ""} ${answer && option.id === "switch" ? "correct" : ""}`} onClick={() => setAnswer(option.id)} aria-pressed={answer === option.id}>{pick(option.zh, option.en)}</button>)}</div>
      <div className={`quiz-feedback ${answer ? "is-visible" : ""}`} aria-live="polite">{answer ? <><strong>{isCorrect ? pick("答对了 - Switch / Toggle", "Correct - Switch / Toggle") : pick("差一点，它叫切换开关", "Almost - it is a Switch")}</strong><span>{pick("用于在两个互斥状态之间立即切换。", "It immediately switches between two mutually exclusive states.")}<a href="/dictionary">{pick("去词典继续学", "Keep learning in the dictionary")} →</a></span></> : <span>{pick("选择一个答案，即时查看解释", "Choose an answer to see the explanation")}</span>}</div>
    </section>
  );
}
