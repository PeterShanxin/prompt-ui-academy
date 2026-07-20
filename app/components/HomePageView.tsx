"use client";

import { ArrowIcon } from "./Icons";
import { CommunityProof } from "./CommunityProof";
import { HomeQuickQuiz } from "./HomeQuickQuiz";
import { useI18n } from "./I18n";

export function HomePageView() {
  const { pick } = useI18n();

  return (
    <>
      <section className="hero home-hero" id="top">
        <div className="hero-copy"><div className="course-pill"><span aria-hidden="true">✦</span> {pick("AI 协作基础课", "AI COLLABORATION BASICS")}</div><h1>{pick("先学会描述，", "Describe it clearly,")}<br />{pick("AI 才能准确创造", "then AI can create it")}</h1><p>{pick("从看见、命名到亲手练习，掌握界面语言，", "Learn interface language by seeing, naming, and practicing,")}<br className="desktop-break" />{pick("让每一次 Prompt 都更清晰。", "so every prompt becomes clearer.")}</p><div className="hero-actions"><a className="primary-button" href="/learn">{pick("查看学习路径", "View learning path")} <ArrowIcon /></a><a className="text-button" href="/dictionary">{pick("先逛逛词典", "Explore the dictionary")} <span>↗</span></a></div><CommunityProof /><div className="lesson-progress"><div><strong>{pick("3 章课程", "3 chapters")}</strong><span>/ {pick("约 45 分钟", "about 45 min")}</span></div><div className="progress-track"><i /></div><span>{pick("边看边练", "Learn by doing")}</span></div><div className="method-note" aria-label={pick("学习方法", "Learning method")}><b>01</b><span>{pick("看见", "See")} <i>→</i> {pick("命名", "Name")} <i>→</i> {pick("描述", "Describe")}</span></div></div>
        <HomeQuickQuiz />
      </section>
      <div className="hero-decoration blue" aria-hidden="true" /><div className="hero-decoration yellow" aria-hidden="true" /><div className="dot-field" aria-hidden="true" />

      <section className="home-hubs" aria-labelledby="home-hubs-title">
        <div className="section-heading compact-heading"><div><p className="section-kicker">CHOOSE YOUR NEXT STEP</p><h2 id="home-hubs-title">{pick("每个工具，都有自己的学习空间", "A focused space for every learning tool")}</h2><p>{pick("课程、词典、动效、小测和实验室各有独立页面，也始终知道下一步去哪里。", "Courses, the dictionary, motion, quizzes, and the lab each have a dedicated page and a clear next step.")}</p></div></div>
        <div className="hub-grid">
          <a className="hub-card hub-learn" href="/learn"><span>01 · COURSE</span><h3>{pick("学习路径", "Learning path")}</h3><p>{pick("按三章课程从 UI 名称学到完整 Prompt。", "Move from UI names to complete prompts in three chapters.")}</p><b>{pick("开始课程", "Start the course")} <ArrowIcon /></b><i>{pick("3 章", "3 CHAPTERS")}</i></a>
          <a className="hub-card hub-dictionary" href="/dictionary"><span>02 · DICTIONARY</span><h3>{pick("UI 词典", "UI dictionary")}</h3><p>{pick("看形态、记名称、复制准确说法。", "See the pattern, learn the name, and copy precise wording.")}</p><b>{pick("浏览 8 个词", "Browse 8 terms")} <ArrowIcon /></b></a>
          <a className="hub-card hub-motion" href="/motion"><span>03 · MOTION</span><h3>{pick("动效实验", "Motion playground")}</h3><p>{pick("亲手调速度、缓动和进入方式。", "Adjust speed, easing, and entrance patterns yourself.")}</p><b>{pick("开始调参数", "Tune the motion")} <ArrowIcon /></b></a>
          <a className="hub-card hub-quiz" href="/quiz"><span>04 · QUIZ</span><h3>{pick("快速小测", "Quick quiz")}</h3><p>{pick("用四道题检查你是否真的会叫名字。", "Use four questions to test whether you can name the patterns.")}</p><b>{pick("挑战一下", "Take the challenge")} <ArrowIcon /></b></a>
          <a className="hub-card hub-lab" href="/lab"><span>05 · LAB</span><h3>{pick("Prompt 实验室", "Prompt lab")}</h3><p>{pick("编辑 Prompt，实时观察模拟界面如何改变。", "Edit a prompt and watch the simulated interface react in real time.")}</p><b>{pick("比较模糊与精确", "Compare vague and precise")} <ArrowIcon /></b><i>LIVE</i></a>
        </div>
      </section>

      <section className="home-principle"><p>{pick("学习目标不是背术语", "THE GOAL IS NOT MEMORIZING TERMS")}</p><h2>{pick("而是把脑中的“感觉”，", "Translate the ‘feeling’ in your head")}<br />{pick("翻译成 AI 能执行的约束。", "into constraints AI can execute.")}</h2><div><article><span>1</span><b>{pick("看见", "See")}</b><p>{pick("观察真实部件和交互。", "Observe real components and interactions.")}</p></article><article><span>2</span><b>{pick("命名", "Name")}</b><p>{pick("说出标准中英文名称。", "Use the standard UI term.")}</p></article><article><span>3</span><b>{pick("控制", "Control")}</b><p>{pick("补上布局、状态与动效。", "Add layout, states, and motion.")}</p></article></div></section>
      <section className="final-cta home-final-cta"><span>{pick("准备好不再说“做得高级一点”了吗？", "Ready to stop saying ‘make it feel more premium’?")}</span><h2>{pick("从第一章开始，", "Start with chapter one")}<br />{pick("把要求说清楚。", "and make the request clear.")}</h2><a href="/learn">{pick("打开学习路径", "Open the learning path")} <ArrowIcon /></a><div aria-hidden="true">UI / MOTION / PROMPT</div></section>
    </>
  );
}
