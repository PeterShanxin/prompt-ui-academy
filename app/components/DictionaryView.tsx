"use client";

import { useMemo, useState } from "react";
import { categories, uiTerms, type Category } from "../lib/content";
import { useLearningProgress } from "./AppShell";
import { useI18n } from "./I18n";
import { TermPreview } from "./TermPreview";

export function DictionaryView() {
  const { learned, toggleLearned } = useLearningProgress();
  const { locale, pick } = useI18n();
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => uiTerms.filter((term) => {
    const matchesCategory = category === "all" || term.category === category;
    const needle = query.trim().toLowerCase();
    return matchesCategory && (!needle || `${term.cn} ${term.en} ${term.description} ${term.descriptionEn}`.toLowerCase().includes(needle));
  }), [category, query]);

  return (
    <section className="content-section dictionary-section route-content-section" aria-labelledby="dictionary-list-title">
      <div className="section-heading compact-heading"><div><p className="section-kicker">VISUAL DICTIONARY</p><h2 id="dictionary-list-title">{pick("8 个高频 UI 部件", "8 essential UI components")}</h2><p>{pick("用筛选和搜索找到它，看到真实形态，再把标准名称带进 Prompt。", "Filter or search, see the component in context, then bring its standard name into your prompt.")}</p></div><div className="section-stat"><strong>{learned.length}</strong><span>/ {uiTerms.length} {pick("已掌握", "mastered")}</span></div></div>
      <div className="dictionary-toolbar"><div className="filter-row" aria-label={pick("按类别筛选", "Filter by category")}>{categories.map((item) => <button key={item.id} type="button" className={category === item.id ? "active" : ""} onClick={() => setCategory(item.id)} aria-pressed={category === item.id}>{pick(item.label, item.labelEn)}</button>)}</div><label className="search-field"><span aria-hidden="true">⌕</span><span className="sr-only">{pick("搜索 UI 名词", "Search UI terms")}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={pick("搜 Modal、按钮、加载…", "Search Modal, Button, loading…")} /></label></div>
      {filtered.length ? <div className="term-grid">{filtered.map((term, index) => {
        const isLearned = learned.includes(term.id);
        return <article className="term-card" key={term.id}><div className="term-card__number">{String(index + 1).padStart(2, "0")}</div><TermPreview kind={term.id} /><div className="term-card__meta"><span>{pick(term.categoryLabel, term.categoryLabelEn)}</span><button type="button" onClick={() => toggleLearned(term.id)} className={isLearned ? "learned" : ""} aria-pressed={isLearned}>{isLearned ? pick("✓ 已掌握", "✓ Mastered") : pick("+ 标记学会", "+ Mark learned")}</button></div><h3>{locale === "zh" ? term.cn : term.en} <small>{locale === "zh" ? term.en : term.cn}</small></h3><p>{pick(term.description, term.descriptionEn)}</p><div className="prompt-snippet"><span>{pick("Prompt 这样说", "Say it like this")}</span><q>{pick(term.prompt, term.promptEn)}</q></div></article>;
      })}</div> : <div className="empty-results"><strong>{pick("没找到这个叫法", "No matching term")}</strong><span>{pick("试试用你看到的样子来搜，例如“弹窗”或“灰色加载块”。", "Try describing what you see, such as ‘popup’ or ‘gray loading blocks’.")}</span></div>}
    </section>
  );
}
