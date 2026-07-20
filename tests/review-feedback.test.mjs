import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const readSource = (path) => readFile(new URL(path, root), "utf8");

test("uses clear founding-learner copy for signed-in and signed-out learners", async () => {
  const source = await readSource("app/components/CommunityProof.tsx");

  assert.match(source, /你是创始学员中的一员！/);
  assert.match(source, /You’re among the founding learners!/);
  assert.match(source, /现在成为创始学员的一员/);
  assert.match(source, /Become one of the founding learners/);
});

test("closes the sign-in dialog only when a click lands outside its bounds", async () => {
  const source = await readSource("app/components/AuthModal.tsx");

  assert.match(source, /getBoundingClientRect\(\)/);
  assert.match(source, /event\.clientX < rect\.left/);
  assert.match(source, /event\.clientY > rect\.bottom/);
  assert.match(source, /onClick=\{closeFromBackdrop\}/);
});

test("brings the newly rendered quiz result into view", async () => {
  const source = await readSource("app/components/KnowledgeQuiz.tsx");

  assert.match(source, /resultRef/);
  assert.match(source, /scrollIntoView\(\{ behavior: "smooth", block: "start" \}\)/);
  assert.match(source, /ref=\{resultRef\}/);
});

test("links every course-map lesson to a distinct relevant anchor", async () => {
  const [content, dictionary, motion, prompt, quiz] = await Promise.all([
    readSource("app/lib/content.ts"),
    readSource("app/components/DictionaryView.tsx"),
    readSource("app/components/MotionPlayground.tsx"),
    readSource("app/components/PromptLab.tsx"),
    readSource("app/components/KnowledgeQuiz.tsx"),
  ]);

  const lessonIds = [
    "ui-components-patterns-structure",
    "ui-navigation-inputs",
    "ui-overlays-feedback",
    "motion-enter-exit",
    "motion-duration-easing",
    "motion-spring-stagger",
    "prompt-five-part",
    "prompt-vague-to-precise",
    "prompt-quiz-review",
  ];

  for (const lessonId of lessonIds) {
    assert.match(content, new RegExp(`href: "\\/[^\"]+#${lessonId}"`));
  }

  assert.match(dictionary, /ui-components-patterns-structure/);
  assert.match(dictionary, /ui-navigation-inputs/);
  assert.match(dictionary, /ui-overlays-feedback/);
  assert.match(motion, /motion-enter-exit/);
  assert.match(motion, /motion-duration-easing/);
  assert.match(motion, /motion-spring-stagger/);
  assert.match(prompt, /prompt-five-part/);
  assert.match(prompt, /prompt-vague-to-precise/);
  assert.match(quiz, /prompt-quiz-review/);
});

test("matches the motion hero badge to the playground defaults", async () => {
  const source = await readSource("app/components/CoursePageViews.tsx");

  assert.match(source, /motion-orbit[\s\S]*420ms[\s\S]*Smooth out/);
});
