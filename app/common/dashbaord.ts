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
  /** NULL / unrecognised `type_generate` rows. */
  other: number;
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
/** One row of the paginated generation-logs endpoint. */
export interface IGenerationLog extends IRecentGeneration {
  status: string | null;
  galleryId: string | null;
  resolution: string | null;
  ratio: string | null;
}

export interface IGenerationLogPage {
  data: IGenerationLog[];
  total: number;
  page: number;
  pageSize: number;
}

/** Status filter for generation logs; `all` disables it. Server default is `success`. */
export type GenerationLogStatus = "success" | "pending" | "failed" | "all";

/** One generation with presigned media (core `GET /logs/detail/:logId`). */
export interface IGenerationLogDetail {
  id: string;
  taskId: string | null;
  /** Raw stored literal; use `type` for display. */
  typeGenerate: string | null;
  /** Canonical key, or null for NULL / unrecognised types. */
  type: GenerationTypeKey | null;
  status: string | null;
  prompt: string;
  usedCredit: number;
  usedImage: number;
  resolution: string | null;
  ratio: string | null;
  generateAudio: boolean | null;
  generateConfig: unknown;
  createdAt: string;
  projectId: string;
  projectName: string | null;
  userId: string;
  userFullname: string | null;
  galleryId: string | null;
  genneratedStatus: string | null;
  resultUrl: string[];
  thumbnailUrl: string | null;
  referenceImages: string[];
}
