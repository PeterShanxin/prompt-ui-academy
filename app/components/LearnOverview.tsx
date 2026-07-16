"use client";

import { curriculum } from "../lib/content";
import { useLearningProgress } from "./AppShell";
import { ArrowIcon } from "./Icons";

export function LearnOverview() {
  const { learned, progress } = useLearningProgress();
  return (
    <section className="content-section learn-overview route-content-section" aria-labelledby="course-map-title">
      <div className="learn-summary">
        <div><p className="section-kicker">YOUR PROGRESS</p><strong>{progress}%</strong><span>已掌握 {learned.length} 个 UI 词汇</span></div>
        <div className="learn-progress-track"><i style={{ width: `${progress}%` }} /></div>
        <a href="/dictionary">继续学习 <ArrowIcon /></a>
      </div>
      <div className="section-heading compact-heading"><div><p className="section-kicker">COURSE MAP</p><h2 id="course-map-title">三章，从会看到会说</h2><p>每章都把概念、操作和 Prompt 连接起来。你不必一次读完，按顺序走即可。</p></div></div>
      <div className="curriculum-list">{curriculum.map((module, moduleIndex) => <article className={`curriculum-module module-${module.color}`} key={module.id}><div className="module-index"><span>{module.id}</span><i>{moduleIndex === 0 ? "现在开始" : moduleIndex === 1 ? "第二章" : "最终章"}</i></div><div className="module-copy"><h3>{module.title}</h3><p>{module.description}</p></div><div className="lesson-list">{module.lessons.map((lesson, lessonIndex) => <a href={lesson.href} key={lesson.title}><span>{module.id}.{lessonIndex + 1}</span><b>{lesson.title}</b><small>{lesson.time}</small><i>→</i></a>)}</div></article>)}</div>
    </section>
  );
}
