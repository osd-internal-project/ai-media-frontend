export interface ITFromGenerate {
  type: "image" | "vdo";
  text: string;
  resolution: string;
  duration: string;
  image?: any;
  ratio: string;
  projectId?: string;
  userId?: string;
}

export type IOrganizationRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
export type IProjectRole = "ADMIN" | "USER" | "VIEWER";
