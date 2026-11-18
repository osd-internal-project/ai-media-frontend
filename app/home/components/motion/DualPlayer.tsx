"use client";
import { useEffect, useRef } from "react";
import { Clapperboard } from "lucide-react";
import { useInView } from "./hooks";

type Props = { source: string | null; result: string | null; sourceLabel: string; resultLabel: string; pendingLabel: string };

function Pending({ label }: { label: string }) {
  return (
    <div className="grid h-full place-items-center bg-(--l-raised) text-(--l-ink-2)">
      <span className="flex flex-col items-center gap-2 text-[13px]">
        <Clapperboard size={28} aria-hidden />
        {label}
      </span>
    </div>
  );
}

/** Motion transfer, shown honestly: the reference clip and the result play side by side, kept in step. */
export default function DualPlayer({ source, result, sourceLabel, resultLabel, pendingLabel }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 });
  const srcRef = useRef<HTMLVideoElement | null>(null);
  const resRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const a = srcRef.current;
    const b = resRef.current;
    // Result only (no reference clip yet): just play it while on screen.
    if (!a && b) {
      if (inView)
        b.play().catch(() => {
          // Autoplay refused: the first frame stays visible.
        });
      else b.pause();
      return;
    }
    if (!a || !b) return;
    if (!inView) {
      a.pause();
      b.pause();
      return;
    }
    b.currentTime = a.currentTime;
    Promise.all([a.play(), b.play()]).catch(() => {
      // Autoplay refused: both stay on their first frame, still a fair side-by-side.
    });
    // Drift correction: the result follows the reference, never the other way round.
    const sync = () => {
      if (Math.abs(b.currentTime - a.currentTime) > 0.15) b.currentTime = a.currentTime;
    };
    a.addEventListener("timeupdate", sync);
    return () => a.removeEventListener("timeupdate", sync);
  }, [inView]);

  // With a result but no reference yet, show the result alone instead of an empty half.
  const frames = [
    ...(source || !result ? [{ label: sourceLabel, src: source, vref: srcRef }] : []),
    { label: resultLabel, src: result, vref: resRef },
  ];

  return (
    <div ref={ref} className={`grid h-full gap-1.5 ${frames.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
      {frames.map((f) => (
        <figure key={f.label} className="relative overflow-hidden rounded-[14px]">
          {f.src ? (
            <video ref={f.vref} src={f.src} muted loop playsInline preload="metadata" className="h-full w-full object-cover" />
          ) : (
            <Pending label={pendingLabel} />
          )}
          <figcaption className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[12px] font-medium text-white">{f.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}
