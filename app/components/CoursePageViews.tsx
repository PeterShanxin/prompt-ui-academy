"use client";

import { DictionaryView } from "./DictionaryView";
import { useI18n } from "./I18n";
import { KnowledgeQuiz } from "./KnowledgeQuiz";
import { LearnOverview } from "./LearnOverview";
import { MotionPlayground } from "./MotionPlayground";
import { NextStop } from "./NextStop";
import { PromptLab } from "./PromptLab";

export function LearnPageView() {
  const { pick } = useI18n();
  return <><section className="page-hero course-page-hero"><div><p className="section-kicker">LEARNING PATH</p><h1>{pick("一条真正能走完的", "A practical course for")}<br />{pick("AI 界面协作课程", "AI interface collaboration")}</h1><p>{pick("不从 Prompt 模板开始。先建立界面词汇，再理解动效，最后把它们组合成清晰指令。", "Do not start with prompt templates. Build a UI vocabulary, understand motion, then combine both into clear instructions.")}</p></div><aside><span>{pick("课程结构", "COURSE STRUCTURE")}</span><strong>3</strong><p>{pick("章 · 9 个短课", "chapters · 9 lessons")}</p><i>{pick("约 45 分钟", "about 45 minutes")}</i></aside></section><LearnOverview /><NextStop eyebrow={pick("第一站", "FIRST STOP")} title={pick("从 UI 词典开始", "Start with the UI dictionary")} description={pick("先掌握八个最常见的界面名称，后面的 Prompt 才有共同语言。", "Learn eight common interface names first, so your later prompts have a shared vocabulary.")} href="/dictionary" label={pick("打开 UI 词典", "Open the UI dictionary")} /></>;
}

export function DictionaryPageView() {
  const { pick } = useI18n();
  return <><section className="page-hero dictionary-page-hero"><div><p className="section-kicker">UI VISUAL DICTIONARY</p><h1>{pick("看到那个东西，", "See the thing,")}<br />{pick("终于知道它叫什么", "finally know its name")}</h1><p>{pick("按类别浏览或直接搜索。每张卡都给出准确名称、用途和一句可复用的 Prompt 描述。", "Browse by category or search directly. Every card gives you the precise name, its purpose, and a reusable prompt description.")}</p></div><aside className="dictionary-specimen" aria-hidden="true"><div><span>TOOLTIP</span><b>?</b></div><div><span>TOAST</span><b>✓ {pick("已保存", "SAVED")}</b></div><div><span>SWITCH</span><i><em /></i></div></aside></section><DictionaryView /><NextStop eyebrow={pick("下一站", "NEXT STOP")} title={pick("让静态界面动起来", "Bring the static interface to life")} description={pick("知道部件名称后，再学习 Fade、Slide、Spring 和 Stagger 的区别。", "Once you know the component names, learn the difference between Fade, Slide, Spring, and Stagger.")} href="/motion" label={pick("进入动效实验", "Open the motion playground")} /></>;
}

export function MotionPageView() {
  const { pick } = useI18n();
  return <><section className="page-hero motion-page-hero"><div><p className="section-kicker">MOTION PLAYGROUND</p><h1>{pick("“丝滑一点”", "‘Make it smoother’")}<br />{pick("不是动效参数", "is not a motion spec")}</h1><p>{pick("亲手调持续时间和缓动曲线，感受不同动效，再把准确说法带进 Prompt。", "Adjust duration and easing yourself, feel the difference, then bring the precise wording into your prompt.")}</p></div><aside className="motion-orbit" aria-hidden="true"><i /><span>240ms</span><b>ease-out</b></aside></section><MotionPlayground /><section className="motion-cheatsheet"><div className="section-heading compact-heading"><div><p className="section-kicker">QUICK REFERENCE</p><h2>{pick("四个参数，决定动效感觉", "Four parameters shape how motion feels")}</h2></div></div><div><article><span>01</span><h3>Property</h3><p>{pick("什么在变 - 透明度、位置、尺寸或颜色。", "What changes: opacity, position, size, or color.")}</p></article><article><span>02</span><h3>Duration</h3><p>{pick("变化多久 - 微交互通常在 150 到 400ms。", "How long it changes: micro-interactions usually take 150 to 400ms.")}</p></article><article><span>03</span><h3>Easing</h3><p>{pick("速度怎么变 - 避免所有场景都使用 linear。", "How speed changes: avoid using linear for every situation.")}</p></article><article><span>04</span><h3>Sequence</h3><p>{pick("多个元素同时还是依次发生。", "Whether multiple elements move together or in sequence.")}</p></article></div></section><NextStop eyebrow={pick("下一站", "NEXT STOP")} title={pick("确认你真的会命名", "Make sure you can name it")} description={pick("用四个真实情境做一轮快速检查，然后再进入 Prompt 实验室。", "Test yourself with four real situations, then continue to the Prompt Lab.")} href="/quiz" label={pick("开始 4 题小测", "Start the four-question quiz")} /></>;
}

export function QuizPageView() {
  const { pick } = useI18n();
  return <><section className="page-hero quiz-page-hero"><div><p className="section-kicker">KNOWLEDGE CHECK</p><h1>{pick("别看答案，", "Without looking it up,")}<br />{pick("你叫得出它吗？", "can you name it?")}</h1><p>{pick("四个常见场景，不考冷知识。答完立刻得到解释，也可以随时重测。", "Four common scenarios with no trivia. Get an explanation immediately and retake the quiz anytime.")}</p></div><aside className="quiz-page-score" aria-hidden="true"><span>?</span><span>?</span><span>?</span><span>?</span></aside></section><KnowledgeQuiz /><NextStop eyebrow={pick("最后一站", "FINAL STOP")} title={pick("把知识写进 Prompt", "Put the knowledge into a prompt")} description={pick("现在用真实输入对比模糊和精确描述，观察模拟界面如何响应。", "Now compare vague and precise descriptions and watch how the simulated interface responds.")} href="/lab" label={pick("进入 Prompt 实验室", "Open the Prompt Lab")} /></>;
}

export function LabPageView() {
  const { pick } = useI18n();
  return <><section className="page-hero lab-page-hero"><div><p className="section-kicker">PROMPT LAB</p><h1>{pick("别背模板，", "Do not memorize templates,")}<br />{pick("直接观察因果", "observe cause and effect")}</h1><p>{pick("编辑左侧 Prompt。右侧模拟界面会根据组件、尺寸、风格、状态和动效关键词即时改变。", "Edit the prompt on the left. The simulated interface reacts instantly to component, dimension, style, state, and motion keywords.")}</p></div><aside className="lab-formula" aria-hidden="true"><span>{pick("目标", "GOAL")}</span><i>+</i><span>{pick("部件", "COMPONENT")}</span><i>+</i><span>{pick("约束", "CONSTRAINTS")}</span><i>=</i><b>{pick("可控输出", "CONTROLLED OUTPUT")}</b></aside></section><PromptLab /><NextStop eyebrow={pick("完成一轮", "ROUND COMPLETE")} title={pick("回到课程地图继续复习", "Return to the course map to review")} description={pick("你的词典掌握进度会保留在当前设备，可以随时回来补齐。", "Your dictionary progress stays on this device, so you can return and fill any gaps.")} href="/learn" label={pick("查看学习进度", "View learning progress")} /></>;
}
