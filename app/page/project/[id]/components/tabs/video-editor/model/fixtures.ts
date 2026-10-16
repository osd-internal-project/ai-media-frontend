import type { EditorProject, TimelineItem } from "./types";

/** Test-only builders. */
export function makeItem(id: string, overrides: Partial<TimelineItem> = {}): TimelineItem {
  return {
    id,
    name: `${id}.mp4`,
    media: "video",
    source: { type: "local", fileKey: id },
    sourceDuration: 10,
    start: 0,
    inPoint: 0,
    outPoint: 10,
    volume: 1,
    muted: false,
    ...overrides,
  };
}

export function makeProject(
  video: TimelineItem[] = [],
  music: TimelineItem[] = [],
): EditorProject {
  return {
    id: "draft-1",
    projectId: "project-1",
    name: "Draft",
    aspect: "9:16",
    layers: [
      { id: "video", kind: "video", items: video },
      { id: "music-1", kind: "music", items: music },
    ],
    updatedAt: 0,
  };
}
