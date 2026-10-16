"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "antd";
import { Film, Music, Plus, ZoomIn, ZoomOut } from "lucide-react";
import { useEditor, type Selection } from "../editor-context";
import { useEditorColors, type EditorColors } from "../editor-theme";
import { itemDuration, layerDuration, projectDuration, trimInPlace } from "../model/timeline";
import type { Layer, LayerKind, TimelineItem } from "../model/types";
import { STRINGS } from "../strings";
import { Filmstrip, Waveform } from "./clip-visuals";
import { formatTime } from "./item-actions";
import { useDeviceImport } from "./media-bin";

const MIN_PPS = 8;
const MAX_PPS = 240;
const HEADER_WIDTH = 40;
const HANDLE_WIDTH = 14;
const RULER_HEIGHT = 28;
/** Visual gap between neighbouring clips (mockup), taken from each clip's edges. */
const CLIP_INSET = 2;
const ROW_HEIGHT: Record<LayerKind, number> = { video: 60, music: 44 };
const RULER_STEPS = [0.5, 1, 2, 5, 10, 15, 30, 60, 120];

const clampPps = (value: number) => Math.min(MAX_PPS, Math.max(MIN_PPS, value));

interface TrimDrag {
  layerId: string;
  base: TimelineItem;
  edge: "in" | "out";
  startX: number;
  preview: TimelineItem;
}

type TrimStart = (event: ReactPointerEvent, layerId: string, item: TimelineItem, edge: "in" | "out") => void;

interface ClipProps {
  layerId: string;
  layerKind: LayerKind;
  item: TimelineItem;
  pxPerSecond: number;
  selected: boolean;
  colors: EditorColors;
  onSelect: (selection: Selection) => void;
  onTrimStart: TrimStart;
}

function TrimHandle({
  edge,
  colors,
  label,
  onPointerDown,
}: {
  edge: "in" | "out";
  colors: EditorColors;
  label: string;
  onPointerDown: (event: ReactPointerEvent) => void;
}) {
  const style: CSSProperties = {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: HANDLE_WIDTH,
    [edge === "in" ? "left" : "right"]: -HANDLE_WIDTH + CLIP_INSET,
    background: colors.handle,
    borderRadius: edge === "in" ? "6px 0 0 6px" : "0 6px 6px 0",
    cursor: "ew-resize",
    touchAction: "none",
    display: "grid",
    placeItems: "center",
  };
  return (
    <div
      role="slider"
      aria-label={label}
      aria-valuenow={0}
      tabIndex={-1}
      style={style}
      // Keep dnd-kit from treating a trim as a move, and the click from seeking.
      onMouseDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={onPointerDown}
    >
      <span className="w-0.5 h-5 rounded-sm" style={{ background: colors.bg }} />
    </div>
  );
}

