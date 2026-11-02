import React, { CSSProperties, ReactNode } from "react";

const MAX_TILES = 3;

interface PreviewGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getKey: (item: T, index: number) => string;
}

/** แบ่งกรอบตามจำนวนรูป: 1 = เต็ม, 2 = ซ้าย/ขวา, 3+ = 2 บน + 1 ล่าง (แสดงสูงสุด 3) */
export default function PreviewGrid<T>({
  items,
  renderItem,
  getKey,
}: PreviewGridProps<T>) {
  const tiles = items.slice(0, MAX_TILES);
  if (tiles.length === 0) return null;
  const grid: CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "grid",
    gap: tiles.length > 1 ? 2 : 0,
    gridTemplateColumns: tiles.length > 1 ? "1fr 1fr" : "1fr",
    gridTemplateRows: tiles.length > 2 ? "1fr 1fr" : "1fr",
  };
  return (
    <div style={grid}>
      {tiles.map((item, i) => (
        <div
          key={getKey(item, i)}
          style={{
            position: "relative",
            overflow: "hidden",
            minWidth: 0,
            minHeight: 0,
            gridColumn: i === 2 ? "1 / span 2" : undefined,
          }}
        >
          {renderItem(item, i)}
        </div>
      ))}
    </div>
  );
}
