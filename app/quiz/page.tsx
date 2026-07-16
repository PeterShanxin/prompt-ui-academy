import type { Metadata } from "next";
import { KnowledgeQuiz } from "../components/KnowledgeQuiz";
import { NextStop } from "../components/NextStop";

export const metadata: Metadata = { title: "UI 名称小测 - 界面话术", description: "用四道互动题检查你能否准确识别常用 UI 部件。" };

export default function QuizPage() {
  return <><section className="page-hero quiz-page-hero"><div><p className="section-kicker">KNOWLEDGE CHECK</p><h1>别看答案，<br />你叫得出它吗？</h1><p>四个常见场景，不考冷知识。答完立刻得到解释，也可以随时重测。</p></div><aside className="quiz-page-score" aria-hidden="true"><span>?</span><span>?</span><span>?</span><span>?</span></aside></section><KnowledgeQuiz /><NextStop eyebrow="最后一站" title="把知识写进 Prompt" description="现在用真实输入对比模糊和精确描述，观察模拟界面如何响应。" href="/lab" label="进入 Prompt 实验室" /></>;
}
