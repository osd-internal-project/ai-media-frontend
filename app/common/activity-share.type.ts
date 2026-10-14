/**
 * ชนิดข้อมูลของฟีเจอร์ Public Social
 * ต้องตรงกับ libs/share/src/social/social.constants.ts ฝั่ง backend
 */

export const SOCIAL_PLATFORMS = [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "YOUTUBE",
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const ACTIVITY_SHARE_STATUSES = [
  "NEW",
  "APPROVED",
  "REJECTED",
  "PENDING",
  "PUBLISHING",
  "SUCCESS",
  "FAILED",
] as const;
export type ActivityShareStatus = (typeof ACTIVITY_SHARE_STATUSES)[number];

export type ShareTargetStatus =
  | "PENDING"
  | "PUBLISHING"
  | "SUCCESS"
  | "FAILED";

export type SocialAccountStatus = "ACTIVE" | "EXPIRED" | "REVOKED";

/** ที่มาของ token: consent flow ปกติ หรือแอดมินระบบวางมือให้ */
export type SocialConnectionType = "OAUTH" | "MANUAL";

/** คำอธิบายช่องกรอกของแต่ละ platform ในฟอร์มวาง token เอง */
export interface PlatformManualFields {
  /** ชื่อที่ผู้ใช้เข้าใจของ externalId */
  readonly idLabel: string;
  readonly idPlaceholder: string;
  /**
   * true = access token อายุสั้น ต้องมี refresh token ไม่งั้นตายภายในวันเดียว
   * (Meta Page token ไม่หมดอายุ จึงไม่ต้องมี)
   */
  readonly needsRefreshToken: boolean;
  /** คำใบ้ว่าไปหา token/id นี้จากที่ไหน */
  readonly hint: string;
}

export const PLATFORM_MANUAL_FIELDS: Readonly<
  Record<SocialPlatform, PlatformManualFields>
> = {
  FACEBOOK: {
    idLabel: "Page ID",
    idPlaceholder: "e.g. 102938475610293",
    needsRefreshToken: false,
    hint: "Use a long-lived Page access token, not a user token. A Page token derived from a long-lived user token does not expire.",
  },
  INSTAGRAM: {
    idLabel: "Instagram user ID",
    idPlaceholder: "e.g. 17841400000000000",
    needsRefreshToken: false,
    hint: "The Instagram Business account ID linked to the Page. The Page access token works here too.",
  },
  TIKTOK: {
    idLabel: "open_id",
    idPlaceholder: "TikTok open_id",
    needsRefreshToken: true,
    hint: "TikTok access tokens expire in about 24 hours — add the refresh token or posting will stop working tomorrow.",
  },
  YOUTUBE: {
    idLabel: "Channel ID",
    idPlaceholder: "e.g. UCxxxxxxxxxxxxxxxxxxxxxx",
    needsRefreshToken: true,
    hint: "Google access tokens expire in about 1 hour — the refresh token is required for unattended posting.",
  },
} as const;

/** typeGenerate ที่นับเป็นวิดีโอ */
export const VIDEO_GENERATE_TYPES: readonly string[] = [
  "video",
  "dreamactor",
  "omnihumen",
  "omnihuman",
] as const;

export interface PlatformCapability {
  readonly allowsImage: boolean;
  readonly allowsVideo: boolean;
  readonly maxMediaCount: number;
  readonly maxCaptionLength: number;
  readonly allowsMixedMedia: boolean;
}

/**
 * ข้อจำกัดของแต่ละ platform — ทำซ้ำฝั่ง frontend เพื่อ validate แบบสด ๆ ในฟอร์ม
 * (backend ยังตรวจซ้ำอีกชั้นเสมอ ตรงนี้เป็นเพียง UX ไม่ใช่ security boundary)
 */
export const PLATFORM_CAPABILITIES: Readonly<
  Record<SocialPlatform, PlatformCapability>
> = {
  FACEBOOK: {
    allowsImage: true,
    allowsVideo: true,
    maxMediaCount: 10,
    maxCaptionLength: 5000,
    allowsMixedMedia: false,
  },
  INSTAGRAM: {
    allowsImage: true,
    allowsVideo: true,
    maxMediaCount: 10,
    maxCaptionLength: 2200,
    allowsMixedMedia: true,
  },
  TIKTOK: {
    allowsImage: false,
    allowsVideo: true,
    maxMediaCount: 1,
    maxCaptionLength: 2200,
    allowsMixedMedia: false,
  },
  YOUTUBE: {
    allowsImage: false,
    allowsVideo: true,
    maxMediaCount: 1,
    maxCaptionLength: 5000,
    allowsMixedMedia: false,
  },
} as const;

export const MAX_MEDIA_PER_SHARE = 10;

export const PLATFORM_LABELS: Readonly<Record<SocialPlatform, string>> = {
  FACEBOOK: "Facebook Page",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
};

/** สีของ antd Tag ต่อสถานะ — นิยามที่เดียว ใช้ทั้ง table / drawer / queue */
export const SHARE_STATUS_COLORS: Readonly<
  Record<ActivityShareStatus, string>
> = {
  NEW: "default",
  APPROVED: "blue",
  REJECTED: "red",
  PENDING: "gold",
  PUBLISHING: "processing",
  SUCCESS: "green",
  FAILED: "red",
};

export const TARGET_STATUS_COLORS: Readonly<
  Record<ShareTargetStatus, string>
> = {
  PENDING: "default",
  PUBLISHING: "processing",
  SUCCESS: "green",
  FAILED: "red",
};

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  externalId: string;
  displayName: string;
  avatarUrl: string | null;
  status: SocialAccountStatus;
  connectionType: SocialConnectionType;
  tokenExpiresAt: string | null;
  connectedByUserId: string;
  createdAt: string;
}

