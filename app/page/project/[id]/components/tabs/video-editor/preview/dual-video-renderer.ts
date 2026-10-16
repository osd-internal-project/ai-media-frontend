import { itemAt } from "../model/timeline";
import type { EditorProject, Layer, TimelineItem } from "../model/types";
import type { MediaUrlResolver, Renderer } from "./renderer";

const FILL_STYLE = "position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0";

/** How far a playing element may drift from the timeline clock before it is re-seeked. */
const PLAYING_DRIFT = 0.3;
/** While paused every playhead move should show the exact frame. */
const PAUSED_DRIFT = 0.04;

interface Slot<E extends HTMLMediaElement> {
  el: E;
  itemId: string | null;
}

/** Media time inside the source file for timeline `time`. */
const sourceTime = (item: TimelineItem, time: number) => item.inPoint + (time - item.start);

function nextItem(layer: Layer, current: TimelineItem | null, time: number): TimelineItem | null {
  if (current) {
    const index = layer.items.findIndex((item) => item.id === current.id);
    return layer.items[index + 1] ?? null;
  }
  return layer.items.find((item) => item.start > time) ?? null;
}

/**
 * Two `<video>` elements take turns: one plays the clip under the playhead while the
 * other preloads the next clip, so cuts don't stall. Music layers get one `<audio>` each.
 */
export class DualVideoRenderer implements Renderer {
  private readonly video: [Slot<HTMLVideoElement>, Slot<HTMLVideoElement>];
  private readonly audio = new Map<string, Slot<HTMLAudioElement>>();
  private container: HTMLElement | null = null;

  private readonly image: HTMLImageElement;

  constructor(private readonly resolveUrl: MediaUrlResolver) {
    this.video = [this.createVideo(), this.createVideo()];
    this.image = document.createElement("img");
    this.image.alt = "";
    this.image.style.cssText = FILL_STYLE;
  }

  mount(container: HTMLElement) {
    this.container = container;
    for (const slot of this.video) container.appendChild(slot.el);
    container.appendChild(this.image);
  }

  unlock() {
    const elements = [...this.video.map((slot) => slot.el), ...[...this.audio.values()].map((slot) => slot.el)];
    // Starting each element inside the gesture is what unlocks it; the next render() pauses the idle ones.
    for (const el of elements) {
      if (!el.src || !el.paused) continue;
      el.play().catch((error: unknown) => console.warn("[video-editor] media unlock failed", error));
    }
  }

  render(project: EditorProject, time: number, playing: boolean) {
    for (const layer of project.layers) {
      if (layer.kind === "video") this.renderVideo(layer, time, playing);
      else this.renderAudio(layer, time, playing);
    }
    // Music layers that were deleted must stop sounding.
    for (const [layerId, slot] of this.audio) {
      if (!project.layers.some((layer) => layer.id === layerId)) {
        slot.el.pause();
        this.audio.delete(layerId);
      }
    }
  }

  dispose() {
    for (const slot of [...this.video, ...this.audio.values()]) {
      slot.el.pause();
      slot.el.removeAttribute("src");
      slot.el.load();
      slot.el.remove();
    }
    this.audio.clear();
    this.image.removeAttribute("src");
    this.image.remove();
    this.container = null;
  }

  private createVideo(): Slot<HTMLVideoElement> {
    const el = document.createElement("video");
    el.playsInline = true;
    el.preload = "auto";
    el.style.cssText = FILL_STYLE;
    return { el, itemId: null };
  }

  private renderVideo(layer: Layer, time: number, playing: boolean) {
    const found = itemAt(layer, time);
    const upcoming = nextItem(layer, found, time);
    // Images draw with <img>; gaps show the black frame behind everything.
    const current = found?.media === "video" ? found : null;
    const preload = upcoming?.media === "video" ? upcoming : null;

    this.renderImage(found?.media === "image" ? found : null);

    let active = current ? this.video.find((slot) => slot.itemId === current.id) : undefined;
    if (current && !active) {
      // Reuse the slot that is not holding the clip we want to preload.
      active = this.video.find((slot) => slot.itemId !== preload?.id) ?? this.video[0];
    }
    if (active && current) {
      // Re-run every frame so a URL that arrived late (restored clip) gets attached.
      this.load(active, current);
      active.el.style.opacity = "1";
      this.syncElement(active.el, current, time, playing);
    }
    for (const slot of this.video) {
      if (slot === active) continue;
      slot.el.style.opacity = "0";
      slot.el.pause();
      if (preload && slot.itemId !== preload.id && !this.video.some((other) => other.itemId === preload.id)) {
        this.load(slot, preload);
        slot.el.currentTime = preload.inPoint;
      }
    }
  }

  private renderImage(item: TimelineItem | null) {
    const url = item ? this.resolveUrl(item.source) : undefined;
    if (!url) {
      this.image.style.opacity = "0";
      return;
    }
    if (this.image.src !== url) this.image.src = url;
    this.image.style.opacity = "1";
  }

  private renderAudio(layer: Layer, time: number, playing: boolean) {
    let slot = this.audio.get(layer.id);
    if (!slot) {
      slot = { el: document.createElement("audio"), itemId: null };
      slot.el.preload = "auto";
      this.audio.set(layer.id, slot);
    }
    const current = itemAt(layer, time);
    if (!current) {
      slot.el.pause();
      return;
    }
    this.load(slot, current);
    this.syncElement(slot.el, current, time, playing);
  }

  private load<E extends HTMLMediaElement>(slot: Slot<E>, item: TimelineItem) {
    const url = this.resolveUrl(item.source);
    slot.itemId = item.id;
    if (!url) {
      slot.el.removeAttribute("src");
      return;
    }
    if (slot.el.src !== url) slot.el.src = url;
  }

  private syncElement(el: HTMLMediaElement, item: TimelineItem, time: number, playing: boolean) {
    el.volume = item.volume;
    el.muted = item.muted;
    const target = sourceTime(item, time);
    if (Math.abs(el.currentTime - target) > (playing ? PLAYING_DRIFT : PAUSED_DRIFT)) {
      el.currentTime = target;
    }
    if (playing && el.paused) {
      el.play().catch((error: unknown) => console.warn("[video-editor] play blocked", error));
    } else if (!playing && !el.paused) {
      el.pause();
    }
  }
}
