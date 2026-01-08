export interface ITFromGenerate {
  type: "image" | "vdo";
  text: string;
  resolution: string;
  generateAudio: boolean;
  duration: string;
  image?: any;
  ratio: string;
  projectId?: string;
  userId?: string;
  modelName?: string;
  images?: any;
}

export type IOrganizationRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
export type IProjectRole = "ADMIN" | "USER" | "VIEWER";
