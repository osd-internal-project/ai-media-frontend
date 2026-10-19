const REQUIRED_APIS = ["VideoEncoder", "VideoDecoder", "AudioEncoder", "AudioDecoder", "OfflineAudioContext"] as const;

/** Names of the browser APIs the editor needs but this browser lacks. */
export function missingBrowserApis(): string[] {
  if (typeof window === "undefined") return [...REQUIRED_APIS];
  return REQUIRED_APIS.filter((api) => !(api in window));
}
