"use client";

import { MonitorX } from "lucide-react";
import { useEditorColors } from "../editor-theme";
import { STRINGS } from "../strings";

export default function Unsupported({ missing }: { missing: string[] }) {
  const colors = useEditorColors();
  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div
        className="max-w-md flex flex-col items-center gap-3 text-center rounded-[14px] p-6"
        style={{ background: colors.panel, border: `1px solid ${colors.border}`, color: colors.text }}
      >
        <MonitorX size={32} aria-hidden="true" style={{ color: colors.textSecondary }} />
        <h2 className="text-lg font-semibold m-0">{STRINGS.unsupportedTitle}</h2>
        <p className="m-0" style={{ color: colors.textSecondary }}>
          {STRINGS.unsupportedBody}
        </p>
        <p className="m-0 text-xs" style={{ color: colors.textSecondary }}>
          {STRINGS.unsupportedMissing}: {missing.join(", ")}
        </p>
      </div>
    </div>
  );
}
