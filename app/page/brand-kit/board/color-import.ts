/** Colour codes found in pasted text, as #RRGGBB, in order, without repeats. */
export function parseHexList(text: string, limit = 24): string[] {
  const found: string[] = [];
  // a code without "#" must be six characters and contain a digit, so words like "facade" are not colours
  const pattern =
    /(?<![0-9a-zA-Z#])(#?)([0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z])/g;
  for (const match of text.matchAll(pattern)) {
    const [, hash, digits] = match;
    if (!hash && (digits.length !== 6 || !/\d/.test(digits))) continue;
    const six =
      digits.length === 3
        ? digits
            .split("")
            .map((c) => c + c)
            .join("")
        : digits;
    const hex = `#${six.toUpperCase()}`;
    if (!found.includes(hex)) found.push(hex);
    if (found.length === limit) break;
  }
  return found;
}

const toRgb = (hex: string) => {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const HUES: [number, string][] = [
  [15, "Red"],
  [45, "Orange"],
  [70, "Yellow"],
  [165, "Green"],
  [200, "Teal"],
  [255, "Blue"],
  [290, "Purple"],
  [345, "Pink"],
  [360, "Red"],
];

/** A plain starting name for a colour ("Dark Blue", "Light Pink"); the AI follows names better than codes. */
export function nameColor(hex: string): string {
  const [r, g, b] = toRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const light = (max + min) / 2;
  const delta = max - min;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * light - 1) || 1);
  if (saturation < 0.12) {
    if (light > 0.92) return "White";
    if (light < 0.12) return "Black";
    return light > 0.6 ? "Light Gray" : light < 0.35 ? "Dark Gray" : "Gray";
  }
  let hue =
    max === r
      ? ((g - b) / delta) % 6
      : max === g
        ? (b - r) / delta + 2
        : (r - g) / delta + 4;
  hue = (hue * 60 + 360) % 360;
  const base = HUES.find(([upTo]) => hue < upTo)?.[1] ?? "Red";
  if (base === "Orange" && light < 0.4) return "Brown";
  return `${light < 0.3 ? "Dark " : light > 0.72 ? "Light " : ""}${base}`;
}

/**
 * The most common colours in RGBA pixel data, as #RRGGBB. Pixels are grouped into 4096 buckets;
 * a bucket too close to one already picked is skipped so the result is a palette, not five blues.
 */
export function quantize(
  data: ArrayLike<number>,
  count = 6,
  minDistance = 48,
): string[] {
  const buckets = new Map<number, [number, number, number, number]>();
  for (let i = 0; i + 3 < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
    const bucket = buckets.get(key) ?? [0, 0, 0, 0];
    bucket[0] += data[i];
    bucket[1] += data[i + 1];
    bucket[2] += data[i + 2];
    bucket[3] += 1;
    buckets.set(key, bucket);
  }
  const picked: number[][] = [];
  for (const [r, g, b, n] of [...buckets.values()].sort((a, b) => b[3] - a[3])) {
    const color = [r / n, g / n, b / n];
    const tooClose = picked.some(
      (p) => Math.hypot(p[0] - color[0], p[1] - color[1], p[2] - color[2]) < minDistance,
    );
    if (!tooClose) picked.push(color);
    if (picked.length === count) break;
  }
  return picked.map(
    (c) =>
      `#${c
        .map((v) => Math.round(v).toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()}`,
  );
}

/**
 * Reads an image file in the browser and returns its main colours. The image never leaves the device.
 * @throws when the file is not an image the browser can decode
 */
export async function extractPalette(file: File, count = 6): Promise<string[]> {
  const bitmap = await createImageBitmap(file);
  const size = 64; // enough pixels to rank colours; small enough to be instant
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available in this browser");
  context.drawImage(bitmap, 0, 0, size, size);
  bitmap.close();
  return quantize(context.getImageData(0, 0, size, size).data, count);
}
