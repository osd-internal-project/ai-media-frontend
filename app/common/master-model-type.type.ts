export interface TMasterModelType {
  id: number;
  name: string;
  modelType: string | null;
  type: string | null;
  description: string | null;
  isDefault: boolean;
  /** false = ปิดทั้งระบบ (เห็นเฉพาะหน้า AI Models ของ admin ผ่าน includeInactive) */
  isActive?: boolean;
  allowPublish: boolean;
  modelDetails: any | null;
  createdAt: string;
  updatedAt: string;
  sendConfig?: {
    type: string;
    /** Limits that override the per-type defaults (e.g. seedance 2.0 mini has no 1080p) */
    resolutions?: string[];
    duration?: { min: number; max: number };
    supportDraft?: boolean;
    /** Final video from a draft; off until the gateway accepts `draft_task` */
    supportDraftFinal?: boolean;
  };
  provider?: string | null;
  iconUrl?: string | null;
}
