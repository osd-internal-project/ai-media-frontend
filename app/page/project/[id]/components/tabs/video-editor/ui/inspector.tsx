"use client";

import { Button, InputNumber, Slider, Switch } from "antd";
import { Copy, Scissors, Trash2 } from "lucide-react";
import { useEditorColors } from "../editor-theme";
import { MAX_IMAGE_SECONDS, MIN_ITEM_DURATION, itemDuration } from "../model/timeline";
import { STRINGS } from "../strings";
import { formatTime, useItemActions } from "./item-actions";

/** Desktop right panel: details and actions for the selected item. */
export default function Inspector() {
  const actions = useItemActions();
  const colors = useEditorColors();

  if (!actions) {
    return (
      <p className="m-0 text-sm" style={{ color: colors.textSecondary }}>
        {STRINGS.noSelection}
      </p>
    );
  }
  const { item } = actions;

  return (
    <div className="flex flex-col gap-4 text-sm" style={{ color: colors.text }}>
      <div className="flex flex-col gap-1">
        <span style={{ color: colors.textSecondary }}>{STRINGS.selectedClip}</span>
        <span className="font-semibold truncate" title={item.name}>
          {item.name}
        </span>
      </div>
      <div className="flex justify-between">
        <span style={{ color: colors.textSecondary }}>{STRINGS.clipLength}</span>
        <span className="tabular-nums">{formatTime(itemDuration(item))}</span>
      </div>
      {!actions.hasAudio && (
        <label className="flex justify-between items-center gap-2">
          <span style={{ color: colors.textSecondary }}>{STRINGS.displayDuration}</span>
          <InputNumber
            size="small"
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
      )}
      {actions.hasAudio && (
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span style={{ color: colors.textSecondary }}>{STRINGS.clipVolume}</span>
          <label className="flex items-center gap-2">
            {STRINGS.mute}
            <Switch size="small" checked={item.muted} onChange={actions.toggleMute} />
          </label>
        </div>
        <Slider
          min={0}
          max={100}
          disabled={item.muted}
          value={Math.round(item.volume * 100)}
          onChange={(value) => actions.setVolume(value / 100)}
          tooltip={{ formatter: (value) => `${value}%` }}
        />
      </div>
      )}
      <div className="flex flex-col gap-2">
        <Button icon={<Scissors size={16} aria-hidden="true" />} disabled={!actions.canSplit} onClick={actions.split}>
          {STRINGS.split}
        </Button>
        <Button icon={<Copy size={16} aria-hidden="true" />} onClick={actions.duplicate}>
          {STRINGS.duplicate}
        </Button>
        <Button danger icon={<Trash2 size={16} aria-hidden="true" />} onClick={actions.remove}>
          {STRINGS.delete}
        </Button>
      </div>
    </div>
  );
}
