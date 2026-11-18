"use client";
import { useEffect } from "react";
import { useCopy } from "./LocaleProvider";

/** Keeps the tab title and meta description in the visitor's language; the server layout ships the Thai default. */
export function useLandingMeta(page: "home" | "features") {
  const { t } = useCopy();
  const title = page === "home" ? t.seo.homeTitle : t.seo.featuresTitle;
  const description = page === "home" ? t.seo.homeDescription : t.seo.featuresDescription;
  useEffect(() => {
    const apply = () => {
      if (document.title !== title) document.title = title;
      document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    };
    apply();
    // Next re-applies the layout's metadata after client navigation; keep the visitor's language on top.
    const mo = new MutationObserver(apply);
    mo.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, [title, description]);
}
