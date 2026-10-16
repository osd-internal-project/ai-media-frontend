const REQUIRED_APIS = ["VideoEncoder", "VideoDecoder", "AudioEncoder", "AudioDecoder", "OfflineAudioContext"] as const;

/** Names of the browser APIs the editor needs but this browser lacks. */
export function missingBrowserApis(): string[] {
  if (typeof window === "undefined") return [...REQUIRED_APIS];
  return REQUIRED_APIS.filter((api) => !(api in window));
}

/**
 * MediaBunny reads remote files with Range requests, so the storage bucket must
 * allow cross-origin GET with `Range` and expose `Content-Range`.
 */
export async function canReadByRange(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { headers: { Range: "bytes=0-1" } });
    return res.status === 206 && res.headers.get("content-range") !== null;
  } catch (error) {
    console.error("[video-editor] range check failed", error);
    return false;
  }
}
