"use client";
import type { CSSProperties, ReactNode } from "react";
import { aiCaveColors as c } from "@/app/theme/themeConfig";
import { useThemeMode, type ThemeMode } from "@/app/components/ThemeProvider";
import { LocaleProvider } from "../i18n/LocaleProvider";
import "./landing.css";

// Landing tokens come from the app palette so the public site matches the signed-in app in both modes.
const landingVars: Record<ThemeMode, Record<string, string>> = {
  dark: {
    "--l-bg": c.neutral900,
    "--l-surface": c.neutral800,
    "--l-raised": c.neutral700,
    "--l-line": c.neutral600,
    "--l-ink": c.neutral100,
    "--l-ink-2": c.neutral500,
    "--l-primary": c.primary,
    "--l-primary-ink": c.neutral100,
    // Darker than the button colour so text on the band passes 4.5:1 (white 7.6:1, secondary 6:1).
    "--l-band": c.primaryDark,
    "--l-band-ink": c.neutral100,
    "--l-band-ink-2": c.primaryLight,
    "--l-accent": c.secondary,
    "--l-grad-a": c.primary,
    "--l-grad-b": c.secondary,
    "--l-warn": "#F5A524",
  },
  light: {
    "--l-bg": c.lightCanvas,
    "--l-surface": c.lightSurface,
    "--l-raised": c.lightRaised,
    "--l-line": c.lightBorder,
    "--l-ink": c.lightInk,
    "--l-ink-2": c.lightInkSecondary,
    "--l-primary": c.lightPrimary,
    "--l-primary-ink": c.neutral100,
    "--l-band": c.lightPrimaryText,
    "--l-band-ink": c.neutral100,
    "--l-band-ink-2": c.lightPrimaryBg,
    "--l-accent": c.lightPrimaryText,
    "--l-grad-a": c.lightPrimary,
    "--l-grad-b": "#078A6D",
    "--l-warn": "#B76E00",
  },
};

/** Page frame for the public landing pages: palette variables, background, selection and focus styling. */
export default function LandingShell({ children }: { children: ReactNode }) {
  const { mode } = useThemeMode();
  return (
    <main className="landing" style={landingVars[mode] as CSSProperties}>
      {/* globals.css forces font-family 'Prompt' but nothing loads it; this sheet registers that family. React hoists it to <head>. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&display=swap"
        precedence="default"
      />
      <LocaleProvider>{children}</LocaleProvider>
    </main>
  );
}
