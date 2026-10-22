export type TPhotoEventStatus = "pending" | "processing" | "success" | "failed";

export interface IPhotoEventTemplate {
  promptGuideId: number;
  title: string;
  description: string | null;
  textPrompt: string;
  /** null = ใช้ defaultPromptTail */
  promptTail: string | null;
  defaultPromptTail: string;
  imageUrls: string[];
  sortOrder: number;
}

export interface IPhotoEventTemplateInput {
  promptGuideId: number;
  promptTail: string | null;
}

export interface IPhotoEventGeneration {
  id: string;
  photoId: string;
  promptGuideId: number;
  templateTitle: string | null;
  status: TPhotoEventStatus;
  progress: number | null;
  resultUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface IPhotoEventPhoto {
  id: string;
  projectId: string;
  imageName: string;
  url: string | null;
  /** รูปย่อจาก TOS image processing — null/โหลดไม่ได้ให้ใช้ url */
  thumbUrl?: string | null;
  createdAt: string;
  generations: IPhotoEventGeneration[];
}

export interface IPublicPhotoEvent {
  id: string;
  imageUrl: string;
  createdAt: string;
}

export const PHOTO_EVENT_ROOM_TYPE = "photo-event";

export const PHOTO_EVENT_SOCKET_EVENTS = {
  photoCreated: "photo-event.photo.created",
  photoDeleted: "photo-event.photo.deleted",
  generationUpdated: "photo-event.generation.updated",
} as const;

/** layout การ์ดที่พิมพ์ — หน่วย mm ทั้งหมด, ลำดับใน `elements` = z-order (ตัวหลังทับตัวหน้า) */
export interface IPrintLayout {
  version: 1;
  paper: { widthMm: number; heightMm: number; bleedMm: number; marginMm: number };
  background: { color: string; imageKey?: string; fit: TPrintFit };
  elements: TPrintElement[];
}

export type TPrintFit = "cover" | "contain";

export interface IPrintBox {
  id: string;
  xMm: number;
  yMm: number;
  wMm: number;
  hMm: number;
}

export type TPrintElement =
  | (IPrintBox & { type: "photo"; fit: TPrintFit; focusX: number; focusY: number })
  | (IPrintBox & { type: "qr"; color: string; bgColor: string })
  | (IPrintBox & { type: "icon"; assetKey: string })
  | (IPrintBox & {
      type: "text";
      content: string;
      fontSizePt: number;
      color: string;
      weight: 400 | 500 | 700;
      align: "left" | "center" | "right";
    })
  | { id: string; type: "overlay"; assetKey: string };

export type TPrintBoxElement = Exclude<TPrintElement, { type: "overlay" }>;

export interface IPhotoEventPrintTemplate {
  id: string;
  name: string;
  /** template ที่ kiosk ใช้พิมพ์ — active ได้ทีละ 1 ต่อ event */
  isActive: boolean;
  layout: IPrintLayout;
  /** storage key → presigned URL ของพื้นหลัง/icon/กรอบ */
  assetUrls: Record<string, string>;
  updatedAt: string;
}

export interface IPhotoEventPrintAsset {
  key: string;
  url: string | null;
}
