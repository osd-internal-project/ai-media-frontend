import { ALL_FORMATS, BlobSource, CanvasSink, Input } from "mediabunny";

export interface FilmstripFrame {
  /** Source time the frame was taken at. */
  time: number;
  url: string;
}

const FRAME_HEIGHT = 60;
const SECONDS_PER_FRAME = 2;
const MAX_FRAMES = 40;

/** One filmstrip per source file, shared by every clip (splits, duplicates) cut from it. */
const cache = new Map<string, Promise<FilmstripFrame[]>>();

async function canvasToUrl(canvas: HTMLCanvasElement | OffscreenCanvas): Promise<string> {
  const blob =
    canvas instanceof OffscreenCanvas
      ? await canvas.convertToBlob({ type: "image/jpeg", quality: 0.6 })
      : await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.6));
  if (!blob) throw new Error("thumbnail encode failed");
  return URL.createObjectURL(blob);
}

async function buildFilmstrip(file: File, duration: number): Promise<FilmstripFrame[]> {
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track) return [];
    const width = Math.max(1, Math.round((track.displayWidth / track.displayHeight) * FRAME_HEIGHT));
    const sink = new CanvasSink(track, { width, height: FRAME_HEIGHT, fit: "cover" });
    const count = Math.min(MAX_FRAMES, Math.max(1, Math.ceil(duration / SECONDS_PER_FRAME)));
    const times = Array.from({ length: count }, (_, i) => (duration * (i + 0.5)) / count);

    const frames: FilmstripFrame[] = [];
    let i = 0;
    for await (const wrapped of sink.canvasesAtTimestamps(times)) {
      if (wrapped) frames.push({ time: times[i], url: await canvasToUrl(wrapped.canvas) });
      i++;
    }
    return frames;
  } finally {
    input.dispose();
  }
}

/** Frames spread over the whole source; callers pick the ones inside a clip's trim window. */
export function loadFilmstrip(key: string, file: File, duration: number): Promise<FilmstripFrame[]> {
  let pending = cache.get(key);
  if (!pending) {
    pending = buildFilmstrip(file, duration).catch((error: unknown) => {
      console.error("[video-editor] filmstrip failed", error);
      cache.delete(key);
      return [];
    });
    cache.set(key, pending);
  }
  return pending;
}
