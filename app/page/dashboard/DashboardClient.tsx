"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
} from "react";
import {
  Alert,
  Avatar,
  Button,
  Col,
  Drawer,
  Form,
  InputNumber,
  Layout,
  Modal,
  Progress,
  Result,
  Row,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import { useRouter } from "next/navigation";
import { axiosReport, axiosCore, axiosUser } from "@/app/lib/axios/axios";
import DashboardServices from "@/app/services/dashboard.service";
import type { IDashboardFilterParams } from "@/app/services/dashboard.service";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import type {
  IDashboardOverviewSummary,
  IGenerationSeriesPoint,
} from "@/app/common/dashbaord";
import {
  GENERATION_SERIES_KEYS,
  GENERATION_SERIES_LABEL,
  generationSeriesColors,
} from "@/app/common/generation-type";
import ProjectService from "@/app/services/project.service";
import type { IProject } from "@/app/common/project.type";
import { canSeeBilling, canViewDashboard } from "@/app/utils/permissions";
import { useOrganization } from "@/app/context/OrganizationContext";
import { CreditCard, FolderOpen, Sparkles, Ticket, Users } from "lucide-react";
import { formatCompactNumber, formatNumber } from "@/app/utils/format";
import type { ByTypeItem, DashboardUserRow, StatCardItem } from "./components/tabs/types";
import OverviewTab from "./components/tabs/overview/overview-tab";
import UsersTab from "./components/tabs/user/users-tab";
import ProjectsTab from "./components/tabs/project/project-tab";
import DashboardCustomTab from "./components/customtab";
import PageSubHeader from "@/app/components/layout/PageSubHeader";
import RedeemCouponModal from "./components/redeem-coupon-modal";
import GenerationLogsPanel from "./components/logs/generation-logs-panel";
import CouponService from "@/app/services/coupon.service";
import CreditBalanceServices from "@/app/services/credit-balance.service";
import { ICouponCodeUsage } from "@/app/common/coupon.type";
import {
  useDashboardFilters,
  type DashboardTabKey,
} from "./hooks/use-dashboard-filters";

/** Usage thresholds that drive the Token Usage bar colour and the upgrade CTA. */
const QUOTA_WARNING_PERCENT = 70;
const QUOTA_CRITICAL_PERCENT = 90;

type QuotaOverride = {
  limitCredit: number;
  limitImage: number;
};

const DashboardClient: FC = () => {
  const { data: session } = useSession();
  const { organizationRole } = useOrganization();
  const { token } = theme.useToken();
  const router = useRouter();
  const organizationId = session?.user?.organizationId;
  const showBilling = canSeeBilling(session?.user?.systemRole);
  const dashboardServices = useMemo(() => DashboardServices(axiosReport), []);
  const couponService = useMemo(() => CouponService(axiosUser), []);
  const creditBalanceServices = useMemo(
    () => CreditBalanceServices(axiosUser),
    [],
  );

  const projectServices = useMemo(() => ProjectService(axiosCore), []);

  // Filter state lives in the URL so a filtered view is shareable and survives a refresh.
  const { filters, setFilters, dateRange, visibleTypes } =
    useDashboardFilters();

  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [modal, contextHolder] = Modal.useModal();

  const [userSearch, setUserSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [quotaOpen, setQuotaOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DashboardUserRow | null>(
    null,
  );
  const [quotaCredit, setQuotaCredit] = useState<number>(0);
  const [quotaImage, setQuotaImage] = useState<number>(0);
  /** Project or user whose logs are open in the side drawer. */
  const [logsTarget, setLogsTarget] = useState<{
    kind: "project" | "user";
    id: string;
    name: string;
  } | null>(null);
  const [quotaOverrides, setQuotaOverrides] = useState<
    Record<string, QuotaOverride>
  >({});

  //Dashboard Overview Data
  const [overviewSummary, setOverviewSummary] =
    useState<IDashboardOverviewSummary>();
  const [generationSeries, setGenerationSeries] = useState<
    IGenerationSeriesPoint[]
  >([]);

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [redeemCouponForm] = Form.useForm();
  const [redeemCouponOpen, setRedeemCouponOpen] = useState(false);
  const [onTopCreditBalance, setOnTopCreditBalance] = useState<number>(0);
  const [couponCodeUsage, setCouponCodeUsage] = useState<{
    data: ICouponCodeUsage[];
    total: number;
  }>({ data: [], total: 0 });

  /**
   * Query parameters shared by the Overview requests.
   *
   * Passing one object to every endpoint (and the same range to the logs panel) is what keeps
   * the stat cards, the trend chart and the generation logs describing the same generations.
   */
  const queryParams = useMemo<IDashboardFilterParams>(
    () => ({
      from: dateRange.from,
      to: dateRange.to,
      projectId: filters.projectId ?? undefined,
      metric: filters.metric,
    }),
    [dateRange.from, dateRange.to, filters.projectId, filters.metric],
  );

  const logScope = useMemo(
    () => ({
      from: dateRange.from,
      to: dateRange.to,
      projectId: filters.projectId ?? undefined,
    }),
    [dateRange.from, dateRange.to, filters.projectId],
  );

  const fetchRedeemCoupon = useCallback(async () => {
    if (!organizationId) return;

    const creditBalance = await creditBalanceServices.findByOrganizationId(
      organizationId,
    );
    const usage = await couponService.findUsageManyByOrganizationId(
      organizationId,
    );
    setOnTopCreditBalance(creditBalance?.onTopBalance || 0);
    setCouponCodeUsage(usage || { data: [], total: 0 });
  }, [couponService, creditBalanceServices, organizationId]);

  useEffect(() => {
    if (!organizationId || !session?.user?.id) return;

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        // Projects come from the core service and are the source for the Projects/Users tab
        // badges AND the matching Overview stat cards, so the two cannot drift apart.
        const [resProjects, summary, series] = await Promise.all([
          projectServices.findByOrganizationId(
            organizationId,
            session.user.id,
            {},
          ),
          dashboardServices.findOverviewSummary(organizationId, queryParams),
          dashboardServices.findGenerationSeries(organizationId, queryParams),
        ]);

        if (cancelled) return;
        setProjects(resProjects || []);
        setOverviewSummary(summary);
        setGenerationSeries(series);
      } catch (error: unknown) {
        if (cancelled) return;
        // Surfaced instead of swallowed: a failing report service used to be
        // indistinguishable from an organization with no data, so every card read 0.
        console.error("Failed to load dashboard", error);
        setLoadError(
          "Could not load dashboard data. The reporting service may be unavailable.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    fetchRedeemCoupon();

    return () => {
      cancelled = true;
    };
  }, [
    dashboardServices,
    fetchRedeemCoupon,
    organizationId,
    projectServices,
    queryParams,
    session?.user?.id,
  ]);

  const userRows = useMemo<DashboardUserRow[]>(() => {
    const memberMap = new Map<string, DashboardUserRow>();
    projects.forEach((project) => {
      (project.members || []).forEach((member) => {
        const key = member.userId;
        const existing = memberMap.get(key);
        if (existing) {
          existing.limitCredit += Number(member.limitCreditAllowance || 0);
          existing.limitImage += Number(member.limitImageAllowance || 0);
          existing.usedCredit += Number(member.usedCreditAllowance || 0);
          existing.usedImage += Number(member.usedImageAllowance || 0);
          // Keep the earliest membership so "joined in range" is not double counted.
          if (member.joinedAt && member.joinedAt < (existing.joinedAt ?? "")) {
            existing.joinedAt = member.joinedAt;
          }
          return;
        }
        memberMap.set(key, {
          userId: key,
          fullname: member.users?.fullname || "Unknown",
          username: member.users?.username,
          email: member.users?.email,
          role: member.role || "USER",
          joinedAt: member.joinedAt,
          usedCredit: Number(member.usedCreditAllowance || 0),
          usedImage: Number(member.usedImageAllowance || 0),
          limitCredit: Number(member.limitCreditAllowance || 0),
          limitImage: Number(member.limitImageAllowance || 0),
        });
      });
    });

    return Array.from(memberMap.values()).map((member) => {
      const override = quotaOverrides[member.userId];
      const defaultLimitCredit = Math.max(
        member.limitCredit,
        Math.ceil(member.usedCredit * 1.2) || 1,
      );
      const defaultLimitImage = Math.max(
        member.limitImage,
        Math.ceil(member.usedImage * 1.2) || 1,
      );

      return {
        ...member,
        limitCredit: override?.limitCredit ?? defaultLimitCredit,
        limitImage: override?.limitImage ?? defaultLimitImage,
      };
    });
  }, [projects, quotaOverrides]);

  const filteredUsers = useMemo(
    () =>
      userRows.filter((user) => {
        const query = userSearch.toLowerCase();
        return (
          user.fullname.toLowerCase().includes(query) ||
          (user.username || "").toLowerCase().includes(query) ||
          (user.email || "").toLowerCase().includes(query)
        );
      }),
    [userRows, userSearch],
  );

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) =>
        project.name.toLowerCase().includes(projectSearch.toLowerCase()),
      ),
    [projectSearch, projects],
  );

  const projectOptions = useMemo(
    () => projects.map((project) => ({ value: project.id, label: project.name })),
    [projects],
  );

  /**
   * Counts how many of the given ISO timestamps fall inside the selected range.
   *
   * Backs the "+N in range" line on the Total Projects / Total Users cards, replacing the
   * hardcoded "+2 this month" / "+5 this month" placeholders.
   */
  const countInRange = useCallback(
    (timestamps: Array<string | undefined>) => {
      const from = dayjs(dateRange.from);
      const to = dayjs(dateRange.to);
      return timestamps.filter((value) => {
        if (!value) return false;
        const parsed = dayjs(value);
        return (
          parsed.isValid() &&
          !parsed.isBefore(from) &&
          !parsed.isAfter(to)
        );
      }).length;
    },
    [dateRange.from, dateRange.to],
  );

  /**
   * Donut slices, summed from the trend series rather than fetched separately.
   *
   * Deriving them guarantees the donut and the chart always describe the same generations —
   * previously the donut read only the current calendar month and silently rendered empty
   * whenever that month was absent from the response.
   */
  const generationByType = useMemo<ByTypeItem[]>(() => {
    const colors = generationSeriesColors(token);
    return GENERATION_SERIES_KEYS.map((key) => ({
      name: GENERATION_SERIES_LABEL[key],
      value: generationSeries.reduce(
        (sum, point) => sum + Number(point[key] || 0),
        0,
      ),
      color: colors[key],
    })).filter((item) => item.value > 0);
  }, [generationSeries, token]);

  const hasGenerations = generationByType.length > 0;

  /**
   * Opens the per-user quota modal.
   *
   * Note: the resulting override is held in component state only and is never persisted —
   * see the summary for the missing API.
   */
  const openQuotaModal = (user: DashboardUserRow) => {
    setSelectedUser(user);
    setQuotaCredit(user.limitCredit);
    setQuotaImage(user.limitImage);
    setQuotaOpen(true);
  };

  const saveQuota = () => {
    if (!selectedUser) return;
    setQuotaOverrides((prev) => ({
      ...prev,
      [selectedUser.userId]: {
        limitCredit: quotaCredit,
        limitImage: quotaImage,
      },
    }));
    setQuotaOpen(false);
  };

  const userColumns = [
    {
      title: "User",
      key: "user",
      render: (_: unknown, record: DashboardUserRow) => (
        <Space>
          <Avatar style={{ backgroundColor: token.colorPrimaryBg }}>
            {record.fullname
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </Avatar>
          <div>
            <Typography.Text>{record.fullname}</Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {record.email || record.username || "-"}
            </Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <Tag>{role}</Tag>,
    },
    {
      title: " Credit",
      key: "credit",
      render: (_: unknown, record: DashboardUserRow) => {
        const pct = (record.usedCredit / Math.max(record.limitCredit, 1)) * 100;
        return (
          <div className="min-w-[180px]">
            <div className="flex justify-between text-xs mb-1">
              <span>{formatNumber(record.usedCredit)}</span>
              <span>{formatNumber(record.limitCredit)}</span>
            </div>
            <Progress
              percent={Math.min(pct, 100)}
              showInfo={false}
              strokeColor={pct >= 80 ? token.colorWarning : token.colorPrimary}
            />
          </div>
        );
      },
    },
    // {
    //   title: "Image",
    //   key: "image",
    //   render: (_: unknown, record: DashboardUserRow) => {
    //     const pct = (record.usedImage / Math.max(record.limitImage, 1)) * 100;
    //     return (
    //       <div className="min-w-[180px]">
    //         <div className="flex justify-between text-xs mb-1">
    //           <span>{formatNumber(record.usedImage)}</span>
    //           <span>{formatNumber(record.limitImage)}</span>
    //         </div>
    //         <Progress
    //           percent={Math.min(pct, 100)}
    //           showInfo={false}
    //           strokeColor={pct >= 80 ? token.colorWarning : token.colorSuccess}
    //         />
    //       </div>
    //     );
    //   },
    // },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, record: DashboardUserRow) => {
        const pct = Math.max(
          (record.usedCredit / Math.max(record.limitCredit, 1)) * 100,
          (record.usedImage / Math.max(record.limitImage, 1)) * 100,
        );
        return pct >= 70 ? (
          <Tag color="warning">Warning</Tag>
        ) : (
          <Tag color="success">Healthy</Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: DashboardUserRow) => (
        <Button
          size="small"
          onClick={() =>
            setLogsTarget({ kind: "user", id: record.userId, name: record.fullname })
          }
        >
          View logs
        </Button>
      ),
    },
  ];

  const projectColumns = [
    {
      title: "Project",
      key: "project",
      render: (_: unknown, record: IProject) => (
        <div>
          <Typography.Text>{record.name}</Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.description || "-"}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: "Members",
      dataIndex: "members",
      key: "members",
      render: (members: IProject["members"]) => members?.length || 0,
    },
    // {
    //   title: "Image Usage",
    //   key: "image",
    //   render: (_: unknown, record: IProject) => {
    //     const used = Number(record.usedImageAllowance || 0);
    //     const limit = Number(record.limitImageAllowance || 0);
    //     const pct = (used / Math.max(limit, 1)) * 100;
    //     return (
    //       <div className="min-w-[160px]">
    //         <div className="flex justify-between text-xs mb-1">
    //           <span>{formatNumber(used)}</span>
    //           <span>{formatNumber(limit)}</span>
    //         </div>
    //         <Progress percent={Math.min(pct, 100)} showInfo={false} />
    //       </div>
    //     );
    //   },
    // },
    {
      title: "Credit Usage",
      key: "credit",
      render: (_: unknown, record: IProject) => {
        const used = Number(record.usedCreditAllowance || 0);
        const limit = Number(record.limitCreditAllowance || 0);
        const pct = (used / Math.max(limit, 1)) * 100;
        return (
          <div className="min-w-[160px]">
            <div className="flex justify-between text-xs mb-1">
              <span>{formatNumber(used)}</span>
              <span>{formatNumber(limit)}</span>
            </div>
            <Progress
              percent={Math.min(pct, 100)}
              showInfo={false}
              strokeColor={token.colorInfo}
            />
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) =>
        (status || "").toLowerCase() === "active" ? (
          <Tag color="success">Active</Tag>
        ) : (
          <Tag>Inactive</Tag>
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: IProject) => (
        <Button
          size="small"
          onClick={() =>
            setLogsTarget({ kind: "project", id: record.id, name: record.name })
          }
        >
          View logs
        </Button>
      ),
    },
  ];

  const activeProjectCount = useMemo(
    () =>
      filteredProjects.filter(
        (project) => (project.status || "").toLowerCase() === "active",
      ).length,
    [filteredProjects],
  );

  const adminCount = useMemo(
    () =>
      filteredUsers.filter((user) =>
        ["OWNER", "ADMIN"].includes((user.role || "").toUpperCase()),
      ).length,
    [filteredUsers],
  );

  const quotaTotal = overviewSummary?.quotaTotal ?? 0;
  const quotaUsed = overviewSummary?.quotaUsed ?? 0;
  const quotaPercent = overviewSummary?.usedCreditPercent ?? 0;
  const quotaColor =
    quotaPercent > QUOTA_CRITICAL_PERCENT
      ? token.colorError
      : quotaPercent >= QUOTA_WARNING_PERCENT
        ? token.colorWarning
        : token.colorSuccess;

  const statCards: StatCardItem[] = [
    {
      label: "Total Projects",
      // Same array the Projects tab badge counts, so the two can never disagree.
      value: filteredProjects.length,
      sub: `${activeProjectCount} active`,
      icon: <FolderOpen size={16} color={token.colorPrimary} />,
      iconBg: token.colorPrimaryBg,
      iconColor: token.colorPrimary,
      trend: `+${countInRange(filteredProjects.map((project) => project.createdAt))} in range`,
    },
    {
      label: "Total Users",
      // Same array the Users tab badge counts.
      value: filteredUsers.length,
      sub: `${adminCount} admins`,
      icon: <Users size={16} color={token.colorInfo} />,
      iconBg: token.colorInfoBg,
      iconColor: token.colorInfo,
      trend: `+${countInRange(filteredUsers.map((user) => user.joinedAt))} in range`,
    },
    {
      label: "Generations",
      value: formatCompactNumber(overviewSummary?.generationCount ?? 0),
      sub: `${formatCompactNumber(overviewSummary?.rangeUsedCredit ?? 0)} credits used in range`,
      icon: <Sparkles size={16} color={token.colorSuccess} />,
      iconBg: token.colorSuccessBg,
      iconColor: token.colorSuccess,
    },
    {
      label: "Credit Usage",
      value: `${formatCompactNumber(quotaUsed)} / ${formatCompactNumber(quotaTotal)}`,
      sub:
        quotaTotal > 0
          ? `${formatNumber(overviewSummary?.quotaRemaining ?? 0)} left this cycle`
          : "No active package",
      icon: <CreditCard size={16} color={token.colorWarning} />,
      iconBg: token.colorWarningBg,
      iconColor: token.colorWarning,
      progress: quotaPercent,
      progressColor: quotaColor,
      footer:
        showBilling && quotaPercent >= QUOTA_CRITICAL_PERCENT ? (
          <div className="mt-2">
            <Button
              size="small"
              type="primary"
              danger
              onClick={() => router.push("/page/organization/purchase")}
            >
              Upgrade plan
            </Button>
          </div>
        ) : undefined,
    },
  ];

  // Check if user has permission to view dashboard
  if (!canViewDashboard(organizationRole || session?.user?.systemRole || "")) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Result
          status="403"
          title="Access Denied"
          subTitle="You don't have permission to view the dashboard. Only organization owners can access this page."
        />
      </div>
    );
  }
  const showRedeemCouponModal = async () => {
    await fetchRedeemCoupon();
    setRedeemCouponOpen(true);
  };

  const handleRedeemCouponSubmit = async (values: { couponCode: string }) => {
    const organizationId = session?.user?.organizationId;
    const userId = session?.user?.userId;

    if (!organizationId || !userId) {
      modal.error({
        title: "Error",
        content: "Session expired or missing organization information",
      });
      return;
    }

    setConfirmLoading(true);
    try {
      await couponService.useCoupon({
        code: values.couponCode.trim(),
        organizationId,
        userId,
      });

      modal.success({
        title: "Success",
        content: "Coupon applied successfully!",
      });
      await fetchRedeemCoupon();

      redeemCouponForm.resetFields();
      setRedeemCouponOpen(false);
      window.location.reload();
    } catch (error: any) {
      const errorMessage = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message.join(", ")
        : error?.response?.data?.message || "Failed to apply coupon";

      modal.error({
        title: "Error",
        content: errorMessage,
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleRedeemCouponOk = () => {
    redeemCouponForm.submit();
  };

  const handleRedeemCouponCancel = () => {
    redeemCouponForm.resetFields();
    setRedeemCouponOpen(false);
  };
  return (
    <Layout style={{ width: "100%", background: "transparent" }}>
      <Layout.Header
        style={{
          width: "100%",
          height: "auto",
          lineHeight: "normal",
          padding: 0,
        }}
      >
        {contextHolder}
        <PageSubHeader
          title="Organization Dashboard"
          subtitle="Monitor usage and manage resources across all projects"
          background={token.colorBgContainer}
          borderColor={token.colorBorder}
          titleColor={token.colorTextBase}
          subtitleColor={token.colorTextSecondary}
          chipBg={token.colorBgTextActive}
          chipText={token.colorTextSecondary}
          rightSlot={
            showBilling ? (
              <Button
                type="primary"
                onClick={showRedeemCouponModal}
                icon={<Ticket size={14} />}
              >
                Redeem Coupon
              </Button>
            ) : undefined
          }
          compact
        />
      </Layout.Header>

      <Layout.Content className="p-3 md:p-6">
        {loadError && (
          <Alert
            className="mb-4"
            type="error"
            showIcon
            message="Dashboard data unavailable"
            description={loadError}
            action={
              <Button size="small" onClick={() => window.location.reload()}>
                Retry
              </Button>
            }
          />
        )}

        <DashboardCustomTab
          value={filters.tab}
          onChange={(value) => setFilters({ tab: value as DashboardTabKey })}
          usersTotal={filteredUsers.length}
          projectsTotal={filteredProjects.length}
          approvalsTotal={0}
        />

        <div className="mt-4">
          {filters.tab === "overview" && (
            <OverviewTab
              loading={loading}
              statCards={statCards}
              filters={filters}
              onFiltersChange={setFilters}
              projectOptions={projectOptions}
              visibleTypes={visibleTypes}
              hasProjects={projects.length > 0}
              hasGenerations={hasGenerations}
              generationCount={overviewSummary?.generationCount ?? 0}
              generationSeries={generationSeries}
              generationByType={generationByType}
              organizationId={organizationId ?? undefined}
              logScope={logScope}
              onCreateProject={() => router.push("/page/project")}
            />
          )}
          {filters.tab === "users" && (
            <UsersTab
              loading={loading}
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              userColumns={userColumns}
              filteredUsers={filteredUsers}
            />
          )}
          {filters.tab === "projects" && (
            <ProjectsTab
              loading={loading}
              projectSearch={projectSearch}
              setProjectSearch={setProjectSearch}
              projectColumns={projectColumns}
              filteredProjects={filteredProjects}
            />
          )}
        </div>
      </Layout.Content>

      <Modal
        open={quotaOpen}
        onCancel={() => setQuotaOpen(false)}
        onOk={saveQuota}
        okText="Save"
        title={
          selectedUser
            ? `Manage Quota - ${selectedUser.fullname}`
            : "Manage Quota"
        }
      >
        {selectedUser && (
          <Space direction="vertical" style={{ width: "100%" }} size={12}>
            <div>
              <Typography.Text type="secondary">
                Current Video Credit Usage
              </Typography.Text>
              <Progress
                percent={Math.min(
                  (selectedUser.usedCredit / Math.max(quotaCredit, 1)) * 100,
                  100,
                )}
                strokeColor={token.colorWarning}
              />
            </div>
            <div>
              <Typography.Text type="secondary">
                Current Image Usage
              </Typography.Text>
              <Progress
                percent={Math.min(
                  (selectedUser.usedImage / Math.max(quotaImage, 1)) * 100,
                  100,
                )}
                strokeColor={token.colorPrimary}
              />
            </div>

            <Row gutter={12}>
              <Col span={12}>
                <Typography.Text>Video Credit Limit</Typography.Text>
                <InputNumber
                  min={1}
                  value={quotaCredit}
                  onChange={(value) => setQuotaCredit(Number(value || 1))}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col span={12}>
                <Typography.Text>Image Limit</Typography.Text>
                <InputNumber
                  min={1}
                  value={quotaImage}
                  onChange={(value) => setQuotaImage(Number(value || 1))}
                  style={{ width: "100%" }}
                />
              </Col>
            </Row>

            <Space wrap>
              <Button
                size="small"
                onClick={() => setQuotaCredit((prev) => prev + 500)}
              >
                +500 Credit
              </Button>
              <Button
                size="small"
                onClick={() => setQuotaImage((prev) => prev + 50)}
              >
                +50 Image
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setQuotaCredit((prev) => prev * 2);
                  setQuotaImage((prev) => prev * 2);
                }}
              >
                Double All
              </Button>
            </Space>
          </Space>
        )}
      </Modal>
      <Drawer
        open={Boolean(logsTarget)}
        onClose={() => setLogsTarget(null)}
        width="min(880px, 100vw)"
        destroyOnClose
        title={
          logsTarget ? (
            <div>
              <div>{logsTarget.name}</div>
              <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                Generation logs · {dayjs(dateRange.from).format("D MMM YYYY")} –{" "}
                {dayjs(dateRange.to).format("D MMM YYYY")}
              </Typography.Text>
            </div>
          ) : null
        }
      >
        {logsTarget && (
          <GenerationLogsPanel
            bare
            organizationId={organizationId ?? undefined}
            scope={{
              from: dateRange.from,
              to: dateRange.to,
              ...(logsTarget.kind === "project"
                ? { projectId: logsTarget.id }
                : { userId: logsTarget.id }),
            }}
            hideProject={logsTarget.kind === "project"}
            hideUser={logsTarget.kind === "user"}
          />
        )}
      </Drawer>
      <RedeemCouponModal
        onTopCreditBalance={onTopCreditBalance}
        couponCodeUsage={couponCodeUsage}
        
        open={redeemCouponOpen}
        form={redeemCouponForm}
        handleOk={handleRedeemCouponOk}
        handleFinish={handleRedeemCouponSubmit}
        confirmLoading={confirmLoading}
        handleCancel={handleRedeemCouponCancel}
      />
    </Layout>
  );
};
export default DashboardClient;
