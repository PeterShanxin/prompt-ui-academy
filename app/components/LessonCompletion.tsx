"use client";

import { curriculum } from "../lib/content";
import type { LessonId } from "../lib/learning-progress";
import { useI18n } from "./I18n";
import { useLearningProgress } from "./LearningProgressProvider";

export function LessonCompletion({ lessonIds }: { lessonIds: LessonId[] }) {
  const { pick } = useI18n();
  const { isLessonCompleted, toggleLesson } = useLearningProgress();
  const lessons = curriculum
    .flatMap((module) => module.lessons)
    .filter((lesson) => lessonIds.includes(lesson.id));

  return (
    <section className="lesson-completion" aria-labelledby={`complete-${lessonIds[0]}`}>
      <div>
        <p className="section-kicker">CHECKPOINT</p>
        <h2 id={`complete-${lessonIds[0]}`}>{pick("记录这一站", "Record this checkpoint")}</h2>
        <p>{pick("完成后勾选。你可以随时撤销。", "Mark each lesson when finished. You can undo it anytime.")}</p>
      </div>
      <div>
        {lessons.map((lesson) => {
          const completed = isLessonCompleted(lesson.id);
          return (
            <button
              type="button"
              key={lesson.id}
              className={completed ? "completed" : ""}
              aria-pressed={completed}
              onClick={() => toggleLesson(lesson.id)}
            >
              <span aria-hidden="true">{completed ? "✓" : "+"}</span>
              <b>{pick(lesson.title, lesson.titleEn)}</b>
              <small>{completed ? pick("已完成", "Complete") : pick("标记完成", "Mark complete")}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}
