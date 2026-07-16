"use client";

import { useState } from "react";
import { quizQuestions } from "../lib/content";
import { ArrowIcon, ReplayIcon } from "./Icons";
import { TermPreview } from "./TermPreview";

export function KnowledgeQuiz() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const question = quizQuestions[index];
  const choose = (option: string) => { if (choice) return; setChoice(option); if (option === question.answer) setScore((value) => value + 1); };
  const next = () => { if (index === quizQuestions.length - 1) { setDone(true); return; } setIndex((value) => value + 1); setChoice(null); };
  const reset = () => { setIndex(0); setChoice(null); setScore(0); setDone(false); };

  return (
    <section className="content-section knowledge-section route-content-section" aria-labelledby="knowledge-title">
      <div className="section-heading compact-heading"><div><p className="section-kicker">QUICK CHECK</p><h2 id="knowledge-title">来一轮 4 题小测</h2><p>认得不算会，能在具体情境里叫出名字才算。</p></div><span className="quiz-score">得分 <strong>{score}</strong></span></div>
      {!done ? <div className="knowledge-card"><div className="knowledge-visual"><TermPreview kind={question.preview} compact /><span>题目 {index + 1} / {quizQuestions.length}</span></div><div className="knowledge-question"><div className="quiz-step-track"><i style={{ width: `${((index + 1) / quizQuestions.length) * 100}%` }} /></div><h3>{question.question}</h3><div className="knowledge-options">{question.options.map((option) => { const selected = choice === option; const correct = choice && option === question.answer; return <button key={option} type="button" onClick={() => choose(option)} disabled={Boolean(choice)} className={`${selected ? "selected" : ""} ${correct ? "correct" : ""}`}><span>{option}</span>{choice && option === question.answer ? <b>✓</b> : <i />}</button>; })}</div><div className={`knowledge-feedback ${choice ? "visible" : ""}`} aria-live="polite">{choice ? <><strong>{choice === question.answer ? "答对了" : `正确答案是 ${question.answer}`}</strong><span>{question.explanation}</span></> : <span>选择最准确的名称</span>}</div><button className="next-question" type="button" disabled={!choice} onClick={next}>{index === quizQuestions.length - 1 ? "查看结果" : "下一题"} <ArrowIcon /></button></div></div> : <div className="quiz-result"><span className="result-burst">✦</span><p>本轮完成</p><strong>{score} / {quizQuestions.length}</strong><h3>{score === quizQuestions.length ? "你已经很会命名界面了" : score >= 2 ? "不错，再逛一遍词典会更稳" : "先别急着写 Prompt，再认几个部件"}</h3><div className="result-actions"><button type="button" onClick={reset}><ReplayIcon /> 再测一次</button><a href="/lab">进入 Prompt 实验室 →</a></div></div>}
    </section>
  );
}
