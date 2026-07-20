"use client";

import { useState, type CSSProperties } from "react";
import { motions } from "../lib/content";
import { ReplayIcon } from "./Icons";
import { useI18n } from "./I18n";

export function MotionPlayground() {
  const [motion, setMotion] = useState(motions[1]);
  const { locale, pick } = useI18n();
  const [duration, setDuration] = useState(420);
  const [easing, setEasing] = useState("cubic-bezier(.22,1,.36,1)");
  const [replay, setReplay] = useState(0);
  const motionStyle = { "--motion-duration": `${duration}ms`, "--motion-easing": easing } as CSSProperties;

  return (
    <section className="content-section motion-section route-motion-section" id="motion-enter-exit" aria-labelledby="motion-title">
      <div className="section-heading inverse"><div><p className="section-kicker">MOTION LANGUAGE</p><h2 id="motion-title">{pick("别只说“加点动画”", "Go beyond ‘add some animation’")}</h2><p>{pick("选择一个动效，拖动速度，然后把准确说法带走。", "Choose a motion, adjust its speed, and take away a precise description.")}</p></div><span className="motion-hint">{pick("点击重播，感受差异", "Replay it and feel the difference")} ↘</span></div>
      <div className="motion-workbench">
        <div className="motion-menu" role="group" aria-label={pick("选择动效", "Choose a motion")}>{motions.map((item, index) => <button id={item.id === "spring" ? "motion-spring-stagger" : undefined} key={item.id} type="button" className={motion.id === item.id ? "active" : ""} onClick={() => { setMotion(item); setReplay((value) => value + 1); }} aria-pressed={motion.id === item.id}><i>{String(index + 1).padStart(2, "0")}</i><span><strong>{locale === "zh" ? item.cn : item.en}</strong><small>{locale === "zh" ? item.en : item.cn}</small></span><b>→</b></button>)}</div>
        <div className="motion-stage"><div className="stage-top"><span>LIVE PREVIEW</span><button type="button" onClick={() => setReplay((value) => value + 1)}><ReplayIcon /> {pick("重播", "Replay")}</button></div><div className="stage-canvas" style={motionStyle}><div className={`motion-object motion-${motion.id}`} key={`${motion.id}-${replay}`}><i /><div><strong>{pick("新建项目", "New project")}</strong><span>{pick("从一个清晰的界面开始", "Start with a clear interface")}</span></div><b>→</b></div></div><div className="motion-controls" id="motion-duration-easing"><label><span>{pick("持续时间", "Duration")} <b>{duration}ms</b></span><input type="range" min="150" max="1000" step="30" value={duration} onChange={(event) => { setDuration(Number(event.target.value)); setReplay((value) => value + 1); }} /></label><label><span>{pick("缓动曲线", "Easing curve")}</span><select value={easing} onChange={(event) => { setEasing(event.target.value); setReplay((value) => value + 1); }}><option value="ease-out">Ease out</option><option value="cubic-bezier(.22,1,.36,1)">Smooth out</option><option value="linear">Linear</option></select></label></div></div>
        <aside className="motion-copy"><span>{pick("现在你可以这样说", "Now you can say")}</span><q>{pick(motion.prompt, motion.promptEn)}, {pick("持续", "lasting")} {duration}ms.</q><p>{pick(motion.note, motion.noteEn)}</p></aside>
      </div>
    </section>
  );
}