/** body ของ POST /social-account/manual — token เว้นว่างได้เมื่อแก้บัญชีเดิม */
export interface SaveManualTokenPayload {
  organizationId: string;
  userId: string;
  platform: SocialPlatform;
  externalId: string;
  accessToken?: string;
  refreshToken?: string;
  /** ISO 8601 */
  tokenExpiresAt?: string;
  displayName?: string;
}

/** สื่อ 1 ชิ้นใน snapshot พร้อม URL ที่ backend presign มาให้แล้ว */
export interface ShareMedia {
  galleryId: string;
  resultKey: string;
  thumbnailKey: string | null;
  typeGenerate: string;
  order: number;
  url: string | null;
  thumbnailUrl: string | null;
}

export interface ActivityShareTarget {
  id: string;
  activityShareId: string;
  socialAccountId: string;
  platform: SocialPlatform;
  status: ShareTargetStatus;
  remotePostId: string | null;
  remoteUrl: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  attemptCount: number;
  publishedAt: string | null;
  socialAccount: {
    id: string;
    platform: SocialPlatform;
    displayName: string;
    avatarUrl: string | null;
    status: SocialAccountStatus;
  } | null;
}

export interface ActivityShareLog {
  id: string;
  activityShareId: string;
  activityShareTargetId: string | null;
  action: string;
  fromStatus: string | null;
  toStatus: string;
  actionUserId: string | null;
  actorType: "USER" | "SYSTEM";
  note: string | null;
  metadata: unknown;
  createdAt: string;
}

/** แถวในตาราง (GET /activity-share) */
export interface ActivityShareListItem {
  id: string;
  organizationId: string;
  projectId: string;
  createdByUserId: string;
  caption: string;
  hashtags: string[];
  linkUrl: string | null;
  status: ActivityShareStatus;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  targets: ActivityShareTarget[];
  previewUrl: string | null;
}

/** รายละเอียด 1 ใบ (GET /activity-share/:id) */
export interface ActivityShareDetail
  extends Omit<ActivityShareListItem, "previewUrl"> {
  media: ShareMedia[];
  logs: ActivityShareLog[];
}

export interface ActivityShareListResponse {
  data: ActivityShareListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateActivitySharePayload {
  organizationId: string;
  projectId: string;
  userId: string;
  caption?: string;
  hashtags?: string[];
  linkUrl?: string;
  mediaItems: { galleryId: string }[];
  socialAccountIds: string[];
}

export interface UpdateActivitySharePayload {
  userId: string;
  caption?: string;
  hashtags?: string[];
  linkUrl?: string;
  mediaItems?: { galleryId: string }[];
  socialAccountIds?: string[];
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
