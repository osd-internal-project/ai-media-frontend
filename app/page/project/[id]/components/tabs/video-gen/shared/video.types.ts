import type { GenerationStage } from "../../../shared/generation-progress";
interface UserMessage {
  id?: number;
  userId?: string;
  username: string;
  fullname: string;
  email?: string;
  tier?: string;
  description?: string;
  phoneNumber?: string;
  status?: string;
  lastOn?: string;
  maxToken?: number;
  maxImages?: number;
  apiKeys?: string;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
  agreement?: boolean;
  recentOrganizationId?: string;
}

export interface VideoMessage {
  id?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  status?: boolean;
  fileName?: string;
}

export interface Message {
  id: string;
  taskId: string;
  projectId: string;
  userId: string;
  prompt: string;
  typeGenerate: string;
  createdAt: string;
  status: boolean;
  genneratedStatus: string;
  /** เหตุผลที่ fail ของงานใน session นี้ — ไม่ได้มาจาก DB, reload แล้วหาย */
  errorMessage?: string;
  generateConfig: {
    ratio: string;
    width: number;
    height: number;
    content: string;
    duration: string;
    modelName: string;
    imageCount: number;
    resolution: string;
    generateAudio: boolean;
  };
  percentage?: number;
  stage?: GenerationStage;
  current?: number;
  total?: number;
  users: UserMessage;
  referenceImages: string[];
  resolution: string;
  ratio: string;
  imageUrls: VideoMessage[];
  seq?: number;
  organizationId?: string;
}

// core ตอบ QUEUED ทันทีหลังเข้าคิว — ต้องนับเป็น loading ไม่งั้น card ว่างจนกว่า worker เริ่ม
const LOADING_STATUSES = ["PENDING", "QUEUED", "PROCESSING"];

export const isVideoLoading = (status: string | undefined): boolean =>
  !!status && LOADING_STATUSES.includes(status);
