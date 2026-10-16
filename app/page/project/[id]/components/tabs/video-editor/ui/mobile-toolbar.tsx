"use client";

import type { ReactNode } from "react";
import { InputNumber, Popover, Slider, Switch } from "antd";
import { ChevronDown, Copy, Music, Plus, Scissors, Timer, Trash2, Volume2 } from "lucide-react";
import { useEditor } from "../editor-context";
import { useEditorColors } from "../editor-theme";
import { MAX_IMAGE_SECONDS, MIN_ITEM_DURATION, itemDuration } from "../model/timeline";
import { STRINGS } from "../strings";
import { useItemActions } from "./item-actions";

interface ToolButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  color?: string;
}

function ToolButton({ icon, label, onClick, disabled, color }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-16 min-w-11 flex flex-col items-center justify-center gap-1.5 bg-transparent border-0 text-xs disabled:opacity-40"
      style={{ color }}
    >
      {icon}
      {label}
    </button>
  );
}

/** Bottom bar that switches between "add" tools and tools for the selected item (mockup: มือถือ ตัดต่อ). */
export default function MobileToolbar({ onOpenMedia }: { onOpenMedia: () => void }) {
  const { setSelection } = useEditor();
  const actions = useItemActions();
  const colors = useEditorColors();

  if (!actions) {
    return (
      <div className="grid grid-cols-2 px-1 pt-2" style={{ color: colors.text }}>
        <ToolButton icon={<Plus size={22} aria-hidden="true" />} label={STRINGS.addMedia} onClick={onOpenMedia} color={colors.text} />
        <ToolButton icon={<Music size={22} aria-hidden="true" />} label={STRINGS.addMusic} onClick={onOpenMedia} color={colors.text} />
      </div>
    );
  }

  const { item } = actions;
  return (
    <div className="flex items-start px-1 pt-2">
      <button
        type="button"
        aria-label={STRINGS.close}
        onClick={() => setSelection(null)}
        className="w-12 h-16 grid place-items-center bg-transparent border-0"
        style={{ color: colors.textSecondary, borderRight: `1px solid ${colors.border}` }}
      >
        <ChevronDown size={20} aria-hidden="true" />
      </button>
      <div className="flex-1 grid grid-cols-4">
        <ToolButton
          icon={<Scissors size={22} aria-hidden="true" />}
          label={STRINGS.split}
          disabled={!actions.canSplit}
          onClick={actions.split}
          color={colors.text}
        />
        <Popover
          trigger="click"
          placement="top"
          content={
            actions.hasAudio ? (
              <div className="w-56 flex flex-col gap-2">
                <label className="flex items-center justify-between text-sm">
                  {STRINGS.mute}
                  <Switch size="small" checked={item.muted} onChange={actions.toggleMute} />
                </label>
                <Slider
                  min={0}
                  max={100}
                  disabled={item.muted}
                  value={Math.round(item.volume * 100)}
                  onChange={(value) => actions.setVolume(value / 100)}
                  tooltip={{ formatter: (value) => `${value}%` }}
                />
              </div>
            ) : (
              <label className="flex items-center gap-3 text-sm">
                {STRINGS.displayDuration}
                <InputNumber
                  min={MIN_ITEM_DURATION}
                  max={MAX_IMAGE_SECONDS}
                  step={0.5}
                  value={Number(itemDuration(item).toFixed(1))}
                  onChange={(value) => {
                    if (typeof value === "number") actions.setDuration(value);
                  }}
                  className="w-20"
                />
              </label>
            )
          }
        >
          <span className="flex justify-center">
            <ToolButton
              icon={actions.hasAudio ? <Volume2 size={22} aria-hidden="true" /> : <Timer size={22} aria-hidden="true" />}
              label={actions.hasAudio ? STRINGS.volume : STRINGS.duration}
              color={colors.text}
            />
          </span>
        </Popover>
        <ToolButton icon={<Copy size={22} aria-hidden="true" />} label={STRINGS.duplicate} onClick={actions.duplicate} color={colors.text} />
        <ToolButton icon={<Trash2 size={22} aria-hidden="true" />} label={STRINGS.delete} onClick={actions.remove} color={colors.error} />
      </div>
    </div>
  );
}
