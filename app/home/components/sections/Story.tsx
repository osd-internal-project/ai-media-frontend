"use client";
import { useCopy } from "../../i18n/LocaleProvider";
import { Phrases } from "../HomeBands";
import { DemoButton } from "./Actions";

/** The visitor's week first (agency queue, leaks, no budget line), then the answer in three verbs and one number. */
export function ProblemSolution() {
  const { t } = useCopy();
  const p = t.problem;
  const s = t.solution;
  return (
    <section id="overview" className="border-y border-(--l-line) bg-(--l-surface)">
      <div className="landing-container py-16 md:py-20">
        <h2 className="max-w-[24ch] text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-(--l-ink) md:text-[36px]">
          <Phrases text={p.headline} />
        </h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
          {p.items.map((item) => (
            <li key={item.title} className="border-t border-(--l-line) pt-4">
              <h3 className="text-[17px] font-semibold text-(--l-ink)">{item.title}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-(--l-ink-2)">{item.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-14 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <h2 className="text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-(--l-ink) md:text-[36px]">
              <Phrases text={s.headline} />
            </h2>
            <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-(--l-ink-2)">{s.body}</p>
            <p className="mt-4 max-w-[60ch] text-[17px] font-medium leading-relaxed text-(--l-ink)">{s.figure}</p>
            <p className="mt-2 text-[13px] text-(--l-ink-2)">{t.results.footnote}</p>
            <div className="mt-8">
              <DemoButton />
            </div>
          </div>
          <ol className="relative md:col-span-5 md:col-start-8">
            <span className="absolute bottom-10 left-[5px] top-10 w-px bg-(--l-line)" aria-hidden />
            {s.parts.map((part) => (
              <li key={part.verb} className="relative flex gap-5 py-4">
                <span className="relative z-10 mt-2 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-(--l-primary) bg-(--l-surface)" aria-hidden />
                <span>
                  <span className="block text-[26px] font-semibold leading-none tracking-[-0.02em] text-(--l-ink) md:text-[30px]">{part.verb}</span>
                  <span className="mt-2 block text-[16px] leading-relaxed text-(--l-ink-2)">{part.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** Four real steps in order, so numbering is information here. Lives on the features page. */
export function HowItWorks() {
  const { t } = useCopy();
  return (
    <section id="how" className="landing-container py-16 md:py-20">
      <h2 className="text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-(--l-ink) md:text-[36px]">
        <Phrases text={t.how.headline} />
      </h2>
      <ol className="mt-10 grid gap-10 md:grid-cols-4 md:gap-6">
        {t.how.steps.map((step, i) => (
          <li key={step.title}>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-(--l-primary) text-[15px] font-semibold tabular-nums text-(--l-primary-ink)">
                {i + 1}
              </span>
              {i < t.how.steps.length - 1 && <span className="hidden h-px flex-1 bg-(--l-line) md:block" aria-hidden />}
            </div>
            <h3 className="mt-5 text-lg font-semibold text-(--l-ink)">{step.title}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-(--l-ink-2)">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
