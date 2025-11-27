export type LogHistory = {
  id: string;
  taskId?: string;
  status: "success" | "failed" | "pending"; // adjust if needed
  typeGenerate: "image" | "vdo";
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
  typeGenerate: "image" | "vdo";
  prompt: string;
  status: "success" | "pending";
  ImageUsed: number;
  tokenUsed: number;
  createdAt: string;
}
