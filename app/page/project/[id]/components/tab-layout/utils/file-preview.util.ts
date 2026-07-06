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
