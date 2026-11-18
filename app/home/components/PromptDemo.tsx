"use client";
import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { MEDIA } from "../media";
import { useCopy } from "../i18n/LocaleProvider";
import { usePrefersReducedMotion } from "./motion/hooks";

// Example prompts (in copy.ts, same order) were written to match each showcase file; they are not the original generation prompts.
const examples = [
  { src: `${MEDIA}/herosection/3.mp4`, kind: "video" },
  { src: `${MEDIA}/herosection/5.jpeg`, kind: "image" },
  { src: `${MEDIA}/herosection/4.mp4`, kind: "video" },
  { src: `${MEDIA}/generate-smarter/2.jpeg`, kind: "image" },
  { src: `${MEDIA}/herosection/1.jpg`, kind: "image" },
] as const;

const TYPE_MS = 32;
const HOLD_MS = 3800;

/** Hero demo: an example prompt types itself, then the matching showcase result is revealed. */
export default function PromptDemo() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const { t, locale } = useCopy();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = { ...examples[index], prompt: t.hero.demoExamples[index], mode: t.hero.demoModes[examples[index].kind] };
  const done = reduced || typed >= current.prompt.length;

  useEffect(() => {
    if (paused) return;
    timer.current = done
      ? setTimeout(() => select((index + 1) % examples.length), HOLD_MS)
      : setTimeout(() => setTyped((t) => t + 1), TYPE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [typed, done, paused, index]);

  // Switching language restarts the typing so the prompt never shows half in one language.
  useEffect(() => setTyped(0), [locale]);

  function select(i: number) {
    setIndex(i);
    setTyped(0);
  }

  const isVideo = current.src.endsWith(".mp4");

  return (
    <div
      className="overflow-hidden rounded-2xl border border-(--l-line) bg-(--l-surface) shadow-[0_24px_60px_-28px_rgba(0,0,0,0.5)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex items-start gap-3 border-b border-(--l-line) p-4">
        <Sparkles size={18} className="mt-0.5 shrink-0 text-(--l-primary)" aria-hidden />
        <p className="min-h-[3rem] flex-1 text-[15px] leading-relaxed text-(--l-ink)" aria-live="polite">
          {current.prompt.slice(0, done ? undefined : typed)}
          {!done && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-(--l-primary)" />}
        </p>
        <span className="shrink-0 rounded-full bg-(--l-raised) px-2.5 py-1 text-xs font-medium text-(--l-ink-2)">
          {current.mode}
        </span>
      </div>

      <div className="relative aspect-[4/3] bg-(--l-raised)">
        {done &&
          (isVideo ? (
            <video key={current.src} src={current.src} autoPlay muted loop playsInline className="demo-reveal h-full w-full object-cover" />
          ) : (
            <img key={current.src} src={current.src} alt={current.prompt} className="demo-reveal h-full w-full object-cover" />
          ))}
        <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white">{t.hero.demoBadge}</span>
      </div>

      <div className="flex items-center justify-center gap-2 p-3" role="tablist" aria-label={t.hero.demoTabs}>
        {examples.map((e, i) => (
          <button
            key={e.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`${i + 1}: ${t.hero.demoExamples[i]}`}
            onClick={() => select(i)}
            className="group grid h-8 place-items-center px-1"
          >
            <span className={`block h-2 rounded-full transition-all ${i === index ? "w-6 bg-(--l-primary)" : "w-2 bg-(--l-line) group-hover:bg-(--l-ink-2)"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
