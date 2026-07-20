"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowIcon } from "./Icons";
import { I18nProvider, useI18n } from "./I18n";
import { AccountControls } from "./AccountControls";
import { AuthModal } from "./AuthModal";
import { AuthProvider } from "./AuthProvider";
import {
  LearningProgressProvider,
  useLearningProgress,
} from "./LearningProgressProvider";
import { SaveProgressNotice } from "./SaveProgressNotice";

const navItems = [
  { href: "/learn", zh: "学习路径", en: "Learning path" },
  { href: "/dictionary", zh: "UI 词典", en: "UI dictionary" },
  { href: "/motion", zh: "动效", en: "Motion" },
  { href: "/quiz", zh: "小测", en: "Quiz" },
  { href: "/lab", zh: "Prompt 实验室", en: "Prompt lab" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <LearningProgressProvider>
          <AppShellContent>{children}</AppShellContent>
          <AuthModal />
        </LearningProgressProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

function AppShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { locale, setLocale, pick } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const { progress, noteActivity } = useLearningProgress();

  useEffect(() => {
    noteActivity(pathname);
  }, [noteActivity, pathname]);

  useEffect(() => {
    const pageNames: Record<string, [string, string]> = {
      "/": ["首页", "Home"],
      "/learn": ["学习路径", "Learning Path"],
      "/dictionary": ["UI 视觉词典", "UI Visual Dictionary"],
      "/motion": ["动效实验", "Motion Playground"],
      "/quiz": ["UI 名称小测", "UI Vocabulary Quiz"],
      "/lab": ["Prompt 实验室", "Prompt Lab"],
    };
    const page = pageNames[pathname] ?? pageNames["/"];
    document.title = locale === "zh" ? `${page[0]} - 界面话术` : `${page[1]} - Interface Language`;
  }, [locale, pathname]);

  return (
    <>
      <a className="skip-link" href="#main-content">{pick("跳到主要内容", "Skip to main content")}</a>
      <header className="site-header">
        <a className="brand" href="/" aria-label={pick("界面话术首页", "Interface Language home")} onClick={() => setMenuOpen(false)}><span className="brand-mark" aria-hidden="true">介</span><span>{pick("界面话术", "Interface Language")}</span></a>
        <nav className={menuOpen ? "menu-open" : ""} aria-label={pick("主导航", "Primary navigation")}>
          {navItems.map((item) => <a key={item.href} className={pathname === item.href ? "active" : ""} href={item.href} onClick={() => setMenuOpen(false)}>{pick(item.zh, item.en)}</a>)}
        </nav>
        <div className="header-actions">
          <button className="language-toggle" type="button" onClick={() => setLocale(locale === "zh" ? "en" : "zh")} aria-label={pick("切换到英文", "Switch to Chinese")}><span>{locale === "zh" ? "EN" : "中文"}</span><i aria-hidden="true">↔</i></button>
          <AccountControls />
          <a className="header-progress" href="/learn" aria-label={`${pick("当前学习进度", "Current learning progress")} ${progress}%`}><span>{pick("学习进度", "Progress")}</span><strong>{progress}%</strong><i><b style={{ width: `${progress}%` }} /></i><ArrowIcon /></a>
          <button className="mobile-menu-button" type="button" aria-label={menuOpen ? pick("关闭菜单", "Close menu") : pick("打开菜单", "Open menu")} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}><i /><i /></button>
        </div>
      </header>
      <SaveProgressNotice />
      <main className="page-main" id="main-content">{children}</main>
      <footer><a className="brand footer-brand" href="/"><span className="brand-mark">介</span><span>{pick("界面话术", "Interface Language")}</span></a><p>{pick("一个帮助人类与 AI 更好协作的互动学习实验。", "An interactive experiment for better human-AI collaboration.")}</p><a href="/learn">{pick("继续学习", "Keep learning")} →</a></footer>
    </>
  );
}
