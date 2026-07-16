"use client";

import { useMemo, useState } from "react";
import { categories, uiTerms, type Category } from "../lib/content";
import { useLearningProgress } from "./AppShell";
import { TermPreview } from "./TermPreview";

export function DictionaryView() {
  const { learned, toggleLearned } = useLearningProgress();
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => uiTerms.filter((term) => {
    const matchesCategory = category === "all" || term.category === category;
    const needle = query.trim().toLowerCase();
    return matchesCategory && (!needle || `${term.cn} ${term.en} ${term.description}`.toLowerCase().includes(needle));
  }), [category, query]);

  return (
    <section className="content-section dictionary-section route-content-section" aria-labelledby="dictionary-list-title">
      <div className="section-heading compact-heading"><div><p className="section-kicker">VISUAL DICTIONARY</p><h2 id="dictionary-list-title">8 个高频 UI 部件</h2><p>用筛选和搜索找到它，看到真实形态，再把标准名称带进 Prompt。</p></div><div className="section-stat"><strong>{learned.length}</strong><span>/ {uiTerms.length} 已掌握</span></div></div>
      <div className="dictionary-toolbar"><div className="filter-row" aria-label="按类别筛选">{categories.map((item) => <button key={item.id} type="button" className={category === item.id ? "active" : ""} onClick={() => setCategory(item.id)} aria-pressed={category === item.id}>{item.label}</button>)}</div><label className="search-field"><span aria-hidden="true">⌕</span><span className="sr-only">搜索 UI 名词</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜 Modal、按钮、加载…" /></label></div>
      {filtered.length ? <div className="term-grid">{filtered.map((term, index) => {
        const isLearned = learned.includes(term.id);
        return <article className="term-card" key={term.id}><div className="term-card__number">{String(index + 1).padStart(2, "0")}</div><TermPreview kind={term.id} /><div className="term-card__meta"><span>{term.categoryLabel}</span><button type="button" onClick={() => toggleLearned(term.id)} className={isLearned ? "learned" : ""} aria-pressed={isLearned}>{isLearned ? "✓ 已掌握" : "+ 标记学会"}</button></div><h3>{term.cn} <small>{term.en}</small></h3><p>{term.description}</p><div className="prompt-snippet"><span>Prompt 这样说</span><q>{term.prompt}</q></div></article>;
      })}</div> : <div className="empty-results"><strong>没找到这个叫法</strong><span>试试用你看到的样子来搜，例如“弹窗”或“灰色加载块”。</span></div>}
    </section>
  );
}
