"use client";

import { useMemo, useState } from "react";
import { precisePrompt, precisePromptEn, vaguePrompt, vaguePromptEn } from "../lib/content";
import { useI18n } from "./I18n";

export function PromptLab() {
  const { pick } = useI18n();
  const [draft, setDraft] = useState<{ kind: "vague" | "precise" | "custom"; value: string }>({ kind: "vague", value: "" });
  const [copied, setCopied] = useState(false);
  const activeVaguePrompt = pick(vaguePrompt, vaguePromptEn);
  const activePrecisePrompt = pick(precisePrompt, precisePromptEn);
  const prompt = draft.kind === "vague" ? activeVaguePrompt : draft.kind === "precise" ? activePrecisePrompt : draft.value;

  const checks = useMemo(() => [
    { id: "component", label: pick("具体部件", "Specific components"), pass: /(modal|dialog|input|button|模态|输入|按钮)/i.test(prompt) },
    { id: "layout", label: pick("尺寸与布局", "Size & layout"), pass: /(\d+\s?(px|rem)|宽|居中|两栏|间距|wide|width|center|column|spacing)/i.test(prompt) },
    { id: "visual", label: pick("视觉风格", "Visual style"), pass: /(圆角|颜色|蓝色|阴影|字体|高对比|radius|rounded|color|blue|shadow|font|contrast)/i.test(prompt) },
    { id: "state", label: pick("状态与反馈", "States & feedback"), pass: /(hover|focus|错误|禁用|辅助文字|状态|error|disabled|helper|state)/i.test(prompt) },
    { id: "motion", label: pick("动效参数", "Motion parameters"), pass: /(\d+\s?ms|spring|fade|淡入|缓动|动画|easing|animate|motion)/i.test(prompt) },
  ], [pick, prompt]);
  const score = checks.filter((item) => item.pass).length;
  const preview = {
    modal: /(modal|dialog|模态)/i.test(prompt), rounded: /(圆角|radius|rounded)/i.test(prompt), shadow: /(阴影|shadow)/i.test(prompt), labels: /(标签|label)/i.test(prompt), blue: /(蓝色|blue)/i.test(prompt), focus: /focus/i.test(prompt), helper: /(错误|辅助文字|error|helper text)/i.test(prompt), motion: /(spring|淡入|动画|ms|animate|motion)/i.test(prompt),
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(prompt); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { setCopied(false); }
  };

  return (
    <section className="content-section prompt-section route-content-section" aria-labelledby="prompt-title">
      <div className="section-heading compact-heading"><div><p className="section-kicker">PROMPT LAB</p><h2 id="prompt-title">{pick("描述方式决定结果", "Your description shapes the result")}</h2><p>{pick("右侧会按你写出的关键词即时改变界面，让你直接看到“具体”和“模糊”的差别。", "The interface on the right reacts to your keywords so you can see the difference between vague and specific instructions.")}</p></div><span className="local-badge"><i /> {pick("本地实时模拟", "Live local simulation")}</span></div>
      <div className="prompt-lab"><div className="prompt-editor"><div className="editor-top"><span>{pick("你的 Prompt", "Your prompt")}</span><div><button type="button" onClick={() => setDraft({ kind: "vague", value: "" })}>{pick("模糊版", "Vague")}</button><button type="button" onClick={() => setDraft({ kind: "precise", value: "" })}>{pick("精确版", "Precise")}</button></div></div><label><span className="sr-only">{pick("编辑 Prompt", "Edit prompt")}</span><textarea value={prompt} onChange={(event) => setDraft({ kind: "custom", value: event.target.value })} spellCheck={false} /></label><div className="editor-actions"><button className="structure-button" type="button" onClick={() => setDraft({ kind: "precise", value: "" })}>✦ {pick("一键补全结构", "Complete the structure")}</button><button className="copy-button" type="button" onClick={copy}>{copied ? pick("✓ 已复制", "✓ Copied") : pick("复制 Prompt", "Copy prompt")}</button></div><div className="prompt-score"><div><span>{pick("指令清晰度", "Prompt clarity")}</span><strong>{score} / 5</strong></div><div className="score-track"><i style={{ width: `${score * 20}%` }} /></div><ul>{checks.map((item) => <li className={item.pass ? "pass" : ""} key={item.id}><span>{item.pass ? "✓" : "+"}</span>{item.label}</li>)}</ul></div></div>
        <div className="prompt-preview-panel"><div className="preview-panel-top"><span>{pick("模拟输出", "Simulated output")}</span><span>{pick("关键词驱动 · 即时更新", "Keyword-driven · Live update")}</span></div><div className={`prompt-canvas ${preview.modal ? "has-modal" : ""}`}><div className="fake-app"><header><i /><i /><i /></header><aside><b /><b /><b /></aside><main><span /><span /><span /></main></div><div className={preview.modal ? "prompt-scrim" : ""} /><div className={`login-card ${preview.rounded ? "rounded" : ""} ${preview.shadow ? "shadow" : ""} ${preview.motion ? "animated" : ""}`} key={`${score}-${prompt.length}`}><span className="login-tag">WELCOME BACK</span><h3>{pick("登录工作台", "Sign in to your workspace")}</h3><p>{pick("继续你的界面学习进度", "Continue your interface-learning progress")}</p><label className={preview.focus ? "show-focus" : ""}>{preview.labels && <span>{pick("邮箱地址", "Email address")}</span>}<input tabIndex={-1} placeholder={preview.labels ? "name@example.com" : pick("邮箱", "Email")} readOnly /></label><label>{preview.labels && <span>{pick("密码", "Password")}</span>}<input tabIndex={-1} placeholder="••••••••" readOnly />{preview.helper && <small>{pick("密码至少需要 8 个字符", "Password must be at least 8 characters")}</small>}</label><button tabIndex={-1} className={preview.blue ? "blue" : ""}>{pick("继续", "Continue")}</button></div></div><p className="preview-caption">{score <= 1 ? pick("AI 只能猜：部件、尺寸、状态和动效都没有说清楚。", "AI can only guess: components, dimensions, states, and motion are unspecified.") : score < 5 ? pick("方向更明确了，但仍有信息需要 AI 自行补全。", "The direction is clearer, but AI still has to fill in some details.") : pick("部件、布局、视觉、状态与动效都有约束，输出更可控。", "Components, layout, visuals, states, and motion are all constrained, making the output more controllable.")}</p></div>
      </div>
      <div className="prompt-formula"><span>{pick("一个好 UI Prompt", "A strong UI prompt")}</span><div><b>{pick("目标", "Goal")}</b><i>+</i><b>{pick("部件名称", "Components")}</b><i>+</i><b>{pick("布局与样式", "Layout & style")}</b><i>+</i><b>{pick("状态", "States")}</b><i>+</i><b>{pick("动效参数", "Motion")}</b></div></div>
    </section>
  );
}
