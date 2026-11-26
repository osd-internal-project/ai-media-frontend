import { useEffect, useRef, useState } from "react";

/** The credit bar's curve (DESIGN.md), so the board moves like the rest of the app. */
export const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";

export const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The board's one authored moment: a chip of the saved colour travels from where it was
 * entered into the palette strip. Skipped under reduced motion; the strip still updates.
 */
export function flyColor(from: DOMRect, to: Element | null, hex: string) {
  if (!to || reducedMotion()) return;
  const target = to.getBoundingClientRect();
  const size = 28;
  const startX = from.left + from.width / 2;
  const startY = from.top + from.height / 2;
  const chip = document.createElement("div");
  chip.className = "bk-fly";
  chip.style.background = hex;
  chip.style.left = `${startX - size / 2}px`;
  chip.style.top = `${startY - size / 2}px`;
  document.body.appendChild(chip);
  const dx = target.left + target.width / 2 - startX;
  const dy = target.top + target.height / 2 - startY;
  chip
    .animate(
      [
        { transform: "translate(0, 0) scale(1)" },
        { transform: `translate(${dx}px, ${dy}px) scale(0.6)` },
      ],
      { duration: 300, easing: EASE },
    )
    .finished.catch(() => undefined) // cancelled when the page navigates away: nothing to recover
    .finally(() => chip.remove());
}

/** Eases a displayed number toward `value` so a budget change reads as a change, not a swap. */
export function useTweenedNumber(value: number, ms = 200): number {
  const [shown, setShown] = useState(value);
  const shownRef = useRef(value);
  useEffect(() => {
    const from = shownRef.current;
    if (from === value || reducedMotion()) {
      shownRef.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      shownRef.current = Math.round(from + (value - from) * eased);
      setShown(shownRef.current);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, ms]);
  return shown;
}
