import { IOrganization } from "./organization.type";

export interface IOrganizationMember {
  id: number;
  userId: string;
  organizationId: string;
  role: string;
  joinedAt: string;
  organization?: IOrganization;
  maxToken?: number;
  maxImages?: number;
  apiKeys?: string;
}

/** หนึ่งแถวที่ส่งให้ backend ตอน bulk import (ว่าง = ไม่ระบุ) */
export interface IBulkMemberRow {
  username?: string;
  email?: string;
  fullname?: string;
  password?: string;
  phoneNumber?: string;
  role?: string;
  projectId?: string;
  projectName?: string;
  projectRole?: string;
  credit?: number;
}

export type BulkRowStatus = "NEW_USER" | "EXISTING_USER" | "ERROR";

export interface IBulkRowResult {
  rowIndex: number;
  status: BulkRowStatus;
  errors: string[];
}

export interface IBulkNewProject {
  name: string;
  limitCreditAllowance: number;
}

export interface IBulkValidationResult {
  valid: boolean;
  errors: string[];
  seat: { current: number; adding: number; max: number | null };
  credit: { orgRemaining: number; newProjects: IBulkNewProject[] };
  rows: IBulkRowResult[];
}

export interface IBulkChunkResult {
  results: IBulkRowResult[];
  createdProjects: { name: string; id: string }[];
}

export interface IBulkProjectOption {
  id: string;
  name: string;
  limitCreditAllowance: number;
  assignedCredit: number;
}

export interface IBulkProjectList {
  creditRemaining: number;
  projects: IBulkProjectOption[];
}
