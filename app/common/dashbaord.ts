import { ICreditBalance, IOrganizationSubscription } from "./organization.type";
import type { GenerationTypeKey } from "./generation-type";

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
//NEW
export interface IDashboardOverviewSummary {
  totalProject: number;
  totalActiveProject: number;
  totalMember: number;
  adminMember: number;
  /** All-time totals, kept for backwards compatibility. */
  usedImage: number;
  usedCredit: number;
  monthlyusedImage: number;
  monthlyusedCredit: number;
  /** Number of successful generations inside the selected filter range. */
  generationCount: number;
  rangeUsedImage: number;
  rangeUsedCredit: number;
  rangeFrom: string;
  rangeTo: string;
  creditAllowance: number;
  currentCycleBalance: number;
  onTopBalance: number;
  /** Cycle allowance plus purchased/coupon top-up — the denominator of the quota bar. */
  quotaTotal: number;
  quotaRemaining: number;
  quotaUsed: number;
  usedCreditPercent: number;
}

/** One bucket of the generation trend series, keyed by canonical generation type. */
export interface IGenerationSeriesPoint {
  /** `YYYY-MM-DD` for day granularity, `YYYY-MM` for month granularity. */
  bucket: string;
  image: number;
  video: number;
  omnihuman: number;
  dreamactor: number;
  audio: number;
}

/** A single generation as shown in the Recent Generations panel. */
export interface IRecentGeneration {
  id: string;
  taskId: string | null;
  /** Canonical generation type key, or null for legacy rows with an unknown type. */
  type: GenerationTypeKey | null;
  prompt: string;
  usedCredit: number;
  usedImage: number;
  createdAt: string;
  projectId: string | null;
  projectName: string | null;
  userId: string | null;
  userFullname: string | null;
}

export interface IDashboardCreditPerMonthAndType {
  month: string;
  image: number;
  video: number;
  omnihuman: number;
  dreamactor: number;
}
export interface IDashboardGeneratedPerMonthAndType {
  month: string;
  image: number;
  video: number;
  omnihuman: number;
  dreamactor: number;
}