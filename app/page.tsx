import { ArrowIcon } from "./components/Icons";
import { HomeQuickQuiz } from "./components/HomeQuickQuiz";

export default function Home() {
  return (
    <>
      <section className="hero home-hero" id="top">
        <div className="hero-copy"><div className="course-pill"><span aria-hidden="true">✦</span> AI 协作基础课</div><h1>先学会描述，<br />AI 才能准确创造</h1><p>从看见、命名到亲手练习，掌握界面语言，<br className="desktop-break" />让每一次 Prompt 都更清晰。</p><div className="hero-actions"><a className="primary-button" href="/learn">查看学习路径 <ArrowIcon /></a><a className="text-button" href="/dictionary">先逛逛词典 <span>↗</span></a></div><div className="lesson-progress"><div><strong>3 章课程</strong><span>/ 约 45 分钟</span></div><div className="progress-track"><i /></div><span>边看边练</span></div><div className="method-note" aria-label="学习方法"><b>01</b><span>看见 <i>→</i> 命名 <i>→</i> 描述</span></div></div>
        <HomeQuickQuiz />
      </section>
      <div className="hero-decoration blue" aria-hidden="true" /><div className="hero-decoration yellow" aria-hidden="true" /><div className="dot-field" aria-hidden="true" />

      <section className="home-hubs" aria-labelledby="home-hubs-title">
        <div className="section-heading compact-heading"><div><p className="section-kicker">CHOOSE YOUR NEXT STEP</p><h2 id="home-hubs-title">不再把所有东西塞在一页</h2><p>每个学习工具现在都有自己的空间、URL 和下一步。</p></div></div>
        <div className="hub-grid">
          <a className="hub-card hub-learn" href="/learn"><span>01 · COURSE</span><h3>学习路径</h3><p>按三章课程从 UI 名称学到完整 Prompt。</p><b>开始课程 <ArrowIcon /></b><i>3 章</i></a>
          <a className="hub-card hub-dictionary" href="/dictionary"><span>02 · DICTIONARY</span><h3>UI 词典</h3><p>看形态、记名称、复制准确说法。</p><b>浏览 8 个词 <ArrowIcon /></b></a>
          <a className="hub-card hub-motion" href="/motion"><span>03 · MOTION</span><h3>动效实验</h3><p>亲手调速度、缓动和进入方式。</p><b>开始调参数 <ArrowIcon /></b></a>
          <a className="hub-card hub-quiz" href="/quiz"><span>04 · QUIZ</span><h3>快速小测</h3><p>用四道题检查你是否真的会叫名字。</p><b>挑战一下 <ArrowIcon /></b></a>
          <a className="hub-card hub-lab" href="/lab"><span>05 · LAB</span><h3>Prompt 实验室</h3><p>编辑 Prompt，实时观察模拟界面如何改变。</p><b>比较模糊与精确 <ArrowIcon /></b><i>LIVE</i></a>
        </div>
      </section>

      <section className="home-principle"><p>学习目标不是背术语</p><h2>而是把脑中的“感觉”，<br />翻译成 AI 能执行的约束。</h2><div><article><span>1</span><b>看见</b><p>观察真实部件和交互。</p></article><article><span>2</span><b>命名</b><p>说出标准中英文名称。</p></article><article><span>3</span><b>控制</b><p>补上布局、状态与动效。</p></article></div></section>
      <section className="final-cta home-final-cta"><span>准备好不再说“做得高级一点”了吗？</span><h2>从第一章开始，<br />把要求说清楚。</h2><a href="/learn">打开学习路径 <ArrowIcon /></a><div aria-hidden="true">UI / MOTION / PROMPT</div></section>
    </>
  );
}
