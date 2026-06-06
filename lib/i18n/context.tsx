"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  detectDefaultLocale,
  usesEthiopicFont,
  type Locale,
} from "./locales";
import { t as translate, type TranslationKey } from "./translations";

const STORAGE_KEY = "kidwell_locale";
const VALID: Locale[] = ["en", "am", "om", "ti"];

function applyLocaleToDocument(locale: Locale) {
  document.documentElement.lang = locale;
  document.body.classList.remove(
    "locale-en",
    "locale-am",
    "locale-om",
    "locale-ti",
    "font-ethiopic"
  );
  document.body.classList.add(`locale-${locale}`);
  if (usesEthiopicFont(locale)) {
    document.body.classList.add("font-ethiopic");
  }
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("am");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    const initial =
      saved && VALID.includes(saved) ? saved : detectDefaultLocale();
    setLocaleState(initial);
    applyLocaleToDocument(initial);
    setReady(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyLocaleToDocument(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale]
  );

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