const Clip = memo(function Clip({ layerId, layerKind, item, pxPerSecond, selected, colors, onSelect, onTrimStart }: ClipProps) {
  const { setNodeRef, attributes, listeners, transform, isDragging } = useDraggable({
    id: item.id,
    data: { layerId, itemId: item.id, start: item.start },
  });
  const height = ROW_HEIGHT[layerKind];
  const width = Math.max(itemDuration(item) * pxPerSecond - CLIP_INSET * 2, 6);
  const isMusic = layerKind === "music";

  return (
    <div
      ref={setNodeRef}
      className="absolute top-0"
      style={{
        left: item.start * pxPerSecond + CLIP_INSET,
        width,
        height,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 20 : selected ? 10 : 1,
        opacity: isDragging ? 0.85 : 1,
      }}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={(event) => {
          event.stopPropagation();
          onSelect({ layerId, itemId: item.id });
        }}
        className="relative block w-full h-full p-0 border-0 overflow-hidden text-left cursor-grab active:cursor-grabbing"
        style={{
          borderRadius: 6,
          background: isMusic ? `${colors.primary}2e` : colors.panel,
          boxShadow: selected ? `inset 0 2px 0 ${colors.handle}, inset 0 -2px 0 ${colors.handle}` : undefined,
          opacity: item.muted ? 0.55 : 1,
        }}
      >
        {isMusic ? (
          <Waveform item={item} pxPerSecond={pxPerSecond} width={width} color={colors.primary} height={height} />
        ) : (
          <Filmstrip item={item} pxPerSecond={pxPerSecond} width={width} separator={colors.bg} />
        )}
        <span
          className={`absolute left-1.5 px-1.5 rounded text-[11px] leading-4 truncate max-w-[calc(100%-12px)] ${isMusic ? "top-1/2 -translate-y-1/2" : "top-1.5"}`}
          style={{ background: `${colors.bg}cc`, color: colors.text }}
        >
          {item.name}
        </span>
        {selected && (
          <span
            className="absolute right-1.5 bottom-1.5 px-1.5 rounded text-[11px] leading-4 tabular-nums"
            style={{ background: `${colors.bg}cc`, color: colors.text }}
          >
            {formatTime(itemDuration(item))}
          </span>
        )}
      </button>
      {selected && (
        <>
          <TrimHandle
            edge="in"
            colors={colors}
            label={STRINGS.trimStart}
            onPointerDown={(event) => onTrimStart(event, layerId, item, "in")}
          />
          <TrimHandle
            edge="out"
            colors={colors}
            label={STRINGS.trimEnd}
            onPointerDown={(event) => onTrimStart(event, layerId, item, "out")}
          />
        </>
      )}
    </div>
  );
});

function Ruler({ width, pxPerSecond, color }: { width: number; pxPerSecond: number; color: string }) {
  const step = RULER_STEPS.find((candidate) => candidate * pxPerSecond >= 64) ?? 120;
  const count = Math.floor(width / (step * pxPerSecond)) + 1;
  return (
    <div className="relative text-[11px] tabular-nums" style={{ height: RULER_HEIGHT, width, color }} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className="absolute top-2 -translate-x-1/2" style={{ left: index * step * pxPerSecond }}>
          {formatTime(index * step).replace(/\.0$/, "")}
        </span>
      ))}
    </div>
  );
}

const VISUAL_ACCEPT = "video/mp4,video/quicktime,video/webm,image/jpeg,image/png,image/webp";

