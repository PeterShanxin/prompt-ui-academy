"use client";

import { useMemo, useState } from "react";
import { precisePrompt, vaguePrompt } from "../lib/content";

export function PromptLab() {
  const [prompt, setPrompt] = useState(vaguePrompt);
  const [copied, setCopied] = useState(false);
  const checks = useMemo(() => [
    { label: "具体部件", pass: /(modal|dialog|input|button|模态|输入|按钮)/i.test(prompt) },
    { label: "尺寸与布局", pass: /(\d+\s?(px|rem)|宽|居中|两栏|间距)/i.test(prompt) },
    { label: "视觉风格", pass: /(圆角|颜色|蓝色|阴影|字体|高对比)/i.test(prompt) },
    { label: "状态与反馈", pass: /(hover|focus|错误|禁用|辅助文字|状态)/i.test(prompt) },
    { label: "动效参数", pass: /(\d+\s?ms|spring|fade|淡入|缓动|动画)/i.test(prompt) },
  ], [prompt]);
  const score = checks.filter((item) => item.pass).length;
  const preview = {
    modal: /(modal|dialog|模态)/i.test(prompt), rounded: /圆角/i.test(prompt), shadow: /阴影/i.test(prompt), labels: /标签/i.test(prompt), blue: /蓝色/i.test(prompt), focus: /focus/i.test(prompt), helper: /(错误|辅助文字)/i.test(prompt), motion: /(spring|淡入|动画|ms)/i.test(prompt),
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(prompt); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { setCopied(false); }
  };

  return (
    <section className="content-section prompt-section route-content-section" aria-labelledby="prompt-title">
      <div className="section-heading compact-heading"><div><p className="section-kicker">PROMPT LAB</p><h2 id="prompt-title">描述方式决定结果</h2><p>右侧会按你写出的关键词即时改变界面，让你直接看到“具体”和“模糊”的差别。</p></div><span className="local-badge"><i /> 本地实时模拟</span></div>
      <div className="prompt-lab"><div className="prompt-editor"><div className="editor-top"><span>你的 Prompt</span><div><button type="button" onClick={() => setPrompt(vaguePrompt)}>模糊版</button><button type="button" onClick={() => setPrompt(precisePrompt)}>精确版</button></div></div><label><span className="sr-only">编辑 Prompt</span><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} spellCheck={false} /></label><div className="editor-actions"><button className="structure-button" type="button" onClick={() => setPrompt(precisePrompt)}>✦ 一键补全结构</button><button className="copy-button" type="button" onClick={copy}>{copied ? "✓ 已复制" : "复制 Prompt"}</button></div><div className="prompt-score"><div><span>指令清晰度</span><strong>{score} / 5</strong></div><div className="score-track"><i style={{ width: `${score * 20}%` }} /></div><ul>{checks.map((item) => <li className={item.pass ? "pass" : ""} key={item.label}><span>{item.pass ? "✓" : "+"}</span>{item.label}</li>)}</ul></div></div>
        <div className="prompt-preview-panel"><div className="preview-panel-top"><span>模拟输出</span><span>关键词驱动 · 即时更新</span></div><div className={`prompt-canvas ${preview.modal ? "has-modal" : ""}`}><div className="fake-app"><header><i /><i /><i /></header><aside><b /><b /><b /></aside><main><span /><span /><span /></main></div><div className={preview.modal ? "prompt-scrim" : ""} /><div className={`login-card ${preview.rounded ? "rounded" : ""} ${preview.shadow ? "shadow" : ""} ${preview.motion ? "animated" : ""}`} key={`${score}-${prompt.length}`}><span className="login-tag">WELCOME BACK</span><h3>登录工作台</h3><p>继续你的界面学习进度</p><label className={preview.focus ? "show-focus" : ""}>{preview.labels && <span>邮箱地址</span>}<input tabIndex={-1} placeholder={preview.labels ? "name@example.com" : "邮箱"} readOnly /></label><label>{preview.labels && <span>密码</span>}<input tabIndex={-1} placeholder="••••••••" readOnly />{preview.helper && <small>密码至少需要 8 个字符</small>}</label><button tabIndex={-1} className={preview.blue ? "blue" : ""}>继续</button></div></div><p className="preview-caption">{score <= 1 ? "AI 只能猜：部件、尺寸、状态和动效都没有说清楚。" : score < 5 ? "方向更明确了，但仍有信息需要 AI 自行补全。" : "部件、布局、视觉、状态与动效都有约束，输出更可控。"}</p></div>
      </div>
      <div className="prompt-formula"><span>一个好 UI Prompt</span><div><b>目标</b><i>+</i><b>部件名称</b><i>+</i><b>布局与样式</b><i>+</i><b>状态</b><i>+</i><b>动效参数</b></div></div>
    </section>
  );
}
