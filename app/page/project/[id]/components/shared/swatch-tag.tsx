import React from "react";

/** Short, stable job code from an existing task or message id, e.g. "A-1F3C". */
export function jobCode(id: string | number | undefined | null): string {
  const raw = String(id ?? "").replace(/[^a-zA-Z0-9]/g, "");
  return raw ? `A-${raw.slice(-4).toUpperCase()}` : "A-····";
}

type Props = {
  imageUrl?: string;
  code: string;
  fontSize: number;
  // Callers pass raw theme tokens, which antd types as optional.
  border?: string;
  fill?: string;
  ink?: string;
  /** Generation type; when set, the code takes that type's colour. */
  type?: string;
};

/** Quiet job reference (e.g. "A-2218"): secondary text at the end of the meta row; image/type props are kept for callers but no longer shown. */
export default function SwatchTag({ code, fontSize, ink }: Props) {
  return (
    <span
      title="Job reference"
      style={{ order: 99, marginInlineStart: "auto", fontSize, fontWeight: 400, color: ink, opacity: 0.7, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}
    >
      {code}
    </span>
  );
}
