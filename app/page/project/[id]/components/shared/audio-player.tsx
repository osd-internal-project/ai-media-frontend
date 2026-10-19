"use client";

import React, { useMemo, useRef, useState } from "react";
import { Button, Flex, Typography, theme } from "antd";
import { Pause, Play } from "lucide-react";

interface Props {
  src: string;
  ariaLabel: string;
  autoPlay?: boolean;
  preload?: "none" | "metadata" | "auto";
  /** ใช้สุ่มความสูงแท่ง waveform ให้คงที่ต่อไฟล์ */
  seed?: string;
  compact?: boolean;
}

const BAR_COUNT = 40;

const formatTime = (sec: number) => {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

// Decorative bars, not a real waveform: decoding would need the whole file + CORS on storage.
const barHeights = (seed: string) => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return Array.from({ length: BAR_COUNT }, () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    return 0.25 + (h % 1000) / 1333;
  });
};

const AudioPlayer: React.FC<Props> = ({
  src,
  ariaLabel,
  autoPlay,
  preload = "metadata",
  seed,
  compact,
}) => {
  const { token } = theme.useToken();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);
  const bars = useMemo(() => barHeights(seed ?? src), [seed, src]);
  const progress = duration > 0 ? current / duration : 0;
  const barAreaHeight = compact ? 28 : 36;

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => setFailed(true));
    } else {
      el.pause();
    }
  };

  const seekTo = (ratio: number) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    el.currentTime = Math.min(Math.max(ratio, 0), 1) * duration;
    setCurrent(el.currentTime);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!duration) return;
    if (e.key === "ArrowRight") seekTo((current + 5) / duration);
    else if (e.key === "ArrowLeft") seekTo((current - 5) / duration);
    else return;
    e.preventDefault();
  };

  return (
    <Flex
      align="center"
      gap={compact ? 8 : 12}
      style={{ width: "100%", minWidth: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <audio
        ref={audioRef}
        src={src}
        preload={preload}
        autoPlay={autoPlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onError={() => setFailed(true)}
      />
      <Button
        type="primary"
        shape="circle"
        size={compact ? "middle" : "large"}
        aria-label={playing ? "Pause" : `Play ${ariaLabel}`}
        disabled={failed}
        icon={
          playing ? (
            <Pause size={compact ? 14 : 16} fill="currentColor" />
          ) : (
            <Play size={compact ? 14 : 16} fill="currentColor" style={{ marginLeft: 2 }} />
          )
        }
        onClick={toggle}
        style={{ flexShrink: 0 }}
      />
      {failed ? (
        <Typography.Text style={{ color: token.colorError, fontSize: 13 }}>
          โหลดเสียงไม่สำเร็จ
        </Typography.Text>
      ) : (
        <>
          <div
            role="slider"
            tabIndex={0}
            aria-label={ariaLabel}
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(current)}
            aria-valuetext={`${formatTime(current)} / ${formatTime(duration)}`}
            onKeyDown={onKeyDown}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              seekTo((e.clientX - rect.left) / rect.width);
            }}
            style={{
              flex: 1,
              minWidth: 0,
              height: barAreaHeight,
              display: "flex",
              alignItems: "center",
              gap: 2,
              cursor: duration ? "pointer" : "default",
              outline: "none",
            }}
          >
            {bars.map((h, i) => (
              <span
                key={i}
                style={{
                  flex: 1,
                  height: `${h * 100}%`,
                  borderRadius: 2,
                  background:
                    (i + 0.5) / BAR_COUNT <= progress
                      ? token.colorPrimary
                      : token.colorFillSecondary,
                  transition: "background 120ms",
                }}
              />
            ))}
          </div>
          <Typography.Text
            style={{
              flexShrink: 0,
              fontSize: compact ? 11 : 12,
              color: token.colorTextSecondary,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatTime(current)} / {formatTime(duration)}
          </Typography.Text>
        </>
      )}
    </Flex>
  );
};

export default AudioPlayer;
