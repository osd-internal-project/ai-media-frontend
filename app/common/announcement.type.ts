export type AnnouncementCategory = "PROMOTION" | "SYSTEM_UPDATE";

export interface IAnnouncement {
  id: string;
  category: AnnouncementCategory;
  title: string;
  body: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** ฟอร์มสร้าง/แก้ไข — `file` ไม่ส่ง = คงรูปเดิม */
export interface IAnnouncementInput {
  category: AnnouncementCategory;
  title: string;
  body?: string;
  sortOrder?: number;
  isActive?: boolean;
  removeImage?: boolean;
  file?: File;
}
