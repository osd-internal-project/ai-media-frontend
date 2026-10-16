import type { EditorProject, MediaSourceRef } from "../model/types";

/** Playable URL for an item's media, or undefined when it is not available (yet). */
export type MediaUrlResolver = (source: MediaSourceRef) => string | undefined;

/**
 * Draws the timeline at a point in time. The `<video>`-based renderer is enough
 * while there are no overlays; a canvas compositor can replace it behind this interface.
 */
export interface Renderer {
  mount(container: HTMLElement): void;
  render(project: EditorProject, time: number, playing: boolean): void;
  /** Call inside the Play click handler so mobile browsers allow later play() calls. */
  unlock(): void;
  dispose(): void;
}
