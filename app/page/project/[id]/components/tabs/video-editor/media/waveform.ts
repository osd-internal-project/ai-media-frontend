import { ALL_FORMATS, AudioBufferSink, BlobSource, Input } from "mediabunny";

/** Peak resolution; one value per bucket of 1/PEAKS_PER_SECOND seconds, 0..1. */
export const PEAKS_PER_SECOND = 20;

const cache = new Map<string, Promise<Float32Array>>();

async function buildPeaks(file: File, duration: number): Promise<Float32Array> {
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  try {
    const track = await input.getPrimaryAudioTrack();
    const peaks = new Float32Array(Math.max(1, Math.ceil(duration * PEAKS_PER_SECOND)));
    if (!track) return peaks;
    for await (const { buffer, timestamp } of new AudioBufferSink(track).buffers()) {
      const data = buffer.getChannelData(0);
      const samplesPerBucket = buffer.sampleRate / PEAKS_PER_SECOND;
      for (let s = 0; s < data.length; s++) {
        const bucket = Math.floor((timestamp + s / buffer.sampleRate) * PEAKS_PER_SECOND);
        if (bucket >= peaks.length) break;
        const value = Math.abs(data[s]);
        if (value > peaks[bucket]) peaks[bucket] = value;
        // Skip ahead inside a bucket: a few samples per bucket are enough for a preview.
        s += Math.max(0, Math.floor(samplesPerBucket / 64) - 1);
      }
    }
    return peaks;
  } finally {
    input.dispose();
  }
}

export function loadPeaks(key: string, file: File, duration: number): Promise<Float32Array> {
  let pending = cache.get(key);
  if (!pending) {
    pending = buildPeaks(file, duration).catch((error: unknown) => {
      console.error("[video-editor] waveform failed", error);
      cache.delete(key);
      return new Float32Array(0);
    });
    cache.set(key, pending);
  }
  return pending;
}
