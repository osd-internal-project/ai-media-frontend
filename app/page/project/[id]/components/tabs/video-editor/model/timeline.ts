import type { EditorProject, Layer, TimelineItem } from "./types";

/** Shortest clip a trim or split may leave behind. */
export const MIN_ITEM_DURATION = 0.1;
/** Images have no natural length: this is how long a new one shows, and how far it can stretch. */
export const DEFAULT_IMAGE_SECONDS = 3;
export const MAX_IMAGE_SECONDS = 600;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const itemDuration = (item: TimelineItem) => item.outPoint - item.inPoint;

export const itemEnd = (item: TimelineItem) => item.start + itemDuration(item);

export const layerDuration = (layer: Layer) =>
  layer.items.reduce((max, item) => Math.max(max, itemEnd(item)), 0);

/** Length of the whole edit: the end of the last item on any layer. */
export const projectDuration = (project: EditorProject) =>
  project.layers.reduce((max, layer) => Math.max(max, layerDuration(layer)), 0);

/** Item playing at `time` on a layer, or null in a gap / past the end. */
export function itemAt(layer: Layer, time: number): TimelineItem | null {
  return layer.items.find((item) => time >= item.start && time < itemEnd(item)) ?? null;
}

/** Clamps the trim window to the source and keeps at least MIN_ITEM_DURATION. */
export function trimItem(
  item: TimelineItem,
  inPoint: number,
  outPoint: number,
): TimelineItem {
  const nextIn = clamp(inPoint, 0, item.sourceDuration - MIN_ITEM_DURATION);
  const nextOut = clamp(outPoint, nextIn + MIN_ITEM_DURATION, item.sourceDuration);
  return { ...item, inPoint: nextIn, outPoint: nextOut };
}

/**
 * Splits an item at timeline `time`. Returns null when either half would be
 * shorter than MIN_ITEM_DURATION (including a time outside the item).
 */
export function splitItem(
  item: TimelineItem,
  time: number,
  rightId: string,
): [TimelineItem, TimelineItem] | null {
  const offset = time - item.start;
  if (offset < MIN_ITEM_DURATION || itemDuration(item) - offset < MIN_ITEM_DURATION) {
    return null;
  }
  const cut = item.inPoint + offset;
  return [
    { ...item, outPoint: cut },
    { ...item, id: rightId, start: time, inPoint: cut },
  ];
}

/**
 * Every layer is free-placed: moves an item to `start`, clamped into the gap
 * between its neighbours so items on one layer never overlap. Keeps items sorted.
 */
export function placeItem(
  items: TimelineItem[],
  itemId: string,
  start: number,
): TimelineItem[] {
  const target = items.find((item) => item.id === itemId);
  if (!target) return items;

  const others = items
    .filter((item) => item.id !== itemId)
    .sort((a, b) => a.start - b.start);
  const duration = itemDuration(target);
  // Neighbours are chosen by the requested centre so a drag snaps to the gap it lands in.
  const centre = start + duration / 2;
  const prev = others.filter((item) => item.start + itemDuration(item) / 2 <= centre).pop();
  const next = others.find((item) => item.start + itemDuration(item) / 2 > centre);
  const min = prev ? itemEnd(prev) : 0;
  const max = next ? next.start - duration : Number.POSITIVE_INFINITY;
  if (max < min) return items; // gap too small: keep the item where it was

  const placed = { ...target, start: clamp(start, min, max) };
  return [...others, placed].sort((a, b) => a.start - b.start);
}

export const clampVolume = (volume: number) => clamp(volume, 0, 1);

/** Free space around an item on its layer: the previous item's end and the next item's start. */
export function gapAround(items: TimelineItem[], item: TimelineItem): { min: number; max: number } {
  let min = 0;
  let max = Number.POSITIVE_INFINITY;
  for (const other of items) {
    if (other.id === item.id) continue;
    if (itemEnd(other) <= item.start) min = Math.max(min, itemEnd(other));
    else if (other.start >= itemEnd(item)) max = Math.min(max, other.start);
  }
  return { min, max };
}

/**
 * Applies a trim to a placed item: the start moves with the in-point (the clip's content
 * stays where it was) and both edges stop at the neighbours instead of overlapping them.
 * Returns null when the result would be shorter than MIN_ITEM_DURATION.
 */
export function trimInPlace(
  items: TimelineItem[],
  item: TimelineItem,
  inPoint: number,
  outPoint: number,
): TimelineItem | null {
  const { min, max } = gapAround(items, item);
  const trimmed = trimItem(item, inPoint, outPoint);
  let next = { ...trimmed, start: item.start + (trimmed.inPoint - item.inPoint) };
  if (next.start < min) next = { ...next, inPoint: next.inPoint + (min - next.start), start: min };
  if (itemEnd(next) > max) next = { ...next, outPoint: next.outPoint - (itemEnd(next) - max) };
  return itemDuration(next) >= MIN_ITEM_DURATION - 1e-9 ? next : null;
}
