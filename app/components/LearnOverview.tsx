"use client";

import { curriculum } from "../lib/content";
import { useLearningProgress } from "./LearningProgressProvider";
import { useI18n } from "./I18n";
import { ArrowIcon } from "./Icons";

export function LearnOverview() {
  const {
    learned,
    progress,
    bestQuizScore,
    nextLessonId,
    syncStatus,
    isLessonCompleted,
  } = useLearningProgress();
  const { locale, pick } = useI18n();
  const allLessons = curriculum.flatMap((module) => module.lessons);
  const nextLesson = allLessons.find((lesson) => lesson.id === nextLessonId);
  return (
    <section className="content-section learn-overview route-content-section" aria-labelledby="course-map-title">
      <div className="learn-summary">
        <div><p className="section-kicker">YOUR PROGRESS</p><strong>{progress}%</strong><span>{pick(`已掌握 ${learned.length} 个 UI 词汇`, `${learned.length} UI terms mastered`)}</span></div>
        <div className="learn-progress-track"><i style={{ width: `${progress}%` }} /></div>
        <a href={nextLesson?.href ?? "/dictionary"}>{nextLesson ? pick(nextLesson.title, nextLesson.titleEn) : pick("复习 UI 词典", "Review the UI dictionary")} <ArrowIcon /></a>
        <div className="progress-details">
          <span>{pick("最佳小测", "Best quiz")} <b>{bestQuizScore === null ? "—" : `${bestQuizScore} / 4`}</b></span>
          <span>{syncStatus === "synced" ? pick("✓ 已同步", "✓ Synced") : syncStatus === "syncing" ? pick("正在保存…", "Saving…") : pick("保存在此设备", "Saved on this device")}</span>
        </div>
      </div>
      <div className="section-heading compact-heading"><div><p className="section-kicker">COURSE MAP</p><h2 id="course-map-title">{pick("三章，从会看到会说", "Three chapters, from seeing to saying")}</h2><p>{pick("每章都把概念、操作和 Prompt 连接起来。你不必一次读完，按顺序走即可。", "Each chapter connects concepts, actions, and prompts. Take them in order, at your own pace.")}</p></div></div>
      <div className="curriculum-list">{curriculum.map((module, moduleIndex) => <article className={`curriculum-module module-${module.color}`} key={module.id}><div className="module-index"><span>{module.id}</span><i>{locale === "zh" ? (moduleIndex === 0 ? "现在开始" : moduleIndex === 1 ? "第二章" : "最终章") : (moduleIndex === 0 ? "START HERE" : moduleIndex === 1 ? "CHAPTER TWO" : "FINAL CHAPTER")}</i></div><div className="module-copy"><h3>{pick(module.title, module.titleEn)}</h3><p>{pick(module.description, module.descriptionEn)}</p></div><div className="lesson-list">{module.lessons.map((lesson, lessonIndex) => { const completed = isLessonCompleted(lesson.id); return <a className={completed ? "completed" : ""} href={lesson.href} key={lesson.id}><span>{module.id}.{lessonIndex + 1}</span><b>{pick(lesson.title, lesson.titleEn)}</b><small>{pick(lesson.time, lesson.timeEn)}</small><i>{completed ? "✓" : "→"}</i></a>; })}</div></article>)}</div>
    </section>
  );
}
