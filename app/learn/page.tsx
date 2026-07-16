import type { Metadata } from "next";
import { LearnOverview } from "../components/LearnOverview";
import { NextStop } from "../components/NextStop";

export const metadata: Metadata = { title: "学习路径 - 界面话术", description: "三章互动课程，从认识 UI 部件到写出可执行 Prompt。" };

export default function LearnPage() {
  return <><section className="page-hero course-page-hero"><div><p className="section-kicker">LEARNING PATH</p><h1>一条真正能走完的<br />AI 界面协作课程</h1><p>不从 Prompt 模板开始。先建立界面词汇，再理解动效，最后把它们组合成清晰指令。</p></div><aside><span>课程结构</span><strong>3</strong><p>章 · 9 个短课</p><i>约 45 分钟</i></aside></section><LearnOverview /><NextStop eyebrow="第一站" title="从 UI 词典开始" description="先掌握八个最常见的界面名称，后面的 Prompt 才有共同语言。" href="/dictionary" label="打开 UI 词典" /></>;
}
