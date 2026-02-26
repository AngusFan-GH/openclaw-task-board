"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, Locale } from "./dictionaries";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dict: (typeof dictionaries)[Locale];
};

const STORAGE_KEY = "openclaw-locale";
const I18nContext = createContext<I18nContextValue | null>(null);

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "en" ? "en" : "zh";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(readInitialLocale);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, dict: dictionaries[locale] }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
