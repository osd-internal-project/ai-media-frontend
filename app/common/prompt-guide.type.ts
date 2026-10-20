export type TPromptType = {
  id?: number;
  title?: string;
  textPrompt?: string;
  type?: string;
  typeName?: string;
  status: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};
export type TPromptGuideTemplate = TPromptType & {
  promptGuides?: TPromptGuide[];
};
export type TPromptGuideMedia = {
  imagePath: string;
  uid: string;
  name: string;
  url: string;
  status: string;
  index: number;
};
export type TPromptGuide = {
  id?: number;
  title?: string;
  textPrompt?: string;
  description?: string;
  type?: string;
  typeName?: string;
  status: boolean;
  organizationId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  generateType: TGenerateType;
  promptGuideImages?: string[];
  /** uid ของผลลัพธ์ตัวอย่าง — แสดงเป็น showcase ไม่ถูกแนบตอน Use Template */
  promptGuideResults?: string[];
  images?: TPromptGuideMedia[];
  results?: TPromptGuideMedia[];
  model?:string
  promptGuideType?: TPromptType;
};
export type TPromptGuideType = {
  id: number;
  title: string;
  status: boolean;
  organizationId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  promptGuide?: TPromptGuide[];
  generateType: TGenerateType;
};
export type TGenerateType = "image" | "video" | "omnihumen" | "dreamactor";

export type TPromptGuideImage = {
  id?: number;
  uid?: string;
  userId?: string;
  index?: number;
  imageName?: string;
  imagePath?: string;
  imageType?: string;
  imageSize?: number;
  generateType?: TGenerateType;
  status?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  promptGuideId?: number;
  model?:string
};
