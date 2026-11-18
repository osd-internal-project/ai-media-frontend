"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { FEATURES } from "@/app/config/features";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { useCopy } from "../i18n/LocaleProvider";
import type { Locale } from "../i18n/copy";
import { DemoButton } from "./sections/Actions";

function ModeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const { t } = useCopy();
  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={mode === "dark" ? t.nav.toLight : t.nav.toDark}
      className="grid h-10 w-10 place-items-center rounded-full text-(--l-ink-2) transition-colors duration-200 hover:bg-(--l-raised) hover:text-(--l-ink)"
    >
      {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

const locales: { id: Locale; label: string }[] = [
  { id: "th", label: "TH" },
  { id: "en", label: "EN" },
];

function LocaleSwitch() {
  const { locale, setLocale, t } = useCopy();
  return (
    <div role="group" aria-label={t.nav.language} className="flex rounded-full bg-(--l-raised) p-0.5 text-[13px] font-semibold">
      {locales.map((l) => (
        <button
          key={l.id}
          type="button"
          lang={l.id}
          aria-pressed={locale === l.id}
          onClick={() => setLocale(l.id)}
          className={`rounded-full px-3 py-2 transition-colors duration-200 ${
            locale === l.id ? "bg-(--l-bg) text-(--l-ink) shadow-[0_1px_3px_rgba(0,0,0,0.18)]" : "text-(--l-ink-2) hover:text-(--l-ink)"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { t } = useCopy();

  const links = [
    { href: "/home", label: t.nav.home },
    { href: "/features", label: t.nav.features },
    ...(FEATURES.billing ? [{ href: "/pricing", label: t.nav.pricing }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-(--l-line) bg-[color-mix(in_srgb,var(--l-bg)_85%,transparent)] backdrop-blur-md">
      <div className="landing-container flex h-16 items-center justify-between gap-4">
        <Link href="/home" className="flex shrink-0 items-center gap-2">
          <img src="/images/logo-1.png" alt="AI Cave" className="h-8" />
        </Link>

        {/* Links sit with the actions on the right, as before; a separate group would float mid-bar. */}
        <div className="hidden items-center gap-2 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="px-3 text-[15px] font-medium text-(--l-ink-2) transition-colors duration-200 hover:text-(--l-ink)">
              {l.label}
            </Link>
          ))}
          <span className="mx-2 h-5 w-px bg-(--l-line)" aria-hidden />
          <LocaleSwitch />
          <ModeToggle />
          <Link href="/login" className="px-2 text-[15px] font-medium text-(--l-ink) transition-colors duration-200 hover:text-(--l-accent)">
            {t.nav.login}
          </Link>
          <DemoButton size="sm" />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <LocaleSwitch />
          <ModeToggle />
          <button
            type="button"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="grid h-10 w-10 place-items-center rounded-full text-(--l-ink)"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-(--l-line) bg-(--l-bg) md:hidden">
          <div className="landing-container flex flex-col gap-1 py-4">
            {[...links, { href: "/login", label: t.nav.login }].map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-2 py-3 text-base font-medium text-(--l-ink)">
                {l.label}
              </Link>
            ))}
            <DemoButton className="mt-2 w-full" onClick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </nav>
  );
}
