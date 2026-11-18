"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { useCopy } from "../../i18n/LocaleProvider";

export type DemoTopic = "demo" | "packages" | "community";

type DemoButtonProps = { topic?: DemoTopic; size?: "sm" | "md"; className?: string; onClick?: () => void };

/** The page's one primary action. Same color in every spot; the topic pre-fills the contact form's message. */
export function DemoButton({ topic = "demo", size = "md", className = "", onClick }: DemoButtonProps) {
  const { t } = useCopy();
  const label = topic === "packages" ? t.actions.packages : topic === "community" ? t.actions.community : t.actions.demo;
  const pad = size === "sm" ? "px-5 py-2.5 text-[15px]" : "px-7 py-3.5 text-base";
  return (
    <Link
      href={`/contact-sale?topic=${topic}`}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full bg-(--l-primary) font-semibold text-(--l-primary-ink) shadow-[0_10px_24px_-12px_var(--l-primary)] transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.98] ${pad} ${className}`}
    >
      {label}
    </Link>
  );
}

/** Quiet companion to DemoButton: an outlined link for the second choice in a group. */
export function SecondaryLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full border border-(--l-line) px-7 py-3.5 text-base font-medium text-(--l-ink) transition-colors duration-200 hover:bg-(--l-raised) ${className}`}
    >
      {children}
    </Link>
  );
}
