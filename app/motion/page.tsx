import type { Metadata } from "next";
import { MotionPlayground } from "../components/MotionPlayground";
import { NextStop } from "../components/NextStop";

export const metadata: Metadata = { title: "动效实验 - 界面话术", description: "实时体验 Fade、Slide、Scale、Spring 和 Stagger 动效参数。" };

export default function MotionPage() {
  return <><section className="page-hero motion-page-hero"><div><p className="section-kicker">MOTION PLAYGROUND</p><h1>“丝滑一点”<br />不是动效参数</h1><p>亲手调持续时间和缓动曲线，感受不同动效，再把准确说法带进 Prompt。</p></div><aside className="motion-orbit" aria-hidden="true"><i /><span>240ms</span><b>ease-out</b></aside></section><MotionPlayground /><section className="motion-cheatsheet"><div className="section-heading compact-heading"><div><p className="section-kicker">QUICK REFERENCE</p><h2>四个参数，决定动效感觉</h2></div></div><div><article><span>01</span><h3>Property</h3><p>什么在变 - 透明度、位置、尺寸或颜色。</p></article><article><span>02</span><h3>Duration</h3><p>变化多久 - 微交互通常在 150 到 400ms。</p></article><article><span>03</span><h3>Easing</h3><p>速度怎么变 - 避免所有场景都使用 linear。</p></article><article><span>04</span><h3>Sequence</h3><p>多个元素同时还是依次发生。</p></article></div></section><NextStop eyebrow="下一站" title="确认你真的会命名" description="用四个真实情境做一轮快速检查，然后再进入 Prompt 实验室。" href="/quiz" label="开始 4 题小测" /></>;
}
