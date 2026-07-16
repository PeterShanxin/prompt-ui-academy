"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "zh" | "en";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  pick: <T>(zh: T, en: T) => T;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("prompt-ui-locale");
        if (saved === "zh" || saved === "en") {
          setLocaleState(saved);
          return;
        }
        if (!window.navigator.language.toLowerCase().startsWith("zh")) setLocaleState("en");
      } catch { /* Keep the default locale when storage is unavailable. */ }
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    try { window.localStorage.setItem("prompt-ui-locale", next); } catch { /* Keep the in-memory choice. */ }
  };

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    pick: <T,>(zh: T, en: T) => locale === "zh" ? zh : en,
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
