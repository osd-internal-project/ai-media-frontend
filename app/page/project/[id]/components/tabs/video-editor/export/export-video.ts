import {
  ALL_FORMATS,
  AudioBufferSink,
  AudioBufferSource,
  BlobSource,
  BufferTarget,
  CanvasSink,
  CanvasSource,
  Input,
  Mp4OutputFormat,
  Output,
  QUALITY_MEDIUM,
  UrlSource,
  canEncodeAudio,
  canEncodeVideo,
} from "mediabunny";
import { itemDuration, itemEnd, projectDuration } from "../model/timeline";
import type { EditorProject, MediaSourceRef, TimelineItem } from "../model/types";
import { outputSize, type Resolution } from "./limits";

export type { Resolution };

export const FPS = 30;
const SAMPLE_RATE = 48000;
/** Share of the progress bar spent mixing audio; decoding and encoding video takes the rest. */
const AUDIO_SHARE = 0.15;

export class ExportError extends Error {
  constructor(readonly reason: "empty" | "video-codec" | "source-missing") {
    super(reason);
  }
}

export type MediaResolver = (source: MediaSourceRef) => File | string | undefined;

interface ExportOptions {
  resolution: Resolution;
  signal: AbortSignal;
  onProgress: (fraction: number) => void;
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException("Export cancelled", "AbortError");
}

/** Opens each source file once; splits and duplicates of a clip share the same Input. */
function createInputCache(resolve: MediaResolver) {
  const inputs = new Map<string, Input>();
  return {
    get(source: MediaSourceRef): Input {
      const key = source.type === "local" ? `local:${source.fileKey}` : `gallery:${source.galleryId}`;
      let input = inputs.get(key);
      if (!input) {
        const media = resolve(source);
        if (!media) throw new ExportError("source-missing");
        input = new Input({
          source: typeof media === "string" ? new UrlSource(media) : new BlobSource(media),
          formats: ALL_FORMATS,
        });
        inputs.set(key, input);
      }
      return input;
    },
    dispose() {
      for (const input of inputs.values()) input.dispose();
      inputs.clear();
    },
  };
}

/** Decodes an item's trim window into one AudioBuffer at the source's own sample rate. */
async function decodeItemAudio(input: Input, item: TimelineItem, signal: AbortSignal): Promise<AudioBuffer | null> {
  const track = await input.getPrimaryAudioTrack();
  if (!track) return null;
  const chunks: { buffer: AudioBuffer; timestamp: number }[] = [];
  for await (const chunk of new AudioBufferSink(track).buffers(item.inPoint, item.outPoint)) {
    throwIfAborted(signal);
    chunks.push(chunk);
  }
  if (chunks.length === 0) return null;

  const { sampleRate, numberOfChannels } = chunks[0].buffer;
  const frames = Math.ceil(itemDuration(item) * sampleRate);
  const joined = new AudioBuffer({ length: frames, sampleRate, numberOfChannels });
  for (const { buffer, timestamp } of chunks) {
    const skip = Math.max(0, Math.round((item.inPoint - timestamp) * sampleRate));
    const offset = Math.max(0, Math.round((timestamp - item.inPoint) * sampleRate));
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const source = buffer.getChannelData(Math.min(channel, buffer.numberOfChannels - 1));
      const slice = source.subarray(skip, skip + Math.max(0, frames - offset));
      if (slice.length > 0) joined.copyToChannel(slice, channel, offset);
    }
  }
  return joined;
}

async function mixAudio(
  project: EditorProject,
  inputs: ReturnType<typeof createInputCache>,
  total: number,
  signal: AbortSignal,
  onProgress: (fraction: number) => void,
): Promise<AudioBuffer> {
  const offline = new OfflineAudioContext(2, Math.ceil(total * SAMPLE_RATE), SAMPLE_RATE);
  const items = project.layers
    .flatMap((layer) => layer.items)
    .filter((item) => item.media !== "image" && !item.muted && item.volume > 0);
  for (const [index, item] of items.entries()) {
    const buffer = await decodeItemAudio(inputs.get(item.source), item, signal);
    if (buffer) {
      const node = offline.createBufferSource();
      const gain = offline.createGain();
      node.buffer = buffer;
      gain.gain.value = item.volume;
      node.connect(gain).connect(offline.destination);
      node.start(item.start);
    }
    onProgress(((index + 1) / Math.max(1, items.length)) * AUDIO_SHARE * 0.8);
  }
  throwIfAborted(signal);
  const rendered = await offline.startRendering();
  onProgress(AUDIO_SHARE);
  return rendered;
}

