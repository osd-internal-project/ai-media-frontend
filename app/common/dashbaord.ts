export type LogHistory = {
  id: string;
  taskId?: string;
  status: "success" | "failed" | "pending"; // adjust if needed
  typeGenerate: "image" | "video";
  projectId?: string;
  userId: string;
  prompt: string;
  tokenUsed: number;
  ImageUsed: number;
  createdAt: string;
};

export interface ITDashboard {
  quota: number | null;
  summaryUsed: number;
  sumPriceTokenUsedDateNow: number;
  sumPriceTokenUsedDateLast: number;
  // logsHistory: LogHistory[];
}

export type ProductSummary = {
  type: string;
  totalImageUsed: number;
  totalTokenUsed: number;
  unitPrice: number;
};

export type ITDashboardOwner = {
  owner: string;
  products: ProductSummary[];
};

export interface LogsData {
  id: string;
  userId: string;
  projectId: string;
  taskId: string;
  typeGenerate: "image" | "video";
  prompt: string;
  status: "success" | "pending";
  ImageUsed: number;
  tokenUsed: number;
  usedCredit: number;
  usedImage: number;
  createdAt: string;
}
export interface IDashboardProject {
  id: string;
  name: string;
  logs: IDashboardProjectLogs[];
  members: IDashboardUser[];
}
export interface IDashboardUser {
  userId: string;
  users: {
    userId: string;
    fullname: string;
  };
  project: {
    logs: IDashboardProjectLogs[];
  };
}
export interface IDashboardProjectLogs {
  usedCredit: number;
  usedImage: number;
  typeGenerate: "image" | "video";
}
export interface IDashboardUser {
  userId: string;
  users: {
    userId: string;
    fullname: string;
  };
  project: {
    logs: IDashboardProjectLogs[];
  };
}
export interface IDashboardTableUser {
  userId: string;
  fullname: string;
  role: string;
  usedCredit: number;
  usedImage: number;
}
export interface IDashboardOrganizationSummary {
  id: string;
  name: string;
  packageImageAmount: number;
  packageTokenAmount: number;
  usedImage: number;
  usedCredit: number;
  remainImageAmount: number;
  remainTokenAmount: number;
}
