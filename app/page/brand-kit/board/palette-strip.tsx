"use client";

import React from "react";
import { BoardColor, COLOR_ROLES } from "./model";

type Props = {
  /** remounts the strip when the kit changes, so its colours wipe in one after another */
  kitId: string;
  colors: BoardColor[];
  freshId: string | null;
  copiedId: string | null;
  onCopy: (color: BoardColor) => void;
};

const weightOf = (color: BoardColor) =>
  COLOR_ROLES.find((r) => r.value === color.role)?.weight ?? 1;

// the whole wipe finishes within 260ms however many colours the kit has
const delayOf = (index: number, count: number) =>
  Math.round((index * Math.min(260, count * 30)) / Math.max(1, count));

/** The kit's palette as one band: a role's width is its importance. Click a colour to copy its hex. */
export default function PaletteStrip({
  kitId,
  colors,
  freshId,
  copiedId,
  onCopy,
}: Props) {
  if (colors.length === 0) {
    return (
      <div className="bk-strip" data-empty="true">
        Your palette appears here as you add colors.
      </div>
    );
  }
  const ordered = COLOR_ROLES.flatMap((role) =>
    colors.filter((c) => c.role === role.value),
  );
  return (
    <div className="bk-strip" key={kitId}>
      {ordered.map((color, index) => (
        <button
          key={color.id}
          type="button"
          className="bk-seg"
          data-strip-id={color.id}
          data-fresh={color.id === freshId}
          data-copied={color.id === copiedId}
          aria-label={`Copy ${color.name || color.role} ${color.hex}`}
          style={
            {
              background: color.hex,
              "--bk-weight": weightOf(color),
              "--bk-delay": `${delayOf(index, ordered.length)}ms`,
            } as React.CSSProperties // CSS custom properties are not in CSSProperties
          }
          onClick={() => onCopy(color)}
        >
          <span className="bk-seg-tip">
            {color.id === copiedId ? "Copied" : color.hex.toUpperCase()}
          </span>
        </button>
      ))}
    </div>
  );
}
