"use client";

import { useCallback, useRef } from "react";
import { Button, Segmented } from "antd";
import { Pause, Play, Redo2, Undo2 } from "lucide-react";
import { useEditor } from "../editor-context";
import PreviewPlayer from "../preview/preview-player";
import type { Renderer } from "../preview/renderer";
import { useEditorColors } from "../editor-theme";
import { projectDuration } from "../model/timeline";
import type { AspectRatio } from "../model/types";
import { STRINGS } from "../strings";
import { formatTime } from "./item-actions";

const ASPECTS: AspectRatio[] = ["9:16", "16:9", "1:1"];
const CSS_ASPECT: Record<AspectRatio, string> = { "9:16": "9 / 16", "16:9": "16 / 9", "1:1": "1 / 1" };

/** Output-shaped frame plus transport. The player itself plugs in here with the Renderer. */
export default function PreviewFrame() {
  const { state, dispatch, playhead, setPlayhead, playing, setPlaying } = useEditor();
  const colors = useEditorColors();
  const project = state.present;
  const duration = projectDuration(project);
  const rendererRef = useRef<Renderer | null>(null);
  const onRenderer = useCallback((renderer: Renderer | null) => {
    rendererRef.current = renderer;
  }, []);

  const togglePlay = () => {
    if (playing) return setPlaying(false);
    rendererRef.current?.unlock();
    // Replay from the start when the playhead is parked at the end.
    if (playhead >= duration) setPlayhead(0);
    setPlaying(true);
  };

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 flex items-center justify-center p-2" style={{ background: colors.bg }}>
        <PreviewPlayer
          onRenderer={onRenderer}
          style={{ height: "100%", maxWidth: "100%", aspectRatio: CSS_ASPECT[project.aspect], background: "#000" }}
        />
      </div>
      <div className="h-14 shrink-0 grid grid-cols-[1fr_auto_1fr] items-center px-3 gap-2" style={{ color: colors.text }}>
        <span className="text-sm tabular-nums whitespace-nowrap">
          <span className="font-semibold">{formatTime(playhead)}</span>
          <span style={{ color: colors.textSecondary }}> / {formatTime(duration)}</span>
        </span>
        <Button
          shape="circle"
          size="large"
          disabled={duration === 0}
          aria-label={playing ? STRINGS.pause : STRINGS.play}
          onClick={togglePlay}
          icon={playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
        />
        <div className="flex justify-end items-center gap-1">
          <Segmented<AspectRatio>
            size="small"
            value={project.aspect}
            onChange={(aspect) => dispatch({ type: "set-aspect", aspect })}
            options={ASPECTS}
          />
          <Button
            type="text"
            aria-label={STRINGS.undo}
            disabled={state.past.length === 0}
            onClick={() => dispatch({ type: "undo" })}
            icon={<Undo2 size={18} aria-hidden="true" />}
          />
          <Button
            type="text"
            aria-label={STRINGS.redo}
            disabled={state.future.length === 0}
            onClick={() => dispatch({ type: "redo" })}
            icon={<Redo2 size={18} aria-hidden="true" />}
          />
        </div>
      </div>
    </div>
  );
}