type Context2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/** An image clip: drawn once, re-sent every second so the encoder keeps regular keyframes. */
async function addImage(
  item: TimelineItem,
  resolve: MediaResolver,
  context: Context2D,
  videoSource: CanvasSource,
  width: number,
  height: number,
) {
  const file = resolve(item.source);
  if (!(file instanceof Blob)) throw new ExportError("source-missing");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(width / bitmap.width, height / bitmap.height);
    const drawWidth = bitmap.width * scale;
    const drawHeight = bitmap.height * scale;
    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  } finally {
    bitmap.close();
  }
  const end = itemEnd(item);
  for (let time = item.start; time < end - 1e-6; time += 1) {
    await videoSource.add(time, Math.min(1, end - time));
  }
}

async function addVideoFrames(
  item: TimelineItem,
  input: Input,
  context: Context2D,
  videoSource: CanvasSource,
  width: number,
  height: number,
  signal: AbortSignal,
  report: (time: number) => void,
  drawBlack: (timestamp: number, duration: number) => Promise<void>,
) {
  const track = await input.getPrimaryVideoTrack();
  if (!track) {
    await drawBlack(item.start, itemDuration(item));
    return;
  }
  const end = itemEnd(item);
  let lastTimestamp = -1;
  const sink = new CanvasSink(track, { width, height, fit: "contain" });
  for await (const frame of sink.canvases(item.inPoint, item.outPoint)) {
    throwIfAborted(signal);
    const timestamp = item.start + Math.max(0, frame.timestamp - item.inPoint);
    // The first decoded frame can start before the in-point; keep timestamps increasing.
    if (timestamp <= lastTimestamp || timestamp >= end) continue;
    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);
    context.drawImage(frame.canvas, 0, 0);
    await videoSource.add(timestamp, Math.min(frame.duration, end - timestamp));
    lastTimestamp = timestamp;
    report(timestamp);
  }
}

function createCanvas(width: number, height: number) {
  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(width, height)
      : Object.assign(document.createElement("canvas"), { width, height });
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2d canvas unavailable");
  return { canvas, context };
}

/**
 * Renders the project to an MP4 (H.264 + AAC) entirely in the browser.
 * Throws ExportError for known problems and an AbortError when cancelled.
 */
export async function exportVideo(
  project: EditorProject,
  resolve: MediaResolver,
  { resolution, signal, onProgress }: ExportOptions,
): Promise<Blob> {
  const total = projectDuration(project);
  if (total <= 0) throw new ExportError("empty");
  const { width, height } = outputSize(project.aspect, resolution);
  if (!(await canEncodeVideo("avc", { width, height }))) throw new ExportError("video-codec");
  if (!(await canEncodeAudio("aac"))) {
    // LGPL libavcodec build, only fetched on browsers without a native AAC encoder.
    const { registerAacEncoder } = await import("@mediabunny/aac-encoder");
    registerAacEncoder();
  }

  const inputs = createInputCache(resolve);
  let output: Output<Mp4OutputFormat, BufferTarget> | null = null;
  try {
    const mixed = await mixAudio(project, inputs, total, signal, onProgress);

    const { canvas, context } = createCanvas(width, height);
    output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target: new BufferTarget() });
    const videoSource = new CanvasSource(canvas, { codec: "avc", bitrate: QUALITY_MEDIUM });
    const audioSource = new AudioBufferSource({ codec: "aac", bitrate: QUALITY_MEDIUM });
    output.addVideoTrack(videoSource, { frameRate: FPS });
    output.addAudioTrack(audioSource);
    await output.start();

    const drawBlack = async (timestamp: number, duration: number) => {
      context.fillStyle = "#000";
      context.fillRect(0, 0, width, height);
      await videoSource.add(timestamp, duration);
    };

    const videoLayer = project.layers.find((layer) => layer.kind === "video");
    const videoItems = [...(videoLayer?.items ?? [])].sort((a, b) => a.start - b.start);
    const report = (time: number) => onProgress(AUDIO_SHARE + (time / total) * (1 - AUDIO_SHARE));
    let cursor = 0;
    for (const item of videoItems) {
      throwIfAborted(signal);
      // Gaps between clips export as black.
      if (item.start > cursor) await drawBlack(cursor, item.start - cursor);
      if (item.media === "image") {
        await addImage(item, resolve, context, videoSource, width, height);
      } else {
        await addVideoFrames(item, inputs.get(item.source), context, videoSource, width, height, signal, report, drawBlack);
      }
      cursor = Math.max(cursor, itemEnd(item));
      report(cursor);
    }
    // Music can run past the last clip (or there may be no clips): hold black until the end.
    if (cursor < total) await drawBlack(cursor, total - cursor);

    throwIfAborted(signal);
    await audioSource.add(mixed);
    await output.finalize();
    onProgress(1);

    const buffer = output.target.buffer;
    if (!buffer) throw new Error("empty output");
    return new Blob([buffer], { type: "video/mp4" });
  } catch (error) {
    if (output && (output.state === "pending" || output.state === "started")) {
      await output.cancel().catch((cancelError: unknown) => console.error("[video-editor] cancel failed", cancelError));
    }
    throw error;
  } finally {
    inputs.dispose();
  }
}
