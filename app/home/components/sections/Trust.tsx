"use client";
import { Plus } from "lucide-react";
import { useCopy } from "../../i18n/LocaleProvider";
import { Phrases } from "../HomeBands";
import { SecondaryLink } from "./Actions";

/** Data separation up front, then the questions buyers ask; pricing lives in the FAQ, not as a selling point. */
export function SecurityFaq() {
  const { t } = useCopy();
  return (
    <section id="faq" className="landing-container grid gap-10 py-16 md:grid-cols-12 md:py-20">
      <div id="security" className="md:col-span-4">
        <h2 className="text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-(--l-ink) md:text-[36px]">
          <Phrases text={t.security.headline} />
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-(--l-ink-2)">{t.security.body}</p>
      </div>
      <div className="md:col-span-7 md:col-start-6">
        <h2 className="mb-4 text-[20px] font-semibold text-(--l-ink)">{t.faq.headline}</h2>
        {t.faq.items.map((item) => (
          <details key={item.q} className="l-faq group border-b border-(--l-line) first-of-type:border-t">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-[17px] font-semibold text-(--l-ink) [&::-webkit-details-marker]:hidden">
              {item.q}
              <Plus size={20} className="shrink-0 text-(--l-ink-2) transition-transform duration-300 group-open:rotate-45" aria-hidden />
            </summary>
            <p className="l-faq-body max-w-[64ch] pb-5 text-[16px] leading-relaxed text-(--l-ink-2)">{item.a}</p>
          </details>
        ))}
        <div className="mt-6">
          <SecondaryLink href="/contact-sale?topic=packages">{t.actions.packages}</SecondaryLink>
        </div>
      </div>
    </section>
  );
}
