"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Sparkles } from "lucide-react";
import { useCopy } from "../../i18n/LocaleProvider";
import { landingMedia } from "../../media";
import { useInView, usePrefersReducedMotion } from "./hooks";

const EASE = "cubic-bezier(0.16,1,0.3,1)";
const AUTO_MS = 3400;
// Stage padding and grid gap of the Library layer, in px; the clip shrinks into the first cell using these.
const PAD = 10;
const GAP = 6;

/**
 * The page's focal moment, in one screen: one generated clip passes through the four Workflow steps.
 * It advances on its own while visible; picking a step stops the timer.
 */
export default function WorkflowMorph() {
  const { t } = useCopy();
  const steps = t.workflow.steps;
  const [step, setStep] = useState(0);
  const [userPicked, setUserPicked] = useState(false);
  const [cellScale, setCellScale] = useState(0.31);
  const reduced = usePrefersReducedMotion();
  const [stageRef, stageInView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const auto = !userPicked && !reduced && stageInView;

  useEffect(() => {
    if (!auto) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % steps.length), AUTO_MS);
    return () => window.clearTimeout(id);
  }, [auto, step, steps.length]);

  // Step 1 is the still image (first frame); from step 2 on the same clip plays. Off screen it always pauses.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (step === 0 || !stageInView) {
      v.pause();
      if (step === 0) v.currentTime = 0;
      return;
    }
    v.play().catch(() => {
      // Autoplay can be refused (data saver); the first frame stays visible, which still reads as the image step.
    });
  }, [step, stageInView]);

  // The clip lands in the Library's first cell; that scale depends on the stage's rendered width.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setCellScale((w - PAD * 2 - GAP * 2) / 3 / w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [stageRef]);

  function pick(i: number) {
    setUserPicked(true);
    setStep(i);
  }

  const frameTransform =
    step === 3 ? `translate(${PAD}px, ${PAD}px) scale(${cellScale})` : step === 2 ? "translateY(4%) scale(0.72)" : "none";
  const frameStyle: CSSProperties = {
    transform: frameTransform,
    transformOrigin: step === 3 ? "top left" : "50% 0%",
    borderRadius: step === 3 ? 40 : step === 2 ? 20 : 0,
    transition: `transform 0.8s ${EASE}, border-radius 0.8s ${EASE}`,
  };

  return (
    <div className="grid items-center gap-6 md:grid-cols-12 md:gap-10">
      <ol className="order-2 md:order-1 md:col-span-5">
        {steps.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => pick(i)}
              aria-current={step === i ? "step" : undefined}
              className={`flex w-full gap-3.5 border-t border-(--l-line) py-3.5 text-left transition-opacity duration-300 ${
                step === i ? "opacity-100" : "opacity-50 hover:opacity-80"
              }`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] font-semibold transition-colors duration-300 ${
                  step === i ? "bg-(--l-primary) text-(--l-primary-ink)" : "border border-(--l-line) text-(--l-ink-2)"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-semibold text-(--l-ink)">{s.title}</span>
                {step === i && <span className="mt-1 block text-[15px] leading-relaxed text-(--l-ink-2)">{s.body}</span>}
                {step === i && auto && (
                  <span className="mt-2.5 block h-0.5 overflow-hidden rounded-full bg-(--l-raised)" aria-hidden>
                    <span key={step} className="l-step-progress block h-full origin-left bg-(--l-primary)" style={{ animationDuration: `${AUTO_MS}ms` }} />
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div
        ref={stageRef}
        className="relative order-1 aspect-[4/3] max-h-[420px] w-full overflow-hidden rounded-[20px] border border-(--l-line) bg-(--l-raised) md:order-2 md:col-span-7"
        aria-live="polite"
        aria-label={`${t.workflow.stepLabel} ${step + 1}/4: ${steps[step].title}`}
      >
        {/* Library layer: the clip settles into the empty first cell. */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3" style={{ padding: PAD, gap: GAP }} aria-hidden>
          <div className={`rounded-[8px] ring-2 ring-(--l-accent) transition-opacity duration-500 ${step === 3 ? "opacity-100" : "opacity-0"}`} />
          {landingMedia.workflow.library.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              loading="lazy"
              data-motion="move"
              className="h-full w-full rounded-[8px] object-cover"
              style={{
                opacity: step === 3 ? 1 : 0,
                transform: step === 3 ? "none" : "scale(0.92)",
                transition: `opacity 0.5s ${EASE} ${step === 3 ? 200 + i * 45 : 0}ms, transform 0.6s ${EASE} ${step === 3 ? 200 + i * 45 : 0}ms`,
              }}
            />
          ))}
        </div>

        {/* The one clip: image, then video, then the first clip on the timeline, then a Library item. */}
        <div className="absolute inset-0 z-10 overflow-hidden" style={frameStyle} data-motion="move">
          <video ref={videoRef} src={landingMedia.workflow.clip} muted loop playsInline preload="metadata" className="h-full w-full object-cover" />
          <div
            className="absolute inset-x-3 bottom-3 flex items-start gap-2 rounded-[12px] bg-black/60 px-3 py-2.5 text-[13px] leading-snug text-white backdrop-blur-sm transition-opacity duration-300"
            style={{ opacity: step === 0 ? 1 : 0 }}
          >
            <Sparkles size={15} className="mt-0.5 shrink-0 text-[#0FEAB6]" aria-hidden />
            <span>{t.hero.demoExamples[2]}</span>
          </div>
        </div>

        {/* Timeline layer for the editing step. */}
        <div
          className="absolute inset-x-3 bottom-3 z-20 rounded-[12px] border border-(--l-line) bg-(--l-surface) p-2"
          data-motion="move"
          style={{
            opacity: step === 2 ? 1 : 0,
            transform: step === 2 ? "none" : "translateY(14px)",
            transition: `opacity 0.4s ${EASE} ${step === 2 ? 250 : 0}ms, transform 0.6s ${EASE} ${step === 2 ? 250 : 0}ms`,
          }}
          aria-hidden
        >
          <div className="relative flex h-11 gap-1.5">
            {[landingMedia.workflow.clip, ...landingMedia.workflow.joinedClips].map((src, i) => (
              <video
                key={src}
                src={src}
                muted
                playsInline
                preload="metadata"
                className={`h-full min-w-0 rounded-[6px] object-cover ${i === 0 ? "flex-[1.4] ring-2 ring-(--l-accent)" : "flex-1"}`}
              />
            ))}
            <span className={`pointer-events-none absolute inset-0 ${step === 2 ? "l-playhead-run" : ""}`}>
              <span className="absolute -bottom-1 -top-1 left-0 w-0.5 rounded-full bg-(--l-ink)" />
            </span>
          </div>
        </div>

        <span className={`absolute left-3 top-3 z-30 transition-opacity duration-300 ${step === 3 ? "opacity-0" : "opacity-100"}`}>
          <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[12px] font-medium text-white backdrop-blur-sm">
          {t.workflow.stepLabel} {step + 1}/4
          </span>
        </span>
      </div>
    </div>
  );
}
