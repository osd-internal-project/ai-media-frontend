/**
 * Type และค่าคงที่ของฟีเจอร์ Communication
 *
 * mirror ของ libs/share/src/community/* ฝั่ง backend — ค่าที่เป็น union ต้องตรงกัน
 * ทั้งสองฝั่งเสมอ (เช่นเดียวกับ activity-share.type.ts ของ Public Social)
 */

export const COMMUNITY_POST_STATUSES = [
  "NEW",
  "APPROVED",
  "REJECTED",
  "SCHEDULED",
  "PUBLISHED",
  "UNPUBLISHED",
] as const;
export type CommunityPostStatus = (typeof COMMUNITY_POST_STATUSES)[number];

/** สถานะที่ยังแก้ไข/ลบโพสต์ได้ */
export const COMMUNITY_EDITABLE_STATUSES: readonly CommunityPostStatus[] = [
  "NEW",
  "REJECTED",
] as const;

/** จำนวนสื่อสูงสุดต่อ 1 โพสต์ */
export const MAX_MEDIA_PER_COMMUNITY_POST = 10;

/** ความยาวสูงสุดของ caption */
export const MAX_COMMUNITY_CAPTION_LENGTH = 5000;

/** ความยาวสูงสุดของ title */
export const MAX_COMMUNITY_TITLE_LENGTH = 200;

/** typeGenerate ใน gallery ที่นับเป็นวิดีโอ (ที่เหลือถือเป็นรูป) */
export const VIDEO_GENERATE_TYPES: readonly string[] = [
  "video",
  "dreamactor",
  "omnihumen",
  "omnihuman",
] as const;

/** สีของ antd Tag ต่อสถานะ — single source of truth ของทุกหน้าจอในฟีเจอร์นี้ */
export const COMMUNITY_STATUS_COLORS: Readonly<
  Record<CommunityPostStatus, string>
> = {
  NEW: "default",
  APPROVED: "blue",
  REJECTED: "red",
  SCHEDULED: "purple",
  PUBLISHED: "green",
  UNPUBLISHED: "orange",
};

/** ข้อความที่ผู้ใช้เห็นแทนชื่อสถานะดิบ */
export const COMMUNITY_STATUS_LABELS: Readonly<
  Record<CommunityPostStatus, string>
> = {
  NEW: "Awaiting approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  UNPUBLISHED: "Taken down",
};

/** สื่อ 1 ชิ้นใน snapshot พร้อม URL ที่ backend presign มาให้แล้ว */
export interface CommunityMedia {
  galleryId: string;
  resultKey: string;
  thumbnailKey: string | null;
  typeGenerate: string;
  order: number;
  url: string | null;
  thumbnailUrl: string | null;
}

export interface CommunityPostLog {
  id: string;
  postId: string;
  action: string;
  fromStatus: string | null;
  toStatus: string;
  actionUserId: string | null;
  actorType: "USER" | "SYSTEM";
  note: string | null;
  metadata: unknown;
  createdAt: string;
}

/** การ์ดในหน้า list (GET /community-post) */
export interface CommunityPostListItem {
  id: string;
  slug: string;
  organizationId: string;
  projectId: string;
  createdByUserId: string;
  title: string;
  caption: string;
  hashtags: string[];
  linkUrl: string | null;
  showPrompt: boolean;
  authorDisplayName: string;
  organizationDisplayName: string;
  status: CommunityPostStatus;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  unpublishedAt: string | null;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  previewUrl: string | null;
  mediaCount: number;
}

/** รายละเอียด 1 ใบ (GET /community-post/:id) */
export interface CommunityPostDetail
  extends Omit<CommunityPostListItem, "previewUrl" | "mediaCount"> {
  promptSnapshot: string | null;
  media: CommunityMedia[];
  logs: CommunityPostLog[];
}

export interface CommunityPostListResponse {
  data: CommunityPostListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateCommunityPostPayload {
  organizationId: string;
  projectId: string;
  userId: string;
  title: string;
  caption?: string;
  hashtags?: string[];
  linkUrl?: string;
  mediaItems: { galleryId: string }[];
  showPrompt?: boolean;
}

export interface UpdateCommunityPostPayload {
  userId: string;
  title?: string;
  caption?: string;
  hashtags?: string[];
  linkUrl?: string;
  mediaItems?: { galleryId: string }[];
  showPrompt?: boolean;
}

/** สื่อ 1 ชิ้นในรูปแบบที่หน้า public เห็น — ไม่มี object key และไม่มี galleryId */
export interface PublicCommunityMedia {
  index: number;
  isVideo: boolean;
  url: string;
  thumbnailUrl: string;
}

/** โพสต์ในหน้า public — ตรงกับ PublicCommunityPost ของ backend */
export interface PublicCommunityPost {
  id: string;
  slug: string;
  title: string;
  caption: string;
  hashtags: string[];
  linkUrl: string | null;
  media: PublicCommunityMedia[];
  prompt: string | null;
  authorDisplayName: string;
  organizationDisplayName: string;
  publishedAt: string | null;
  viewCount: number;
  likeCount: number;
}

export interface PublicCommunityFeedResponse {
  data: PublicCommunityPost[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * ตรวจว่า typeGenerate เป็นวิดีโอหรือไม่
 *
 * @param typeGenerate ค่าจาก gallery
 * @returns true เมื่อเป็นวิดีโอ
 */
export function isVideoType(typeGenerate: string | null | undefined): boolean {
  return VIDEO_GENERATE_TYPES.includes(typeGenerate ?? "");
}

/**
 * ตรวจว่าสถานะนี้ยังแก้ไขหรือลบได้
 *
 * @param status สถานะปัจจุบันของโพสต์
 * @returns true เมื่อยังแก้ได้
 */
export function isEditableStatus(status: CommunityPostStatus): boolean {
  return COMMUNITY_EDITABLE_STATUSES.includes(status);
}
