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
export type TPromptGuide = {
  id?: number;
  title?: string;
  textPrompt?: string;
  type?: string;
  typeName?: string;
  status: boolean;
  organizationId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};
export type TPromptGuideType = {
  id: number;
  title: string;
  status: boolean;
  organizationId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  promptGuide?: TPromptGuide[];
};
