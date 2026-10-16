"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useEditor } from "../editor-context";
import { projectDuration } from "../model/timeline";
import { DualVideoRenderer } from "./dual-video-renderer";
import type { Renderer } from "./renderer";

/** Advances the playhead from the wall clock while playing; stops at the end. */
function usePlaybackClock() {
  const { state, playhead, setPlayhead, playing, setPlaying } = useEditor();
  const duration = projectDuration(state.present);
  const playheadRef = useRef(playhead);
  playheadRef.current = playhead;

  useEffect(() => {
    if (!playing) return;
    const startedAt = performance.now();
    const startTime = playheadRef.current;
    let frame = 0;
    const tick = () => {
      const time = startTime + (performance.now() - startedAt) / 1000;
      if (time >= duration) {
        setPlayhead(duration);
        setPlaying(false);
        return;
      }
      setPlayhead(time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, duration, setPlayhead, setPlaying]);
}

/** Mounts the renderer and feeds it the timeline on every playhead or edit change. */
export default function PreviewPlayer({
  style,
  onRenderer,
}: {
  style?: CSSProperties;
  /** Exposes the renderer so the Play button can unlock media inside its click handler. */
  onRenderer?: (renderer: Renderer | null) => void;
}) {
  const { state, playhead, playing, resolveMediaUrl, mediaVersion } = useEditor();
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  usePlaybackClock();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const renderer = new DualVideoRenderer(resolveMediaUrl);
    renderer.mount(container);
    rendererRef.current = renderer;
    onRenderer?.(renderer);
    return () => {
      onRenderer?.(null);
      rendererRef.current = null;
      renderer.dispose();
    };
  }, [resolveMediaUrl, onRenderer]);

  useEffect(() => {
    rendererRef.current?.render(state.present, playhead, playing);
  }, [state.present, playhead, playing, mediaVersion]);

  return <div ref={containerRef} className="relative overflow-hidden" style={style} />;
}
