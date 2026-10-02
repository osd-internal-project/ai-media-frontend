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
