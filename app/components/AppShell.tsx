"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ArrowIcon } from "./Icons";

type LearningContextValue = {
  learned: string[];
  progress: number;
  toggleLearned: (id: string) => void;
};

const LearningContext = createContext<LearningContextValue | null>(null);

export function useLearningProgress() {
  const value = useContext(LearningContext);
  if (!value) throw new Error("useLearningProgress must be used inside AppShell");
  return value;
}

const navItems = [
  { href: "/learn", label: "学习路径" },
  { href: "/dictionary", label: "UI 词典" },
  { href: "/motion", label: "动效" },
  { href: "/quiz", label: "小测" },
  { href: "/lab", label: "Prompt 实验室" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [learned, setLearned] = useState<string[]>([]);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("ui-language-progress");
        if (saved) setLearned(JSON.parse(saved));
      } catch { /* Device storage may be unavailable. */ }
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  const toggleLearned = (id: string) => setLearned((current) => {
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    try { window.localStorage.setItem("ui-language-progress", JSON.stringify(next)); } catch { /* Keep in-memory progress. */ }
    return next;
  });

  const progress = Math.max(8, Math.round(((learned.length + 1) / 12) * 100));
  const contextValue = { learned, progress, toggleLearned };

  return (
    <LearningContext.Provider value={contextValue}>
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <header className="site-header">
        <a className="brand" href="/" aria-label="界面话术首页" onClick={() => setMenuOpen(false)}><span className="brand-mark" aria-hidden="true">介</span><span>界面话术</span></a>
        <nav className={menuOpen ? "menu-open" : ""} aria-label="主导航">
          {navItems.map((item) => <a key={item.href} className={pathname === item.href ? "active" : ""} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
        </nav>
        <a className="header-progress" href="/learn" aria-label={`当前学习进度 ${progress}%`}><span>学习进度</span><strong>{progress}%</strong><i><b style={{ width: `${progress}%` }} /></i><ArrowIcon /></a>
        <button className="mobile-menu-button" type="button" aria-label={menuOpen ? "关闭菜单" : "打开菜单"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}><i /><i /></button>
      </header>
      <main className="page-main" id="main-content">{children}</main>
      <footer><a className="brand footer-brand" href="/"><span className="brand-mark">介</span><span>界面话术</span></a><p>一个帮助人类与 AI 更好协作的互动学习实验。</p><a href="/learn">继续学习 →</a></footer>
    </LearningContext.Provider>
  );
}
