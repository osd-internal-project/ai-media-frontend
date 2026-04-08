import {
  IDashboardCreditPerMonthAndType,
  IDashboardGeneratedPerMonthAndType,
} from "@/app/common/dashbaord";
import type { IProject } from "@/app/common/project.type";

export type DashboardUserRow = {
  userId: string;
  fullname: string;
  username?: string;
  email?: string;
  role: string;
  usedCredit: number;
  usedImage: number;
  limitCredit: number;
  limitImage: number;
};

export type PendingApproval = DashboardUserRow & {
  requestRatio: number;
  projectName?: string;
  projectDescription?: string;
};

export type StatCardItem = {
  label: string;
  value: string | number;
  sub: string;
  trend?: string;
  progress?: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
};

export type UsersTabProps = {
  loading: boolean;
  userSearch: string;
  setUserSearch: (value: string) => void;
  userColumns: any[];
  filteredUsers: DashboardUserRow[];
};

export type ProjectsTabProps = {
  loading: boolean;
  projectSearch: string;
  setProjectSearch: (value: string) => void;
  projectColumns: any[];
  filteredProjects: IProject[];
};

export type AnalyticsTabProps = {
  loading: boolean;
  userRows: DashboardUserRow[];
  summaryByProject: any[];
  projects: IProject[];
  token: any;
  formatNumber: (value: string | number | undefined) => React.ReactNode;
  generatedByType: IDashboardGeneratedPerMonthAndType | undefined;
  generatedPerMonth: IDashboardGeneratedPerMonthAndType[];
};

export type ApprovalsTabProps = {
  loading: boolean;
  pendingApprovals: PendingApproval[];
  openQuotaModal: (user: DashboardUserRow) => void;
  onApprove: (user: PendingApproval) => void;
  onDeny: (user: PendingApproval) => void;
  onApproveAll: () => void;
  onDenyAll: () => void;
};

export type OverviewTabProps = {
  loading: boolean;
  statCards: StatCardItem[];
  alertUsers: DashboardUserRow[];
  pendingApprovals: PendingApproval[];
  openQuotaModal: (user: DashboardUserRow) => void;
  onApprove: (user: PendingApproval) => void;
  onDeny: (user: PendingApproval) => void;
  setActiveTab: (tab: string) => void;
  usedCreditPerMonth: IDashboardCreditPerMonthAndType[];
  usedCreditByType: ByTypeItem[];
};

export type ByTypeItem = {
  name: string;
  value: number;
  color: string;
};
