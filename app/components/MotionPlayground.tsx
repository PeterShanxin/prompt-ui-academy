"use client";

import { useState, type CSSProperties } from "react";
import { motions } from "../lib/content";
import { ReplayIcon } from "./Icons";

export function MotionPlayground() {
  const [motion, setMotion] = useState(motions[1]);
  const [duration, setDuration] = useState(420);
  const [easing, setEasing] = useState("cubic-bezier(.22,1,.36,1)");
  const [replay, setReplay] = useState(0);
  const motionStyle = { "--motion-duration": `${duration}ms`, "--motion-easing": easing } as CSSProperties;

  return (
    <section className="content-section motion-section route-motion-section" aria-labelledby="motion-title">
      <div className="section-heading inverse"><div><p className="section-kicker">MOTION LANGUAGE</p><h2 id="motion-title">别只说“加点动画”</h2><p>选择一个动效，拖动速度，然后把准确说法带走。</p></div><span className="motion-hint">点击重播，感受差异 ↘</span></div>
      <div className="motion-workbench">
        <div className="motion-menu" role="group" aria-label="选择动效">{motions.map((item, index) => <button key={item.id} type="button" className={motion.id === item.id ? "active" : ""} onClick={() => { setMotion(item); setReplay((value) => value + 1); }} aria-pressed={motion.id === item.id}><i>{String(index + 1).padStart(2, "0")}</i><span><strong>{item.cn}</strong><small>{item.en}</small></span><b>→</b></button>)}</div>
        <div className="motion-stage"><div className="stage-top"><span>LIVE PREVIEW</span><button type="button" onClick={() => setReplay((value) => value + 1)}><ReplayIcon /> 重播</button></div><div className="stage-canvas" style={motionStyle}><div className={`motion-object motion-${motion.id}`} key={`${motion.id}-${replay}`}><i /><div><strong>新建项目</strong><span>从一个清晰的界面开始</span></div><b>→</b></div></div><div className="motion-controls"><label><span>持续时间 <b>{duration}ms</b></span><input type="range" min="150" max="1000" step="30" value={duration} onChange={(event) => { setDuration(Number(event.target.value)); setReplay((value) => value + 1); }} /></label><label><span>缓动曲线</span><select value={easing} onChange={(event) => { setEasing(event.target.value); setReplay((value) => value + 1); }}><option value="ease-out">Ease out</option><option value="cubic-bezier(.22,1,.36,1)">Smooth out</option><option value="linear">Linear</option></select></label></div></div>
        <aside className="motion-copy"><span>现在你可以这样说</span><q>{motion.prompt}，持续 {duration}ms。</q><p>{motion.note}</p></aside>
      </div>
    </section>
  );
}
