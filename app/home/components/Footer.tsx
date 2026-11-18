"use client";
import Link from "next/link";
import { useCopy } from "../i18n/LocaleProvider";

const LINE_URL = "https://line.me/R/ti/p/@osdofficial";

export default function Footer() {
  const { t } = useCopy();
  const f = t.footer;

  const contacts = [
    { label: f.website, value: "www.aicave.ai", href: "https://www.aicave.ai" },
    { label: f.line, value: "@osdofficial", href: LINE_URL },
    { label: f.email, value: "AiCave@osd.co.th", href: "mailto:AiCave@osd.co.th" },
    { label: f.email, value: "osd_support@osd.co.th", href: "mailto:osd_support@osd.co.th" },
    { label: f.phone, value: "+66 2 080 1111", href: "tel:+6620801111" },
  ];

  const pages = [
    { href: "/home", label: f.home },
    { href: "/features", label: t.nav.features },
    { href: "/contact-sale?topic=demo", label: t.actions.demo },
  ];

  return (
    <footer className="border-t border-(--l-line) bg-(--l-surface)">
      <div className="landing-container grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <img src="/images/logo-1.png" alt="AI Cave" className="h-8" />
          <p className="mt-3 text-[15px] font-medium text-(--l-ink)">{f.tagline}</p>
          <p className="mt-6 text-sm font-semibold text-(--l-ink)">{f.office}</p>
          <p className="mt-1 max-w-[42ch] text-sm leading-relaxed text-(--l-ink-2)">{f.address}</p>
        </div>

        <div className="md:col-span-4">
          <h2 className="text-sm font-semibold text-(--l-ink)">{f.contact}</h2>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {contacts.map((c) => (
              <div key={c.value} className="contents">
                <dt className="text-(--l-ink-2)">{c.label}</dt>
                <dd>
                  <a
                    href={c.href}
                    className="break-all text-(--l-ink) underline-offset-4 hover:underline"
                    {...(c.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {c.value}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <nav className="md:col-span-3" aria-label={f.pages}>
          <h2 className="text-sm font-semibold text-(--l-ink)">{f.pages}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {pages.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="text-(--l-ink-2) transition-colors duration-200 hover:text-(--l-ink)">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-(--l-line)">
        <p className="landing-container py-5 text-sm text-(--l-ink-2)">{f.credit}</p>
      </div>
    </footer>
  );
}
