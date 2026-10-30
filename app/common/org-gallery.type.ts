export type GalleryType = "image" | "video" | "omnihuman" | "dreamactor" | "audio";
export type PublicationStatus = "PENDING" | "PUBLISHED" | "REJECTED" | "REMOVED" | "FAILED";
export type PublishStatusFilter = "NONE" | PublicationStatus;
/** เหตุที่กดเผยแพร่ไม่ได้ — null = เผยแพร่ได้ */
export type PublishBlock = "NOT_OWNER" | "MODEL_NOT_ALLOWED" | null;

export type OrgGalleryItem = {
  id: string;
  projectId: string;
  type: GalleryType | null;
  prompt: string | null;
  createdAt: string;
  creator: { userId: string; fullname: string };
  modelName: string | null;
  durationSec: number | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  publication: { id: string; status: PublicationStatus; visibility: "PUBLIC" | "PRIVATE" } | null;
  publishBlock: PublishBlock;
};

export type OrgGalleryQuery = {
  type?: GalleryType;
  publishStatus?: PublishStatusFilter;
  memberId?: string;
  page: number;
  pageSize: number;
};

export type OrgGalleryPage = {
  data: OrgGalleryItem[];
  total: number;
  page: number;
  pageSize: number;
};
