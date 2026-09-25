/**
 * Read a Blob into a `data:` URL for CSP-safe local image previews.
 *
 * The app's Content-Security-Policy allows `https:` and `data:` images but not
 * `blob:`, so `URL.createObjectURL()` previews get blocked. Reading the blob
 * into a `data:` URL avoids the violation while still showing the file locally.
 *
 * @param blob - The file blob to encode (e.g. an upload's `originFileObj`).
 * @returns A promise resolving to the `data:` URL string.
 */
export function fileToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Read an image's pixel size without a `blob:` URL (CSP-safe); `null` if it cannot be decoded.
 */
export async function readImageSize(
  blob: Blob,
): Promise<{ width: number; height: number } | null> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob);
      const size = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return size;
    } catch {
      // บาง browser decode บางชนิดไฟล์ไม่ได้ — ลองผ่าน <img> ด้านล่าง
    }
  }
  try {
    const dataUrl = await fileToDataUrl(blob);
    return await new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
  } catch {
    return null;
  }
}
