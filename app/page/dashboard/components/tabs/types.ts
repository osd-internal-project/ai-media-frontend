import {
  IDashboardCreditPerMonthAndType,
  IDashboardGeneratedPerMonthAndType,
  IGenerationSeriesPoint,
} from "@/app/common/dashbaord";
import type { GenerationLogScope } from "../logs/use-generation-logs";
import type { GenerationTypeKey } from "@/app/common/generation-type";
import type { IProject } from "@/app/common/project.type";
import type { DashboardFilters } from "../../hooks/use-dashboard-filters";

export type DashboardUserRow = {
  userId: string;
  fullname: string;
  username?: string;
  email?: string;
  role: string;
  /** Earliest project membership date, used for the "joined in range" figure. */
  joinedAt?: string;
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
  /** Progress bar colour, used to signal quota pressure on the Token Usage card. */
  progressColor?: string;
  /** Extra content below the progress bar, e.g. an upgrade CTA. */
  footer?: React.ReactNode;
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
  filters: DashboardFilters;
  onFiltersChange: (patch: Partial<DashboardFilters>) => void;
  projectOptions: Array<{ value: string; label: string }>;
  /** Types the trend chart should draw; an empty type filter resolves to all of them. */
  visibleTypes: GenerationTypeKey[];
  hasProjects: boolean;
  /** True when the *selected metric* has non-zero data to plot. */
  hasGenerations: boolean;
  /** Total generations in range, regardless of metric. Used to explain empty charts. */
  generationCount: number;
  generationSeries: IGenerationSeriesPoint[];
  /** Donut slices, summed from `generationSeries` so the two can never disagree. */
  generationByType: ByTypeItem[];
  organizationId: string | undefined;
  /** Same range / project scope as the cards, so the log total matches "Generations". */
  logScope: GenerationLogScope;
  onCreateProject?: () => void;
};

export type ByTypeItem = {
  name: string;
  value: number;
  color: string;
};
