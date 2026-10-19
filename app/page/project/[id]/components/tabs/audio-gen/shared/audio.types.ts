import type { Message as VideoMessageRow } from "../../video-gen/shared/video.types";

export { isVideoLoading as isAudioLoading } from "../../video-gen/shared/video.types";

/** ประโยคจาก Seed Audio (`sentences` / `utterances`) — shape ไม่ตายตัว จึงอ่านแค่ text */
export interface AudioSubtitle {
  text?: string;
  [key: string]: unknown;
}

export interface AudioGenerateConfig {
  content: string;
  modelName: string;
  format?: string;
  duration?: number;
  sampleRate?: number;
  speechRate?: number;
  loudnessRate?: number;
  pitchRate?: number;
  enableSubtitle?: boolean;
  subtitles?: AudioSubtitle[];
  references?: { url?: string; speaker?: string }[];
}

/** row ของ gallery ฝั่ง audio — shape เดียวกับ video ยกเว้น generateConfig */
export interface Message extends Omit<VideoMessageRow, "generateConfig"> {
  generateConfig: AudioGenerateConfig;
}
