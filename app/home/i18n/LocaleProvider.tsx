"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { copy, type Copy, type Locale } from "./copy";

const STORAGE_KEY = "landing-locale";

type LocaleValue = { t: Copy; locale: Locale; setLocale: (l: Locale) => void };

const LocaleContext = createContext<LocaleValue | null>(null);

function readStoredLocale(): Locale | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "th" || v === "en" ? v : null;
  } catch {
    // Private mode or blocked storage: fall back to the browser language.
    return null;
  }
}

/** Language for the public landing pages. Thai first; a saved choice or a non-Thai browser switches to English after mount. */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("th");

  useEffect(() => {
    const stored = readStoredLocale();
    const initial = stored ?? (navigator.language.toLowerCase().startsWith("th") ? "th" : "en");
    setLocaleState(initial);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // The choice still applies for this visit; it just won't be remembered.
    }
  }, []);

  return <LocaleContext.Provider value={{ t: copy[locale], locale, setLocale }}>{children}</LocaleContext.Provider>;
}

/** Copy and locale controls for landing components; must render inside LandingShell. */
export function useCopy(): LocaleValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useCopy must be used inside LocaleProvider (LandingShell)");
  return value;
}
