/** All times are in seconds. Timeline JSON is the single source of truth for preview and export. */

export type AspectRatio = "9:16" | "16:9" | "1:1";

export type LayerKind = "video" | "music";

/** What an item shows: images sit on the video layer with a chosen display length. */
export type MediaKind = "video" | "audio" | "image";

/**
 * Where an item's media comes from. Library items keep the gallery id (presigned URLs expire);
 * local files stay on the device and are looked up in IndexedDB by `fileKey`.
 */
export type MediaSourceRef =
  | { type: "gallery"; galleryId: string }
  | { type: "local"; fileKey: string };

export interface TimelineItem {
  id: string;
  name: string;
  media: MediaKind;
  source: MediaSourceRef;
  /** Full length of the source file. */
  sourceDuration: number;
  /** Position on the timeline. */
  start: number;
  /** Trim window inside the source file. */
  inPoint: number;
  outPoint: number;
  /** 0..1 */
  volume: number;
  muted: boolean;
}

export interface Layer {
  id: string;
  kind: LayerKind;
  items: TimelineItem[];
}

export interface EditorProject {
  id: string;
  projectId: string;
  name: string;
  aspect: AspectRatio;
  layers: Layer[];
  updatedAt: number;
}
