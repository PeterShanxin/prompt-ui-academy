"use client";

import { curriculum } from "../lib/content";
import { useLearningProgress } from "./AppShell";
import { useI18n } from "./I18n";
import { ArrowIcon } from "./Icons";

export function LearnOverview() {
  const { learned, progress } = useLearningProgress();
  const { locale, pick } = useI18n();
  return (
    <section className="content-section learn-overview route-content-section" aria-labelledby="course-map-title">
      <div className="learn-summary">
        <div><p className="section-kicker">YOUR PROGRESS</p><strong>{progress}%</strong><span>{pick(`已掌握 ${learned.length} 个 UI 词汇`, `${learned.length} UI terms mastered`)}</span></div>
        <div className="learn-progress-track"><i style={{ width: `${progress}%` }} /></div>
        <a href="/dictionary">{pick("继续学习", "Continue learning")} <ArrowIcon /></a>
      </div>
      <div className="section-heading compact-heading"><div><p className="section-kicker">COURSE MAP</p><h2 id="course-map-title">{pick("三章，从会看到会说", "Three chapters, from seeing to saying")}</h2><p>{pick("每章都把概念、操作和 Prompt 连接起来。你不必一次读完，按顺序走即可。", "Each chapter connects concepts, actions, and prompts. Take them in order, at your own pace.")}</p></div></div>
      <div className="curriculum-list">{curriculum.map((module, moduleIndex) => <article className={`curriculum-module module-${module.color}`} key={module.id}><div className="module-index"><span>{module.id}</span><i>{locale === "zh" ? (moduleIndex === 0 ? "现在开始" : moduleIndex === 1 ? "第二章" : "最终章") : (moduleIndex === 0 ? "START HERE" : moduleIndex === 1 ? "CHAPTER TWO" : "FINAL CHAPTER")}</i></div><div className="module-copy"><h3>{pick(module.title, module.titleEn)}</h3><p>{pick(module.description, module.descriptionEn)}</p></div><div className="lesson-list">{module.lessons.map((lesson, lessonIndex) => <a href={lesson.href} key={lesson.title}><span>{module.id}.{lessonIndex + 1}</span><b>{pick(lesson.title, lesson.titleEn)}</b><small>{pick(lesson.time, lesson.timeEn)}</small><i>→</i></a>)}</div></article>)}</div>
    </section>
  );
}