/** `onAddMedia` replaces the + button's file picker (mobile opens the media drawer instead). */
export default function Timeline({ onAddMedia }: { onAddMedia?: () => void }) {
  const { state, dispatch, selection, setSelection, playhead, setPlayhead, playing, setPlaying } = useEditor();
  const colors = useEditorColors();
  const [pxPerSecond, setPxPerSecond] = useState(40);
  const [trim, setTrim] = useState<TrimDrag | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const deviceImport = useDeviceImport();
  const project = state.present;
  const width = Math.max(projectDuration(project) + 8, 12) * pxPerSecond;
  const isEmpty = project.layers.every((layer) => layer.items.length === 0);

  // Long-press on touch so a swipe still scrolls the timeline; a small move starts a mouse drag.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 8 } }),
  );

  // Ctrl/⌘ + wheel and two-finger pinch zoom; both need non-passive listeners to stop page zoom.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let pinchDistance = 0;
    const distance = (touches: TouchList) =>
      Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      setPxPerSecond((value) => clampPps(value * (event.deltaY < 0 ? 1.1 : 0.9)));
    };
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) pinchDistance = distance(event.touches);
    };
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 2 || pinchDistance === 0) return;
      event.preventDefault();
      const next = distance(event.touches);
      setPxPerSecond((value) => clampPps((value * next) / pinchDistance));
      pinchDistance = next;
    };
    const onTouchEnd = () => {
      pinchDistance = 0;
    };
    scroller.addEventListener("wheel", onWheel, { passive: false });
    scroller.addEventListener("touchstart", onTouchStart, { passive: true });
    scroller.addEventListener("touchmove", onTouchMove, { passive: false });
    scroller.addEventListener("touchend", onTouchEnd);
    return () => {
      scroller.removeEventListener("wheel", onWheel);
      scroller.removeEventListener("touchstart", onTouchStart);
      scroller.removeEventListener("touchmove", onTouchMove);
      scroller.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // Keep the playhead in view while playing.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!playing || !scroller) return;
    const x = HEADER_WIDTH + playhead * pxPerSecond;
    if (x > scroller.scrollLeft + scroller.clientWidth - 40 || x < scroller.scrollLeft + HEADER_WIDTH) {
      scroller.scrollLeft = x - HEADER_WIDTH - 40;
    }
  }, [playing, playhead, pxPerSecond]);

  const layersRef = useRef(project.layers);
  layersRef.current = project.layers;

  const startTrim = useCallback<TrimStart>(
    (event, layerId, item, edge) => {
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      setPlaying(false);
      setTrim({ layerId, base: item, edge, startX: event.clientX, preview: item });
    },
    [setPlaying],
  );

  const moveTrim = (event: ReactPointerEvent) => {
    if (!trim) return;
    const delta = (event.clientX - trim.startX) / pxPerSecond;
    const { base, edge } = trim;
    const layer = layersRef.current.find((entry) => entry.id === trim.layerId);
    if (!layer) return;
    // Same rule as the reducer: the left edge follows the pointer, edges stop at neighbours.
    const next =
      edge === "in"
        ? trimInPlace(layer.items, base, base.inPoint + delta, base.outPoint)
        : trimInPlace(layer.items, base, base.inPoint, base.outPoint + delta);
    if (next) setTrim({ ...trim, preview: next });
  };

  const endTrim = () => {
    if (!trim) return;
    const { layerId, base, preview } = trim;
    setTrim(null);
    if (preview.inPoint === base.inPoint && preview.outPoint === base.outPoint) return;
    dispatch({ type: "trim", layerId, itemId: base.id, inPoint: preview.inPoint, outPoint: preview.outPoint });
  };

  const onDragEnd = ({ active, delta }: DragEndEvent) => {
    const data = active.data.current as { layerId?: string; itemId?: string; start?: number } | undefined; // set by useDraggable in Clip
    if (!data?.layerId || !data.itemId || typeof data.start !== "number" || delta.x === 0) return;
    dispatch({ type: "place", layerId: data.layerId, itemId: data.itemId, start: data.start + delta.x / pxPerSecond });
  };

  const select = useCallback((next: Selection) => setSelection(next), [setSelection]);

  const addButton = (layer: Layer) => {
    const left = HEADER_WIDTH + layerDuration(layer) * pxPerSecond + 12;
    if (layer.kind === "music" && layer.items.length === 0) {
      return (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            deviceImport.open("audio/*");
          }}
          className="absolute top-1 h-9 px-3 rounded-md flex items-center gap-1.5 text-xs bg-transparent cursor-pointer"
          style={{ left: HEADER_WIDTH + 4, border: `1px dashed ${colors.border}`, color: colors.textSecondary }}
        >
          <Plus size={14} aria-hidden="true" />
          {STRINGS.addMusic}
        </button>
      );
    }
    const size = layer.kind === "video" ? 44 : 32;
    return (
      <button
        type="button"
        aria-label={layer.kind === "video" ? STRINGS.addVisual : STRINGS.addMusic}
        title={layer.kind === "video" ? STRINGS.addVisual : STRINGS.addMusic}
        onClick={(event) => {
          event.stopPropagation();
          if (layer.kind === "music") deviceImport.open("audio/*");
          else if (onAddMedia) onAddMedia();
          else deviceImport.open(VISUAL_ACCEPT);
        }}
        className="absolute rounded-[10px] grid place-items-center border-0 cursor-pointer"
        style={{
          left,
          top: (ROW_HEIGHT[layer.kind] - size) / 2,
          width: size,
          height: size,
          background: colors.text,
          color: colors.bg,
        }}
      >
        <Plus size={layer.kind === "video" ? 20 : 16} aria-hidden="true" />
      </button>
    );
  };

  return (
    <div className="relative h-full" style={{ background: colors.bg }}>
      {deviceImport.elements}
      <div
        ref={scrollerRef}
        className="h-full overflow-x-auto overflow-y-auto"
        style={{ touchAction: "pan-x pan-y" }}
        onPointerMove={moveTrim}
        onPointerUp={endTrim}
        onPointerCancel={endTrim}
      >
        {/* Clicking empty track space moves the playhead; clips stop propagation. */}
        <div
          className="relative pb-6"
          style={{ width: width + HEADER_WIDTH + 80 }}
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            // Scrubbing pauses, otherwise the playback clock would pull the playhead back.
            setPlaying(false);
            const time = (event.clientX - rect.left - HEADER_WIDTH) / pxPerSecond;
            setPlayhead(Math.min(projectDuration(project), Math.max(0, time)));
          }}
        >
          <div style={{ paddingLeft: HEADER_WIDTH }}>
            <Ruler width={width} pxPerSecond={pxPerSecond} color={colors.textSecondary} />
          </div>
          <DndContext sensors={sensors} modifiers={[restrictToHorizontalAxis]} onDragEnd={onDragEnd}>
            {project.layers.map((layer) => (
              <div key={layer.id} className="relative mb-2.5" style={{ height: ROW_HEIGHT[layer.kind] }}>
                <div
                  className="sticky left-0 z-30 h-full grid place-items-center"
                  style={{
                    width: HEADER_WIDTH,
                    background: colors.bg,
                    color: colors.textSecondary,
                    boxShadow: `4px 0 8px ${colors.bg}`,
                  }}
                >
                  {layer.kind === "video" ? (
                    <Film size={18} role="img" aria-label={STRINGS.video} />
                  ) : (
                    <Music size={18} role="img" aria-label={STRINGS.music} />
                  )}
                </div>
                <div className="absolute top-0 h-full" style={{ left: HEADER_WIDTH, width }}>
                  {layer.items.map((item) => (
                    <Clip
                      key={item.id}
                      layerId={layer.id}
                      layerKind={layer.kind}
                      item={trim?.base.id === item.id ? trim.preview : item}
                      pxPerSecond={pxPerSecond}
                      selected={selection?.itemId === item.id}
                      colors={colors}
                      onSelect={select}
                      onTrimStart={startTrim}
                    />
                  ))}
                </div>
                {addButton(layer)}
              </div>
            ))}
          </DndContext>
          <div
            className="absolute bottom-0 w-0.5 pointer-events-none z-40"
            style={{ top: RULER_HEIGHT - 2, left: HEADER_WIDTH + playhead * pxPerSecond - 1, background: colors.text }}
          >
            <span className="absolute -top-1 -left-[5px] w-3 h-2 rounded-sm" style={{ background: colors.text }} />
          </div>
        </div>
      </div>
      <div className="absolute right-2 top-1 z-50 flex gap-1">
        <Button size="small" type="text" aria-label={STRINGS.zoomOut} icon={<ZoomOut size={14} aria-hidden="true" />} onClick={() => setPxPerSecond((value) => clampPps(value / 1.5))} />
        <Button size="small" type="text" aria-label={STRINGS.zoomIn} icon={<ZoomIn size={14} aria-hidden="true" />} onClick={() => setPxPerSecond((value) => clampPps(value * 1.5))} />
      </div>
      <p className="absolute inset-x-0 bottom-1 m-0 text-center text-[11px] pointer-events-none" style={{ color: colors.textSecondary }}>
        {isEmpty ? STRINGS.emptyTimeline : STRINGS.timelineHint}
      </p>
    </div>
  );
}
