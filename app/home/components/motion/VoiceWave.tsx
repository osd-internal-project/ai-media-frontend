"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

// Fixed peaks so the shape reads as speech (phrases and pauses), not noise.
const PEAKS = [
  0.2, 0.35, 0.6, 0.85, 0.7, 0.5, 0.75, 0.95, 0.6, 0.3, 0.15, 0.25, 0.55, 0.8, 1, 0.7, 0.45, 0.65, 0.9, 0.55, 0.25, 0.12,
  0.3, 0.6, 0.75, 0.5, 0.85, 0.7, 0.4, 0.2, 0.45, 0.7, 0.95, 0.8, 0.5, 0.3, 0.55, 0.7, 0.4, 0.18,
];

type Props = { src: string | null; playLabel: string; pauseLabel: string; pendingLabel: string };

/** Voice sample as a waveform with one play control. Bars move only while audio plays; with no file yet the control is disabled. */
export default function VoiceWave({ src, playLabel, pauseLabel, pendingLabel }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, [src]);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      return;
    }
    a.play()
      .then(() => setPlaying(true))
      .catch(() => setError(true));
  }

  const disabled = !src || error;
  const played = Math.round(progress * PEAKS.length);

  return (
    <div className="flex w-full items-center gap-4">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-label={disabled ? pendingLabel : playing ? pauseLabel : playLabel}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-(--l-primary) text-(--l-primary-ink) transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {playing ? <Pause size={20} /> : <Play size={20} className="translate-x-px" />}
      </button>
      <div className="flex h-14 flex-1 items-center gap-[3px]" aria-hidden>
        {PEAKS.map((p, i) => (
          <span
            key={i}
            className={`w-full rounded-full ${playing ? "l-wave-bar" : ""} ${i < played ? "bg-(--l-accent)" : "bg-(--l-primary)"}`}
            style={{ height: `${Math.max(p * 100, 10)}%`, animationDelay: `${(i % 8) * 90}ms`, opacity: disabled ? 0.45 : 1 }}
          />
        ))}
      </div>
      {src && <audio ref={audioRef} src={src} preload="none" />}
      {disabled && <span className="sr-only">{pendingLabel}</span>}
    </div>
  );
}
