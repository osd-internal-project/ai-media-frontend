"use client";
import React, { useEffect, useMemo, useState, type FC } from "react";
import { useForm } from "antd/es/form/Form";
import {
  Avatar,
  Badge,
  Button,
  Col,
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
import { axiosReport, axiosCore } from "@/app/lib/axios/axios";
import DashboardServices from "@/app/services/dashboard.service";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import type {
  IDashboardCreditPerMonthAndType,
  IDashboardGeneratedPerMonthAndType,
  IDashboardOrganizationSummary,
  IDashboardOverviewSummary,
  IDashboardProject,
  IDashboardTableUser,
} from "@/app/common/dashbaord";
import ProjectService from "@/app/services/project.service";
import type { IProject } from "@/app/common/project.type";
import { canViewDashboard } from "@/app/utils/permissions";
import { useOrganization } from "@/app/context/OrganizationContext";
import {
  AlertTriangle,
  CreditCard,
  FolderOpen,
  Sparkles,
  Users,
} from "lucide-react";
import { formatCompactNumber, formatNumber } from "@/app/utils/format";
import type {
  ByTypeItem,
  DashboardUserRow,
  PendingApproval,
} from "./components/tabs/types";
import OverviewTab from "./components/tabs/overview/overview-tab";
import UsersTab from "./components/tabs/user/users-tab";
import ProjectsTab from "./components/tabs/project/project-tab";
import AnalyticsTab from "./components/tabs/analytic/analytic-tab";
import ApprovalsTab from "./components/tabs/approval/approval-tab";
import { mockPendingApprovals } from "./components/tabs/approval/static";
import DashboardCustomTab from "./components/customtab";
import PageSubHeader from "@/app/components/layout/PageSubHeader";

type QuotaOverride = {
  limitCredit: number;
  limitImage: number;
};

const DashboardPage: FC = () => {
  const { data: session } = useSession();
  const { organizationRole } = useOrganization();
  const { token } = theme.useToken();
  const organizationId = session?.user?.organizationId;
  const dashboardServices = useMemo(() => DashboardServices(axiosReport), []);
  const projectServices = useMemo(() => ProjectService(axiosCore), []);
  const [loading, setLoading] = useState<boolean>(true);

  const [summaryByProject, setSummaryByProject] = useState<IDashboardProject[]>(
    [],
  );
  const [summaryByUser, setSummaryByUser] = useState<IDashboardTableUser[]>([]);
  const [organization, setOrganization] =
    useState<IDashboardOrganizationSummary>();
  const [projects, setProjects] = useState<IProject[]>([]);
  // const [projectOptions, setProjectOptions] = useState<
  //   { value: string; label: string }[]
  // >([]);
  const [params, setParams] = useState<{
    projectId: string;
    createdAt: Date | string;
  }>({ projectId: "", createdAt: dayjs().format("YYYY-MM") });
  const [activeTab, setActiveTab] = useState("overview");
  const [userSearch, setUserSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [quotaOpen, setQuotaOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DashboardUserRow | null>(
    null,
  );
  const [quotaCredit, setQuotaCredit] = useState<number>(0);
  const [quotaImage, setQuotaImage] = useState<number>(0);
  const [quotaOverrides, setQuotaOverrides] = useState<
    Record<string, QuotaOverride>
  >({});
  const [approvalDecisions, setApprovalDecisions] = useState<
    Record<string, "approved" | "denied">
  >({});

  //Dashboard Overview Data
  const [overviewSummary, setOverviewSummary] =
    useState<IDashboardOverviewSummary>();
  const [usedCreditPerMonth, setUsedCreditPerMonth] = useState<
    IDashboardCreditPerMonthAndType[]
  >([]);
  const [usedCreditByType, setUsedCreditByType] = useState<ByTypeItem[]>([]);

  //Dashboard Analytics Data
  const [generatedPerMonth, setGeneratedPerMonth] = useState<
    IDashboardGeneratedPerMonthAndType[]
  >([]);
  const [generatedByType, setGeneratedCreditByType] =
    useState<IDashboardGeneratedPerMonthAndType>();

  useEffect(() => {
    if (!organizationId || !session?.user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const resProjects = await projectServices.findByOrganizationId(
          organizationId,
          session.user.id,
          {},
        );
        setProjects(resProjects || []);
        await fetchOverview();
        await fetchAnalytics();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    dashboardServices,
    organizationId,
    params,
    projectServices,
    session?.user?.id,
  ]);

  const fetchOverview = async () => {
    if (!organizationId || !session?.user?.id) return;

    const overviewSummary = await dashboardServices.findOverviewSummary(
      organizationId,
      params,
    );
    setOverviewSummary(overviewSummary);

    const creditPerMonthAndType =
      (await dashboardServices.countUsedCreditPerMonth(
        organizationId,
        params,
      )) || [];
    setUsedCreditPerMonth(creditPerMonthAndType);
    const monthly = dayjs().format("YYYY-MM");
    const creditThisMonth = creditPerMonthAndType.find(
      (data) => data.month === monthly,
    );
    if (creditThisMonth) {
      const result = Object.entries(creditThisMonth)
        .map(([key, val]) => ({
          name: key,
          value: val,
        }))
        .filter((data) => data.name !== "month")
        .map((item, index) => ({
          ...item,
          color:
            item.name === "image"
              ? token.colorPrimary
              : item.name === "video"
                ? token.colorInfo
                : item.name === "omnihuman"
                  ? token.colorWarning
                  : item.name === "dreamactor"
                    ? token.colorError
                    : token.colorError,
        }));
      setUsedCreditByType(result);
    }
  };

  const fetchAnalytics = async () => {
    if (!organizationId || !session?.user?.id) return;

    const creditPerMonthAndType =
      (await dashboardServices.countGeneratedPerMonth(
        organizationId,
        params,
      )) || [];
    setGeneratedPerMonth(creditPerMonthAndType);
    const monthly = dayjs().format("YYYY-MM");
    const generatedThisMonth = creditPerMonthAndType.find(
      (data) => data.month === monthly,
    );
    if (generatedThisMonth) {
      setGeneratedCreditByType(generatedThisMonth);
    }
  };
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
          return;
        }
        memberMap.set(key, {
          userId: key,
          fullname: member.users?.fullname || "Unknown",
          username: member.users?.username,
          email: member.users?.email,
          role: member.role || "USER",
          usedCredit: Number(member.usedCreditAllowance || 0),
          usedImage: Number(member.usedImageAllowance || 0),
          limitCredit: Number(member.limitCreditAllowance || 0),
          limitImage: Number(member.limitImageAllowance || 0),
        });
      });
    });

    const summaryMap = new Map(
      summaryByUser.map((item) => [item.userId, item]),
    );
    const allIds = new Set<string>([
      ...Array.from(memberMap.keys()),
      ...summaryByUser.map((item) => item.userId),
    ]);

    return Array.from(allIds).map((userId) => {
      const summary = summaryMap.get(userId);
      const member = memberMap.get(userId);
      const override = quotaOverrides[userId];
      const usedCredit = Number(summary?.usedCredit ?? member?.usedCredit ?? 0);
      const usedImage = Number(summary?.usedImage ?? member?.usedImage ?? 0);
      const defaultLimitCredit = Math.max(
        Number(member?.limitCredit || 0),
        Math.ceil(usedCredit * 1.2) || 1,
      );
      const defaultLimitImage = Math.max(
        Number(member?.limitImage || 0),
        Math.ceil(usedImage * 1.2) || 1,
      );

      return {
        userId,
        fullname: summary?.fullname || member?.fullname || "Unknown",
        username: (summary as any)?.username || member?.username,
        email: member?.email,
        role: summary?.role || member?.role || "USER",
        usedCredit,
        usedImage,
        limitCredit: override?.limitCredit ?? defaultLimitCredit,
        limitImage: override?.limitImage ?? defaultLimitImage,
      };
    });
  }, [projects, quotaOverrides, summaryByUser]);

  // const tokenUsed =
  //   (organization?.packageTokenAmount || 0) -
  //   (organization?.remainTokenAmount || 0);
  // const tokenLimit = organization?.packageTokenAmount || 0;
  // const imageUsed =
  //   (organization?.packageImageAmount || 0) -
  //   (organization?.remainImageAmount || 0);
  // const imageLimit = organization?.packageImageAmount || 0;

  // const totalCreditUsage = userRows.reduce(
  //   (sum, user) => sum + user.usedCredit,
  //   0,
  // );
  // const totalImageUsage = userRows.reduce(
  //   (sum, user) => sum + user.usedImage,
  //   0,
  // );
  // const activeProjects = projects.filter(
  //   (project) => (project.status || "").toLowerCase() === "active",
  // ).length;

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

  const alertUsers = useMemo(
    () =>
      userRows
        .filter((user) => {
          const creditPct =
            (user.usedCredit / Math.max(user.limitCredit, 1)) * 100;
          const imagePct =
            (user.usedImage / Math.max(user.limitImage, 1)) * 100;
          return Math.max(creditPct, imagePct) >= 70;
        })
        .sort((a, b) => {
          const aPct = Math.max(
            (a.usedCredit / Math.max(a.limitCredit, 1)) * 100,
            (a.usedImage / Math.max(a.limitImage, 1)) * 100,
          );
          const bPct = Math.max(
            (b.usedCredit / Math.max(b.limitCredit, 1)) * 100,
            (b.usedImage / Math.max(b.limitImage, 1)) * 100,
          );
          return bPct - aPct;
        }),
    [userRows],
  );

  const projectMetaByUser = useMemo(() => {
    const map = new Map<
      string,
      { projectName: string; projectDescription: string }
    >();
    const maxScoreByUser = new Map<string, number>();

    projects.forEach((project) => {
      (project.members || []).forEach((member) => {
        const score =
          Number(member.usedCreditAllowance || 0) +
          Number(member.usedImageAllowance || 0);
        const existingScore = maxScoreByUser.get(member.userId) ?? -1;

        if (score > existingScore) {
          maxScoreByUser.set(member.userId, score);
          map.set(member.userId, {
            projectName: project.name,
            projectDescription: project.description || "-",
          });
        }
      });
    });

    return map;
  }, [projects]);

  const pendingApprovals = useMemo<PendingApproval[]>(
    () =>
      alertUsers
        .filter((user) => !approvalDecisions[user.userId])
        .slice(0, 6)
        .map((user) => {
          const projectMeta = projectMetaByUser.get(user.userId);
          return {
            ...user,
            requestRatio: 1.3,
            projectName: projectMeta?.projectName || "-",
            projectDescription: projectMeta?.projectDescription || "-",
          };
        }),
    [alertUsers, approvalDecisions, projectMetaByUser],
  );

  const approvalRows = useMemo<PendingApproval[]>(() => {
    if (pendingApprovals.length > 0 || loading) {
      return pendingApprovals;
    }
    return mockPendingApprovals.filter(
      (user) => !approvalDecisions[user.userId],
    );
  }, [approvalDecisions, loading, pendingApprovals]);

  const handleApprove = (user: PendingApproval) => {
    setQuotaOverrides((prev) => {
      const current = prev[user.userId] || {
        limitCredit: user.limitCredit,
        limitImage: user.limitImage,
      };
      return {
        ...prev,
        [user.userId]: {
          limitCredit: Math.ceil(current.limitCredit * user.requestRatio),
          limitImage: Math.ceil(current.limitImage * user.requestRatio),
        },
      };
    });
    setApprovalDecisions((prev) => ({ ...prev, [user.userId]: "approved" }));
  };

  const handleDeny = (user: PendingApproval) => {
    setApprovalDecisions((prev) => ({ ...prev, [user.userId]: "denied" }));
  };

  // const handleApproveAll = () => {
  //   approvalRows.forEach((user) => handleApprove(user));
  // };

  const handleDenyAll = () => {
    approvalRows.forEach((user) => handleDeny(user));
  };

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
      // render: (_: unknown, record: DashboardUserRow) => (
      //   <Button size="small" onClick={() => openQuotaModal(record)}>
      //     Manage Quota
      //   </Button>
      // ),
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
  ];

  const statCards = [
    {
      label: "Total Projects",
      value: overviewSummary?.totalProject ?? 0,
      sub: `${overviewSummary?.totalActiveProject} active`,
      icon: <FolderOpen size={16} color={token.colorPrimary} />,
      iconBg: token.colorPrimaryBg,
      iconColor: token.colorPrimary,
      trend: "+2 this month",
    },
    {
      label: "Total Users",
      value: overviewSummary?.totalMember ?? 0,
      sub: `${overviewSummary?.adminMember} admins`,
      icon: <Users size={16} color={token.colorInfo} />,
      iconBg: token.colorInfoBg,
      iconColor: token.colorInfo,
      trend: "+5 this month",
    },
    {
      label: "Generations",
      value: formatCompactNumber(overviewSummary?.usedImage),
      sub: `+${formatCompactNumber(overviewSummary?.monthlyusedImage)} this month`,
      icon: <Sparkles size={16} color={token.colorSuccess} />,
      iconBg: token.colorSuccessBg,
      iconColor: token.colorSuccess,
      trend: "+18% vs last month",
    },
    {
      label: "Token Usage",
      value: formatCompactNumber(overviewSummary?.usedCredit),
      sub:
        overviewSummary && overviewSummary?.creditAllowance > 0
          ? `of ${formatNumber(overviewSummary?.creditAllowance)} total`
          : "No package",
      icon: <CreditCard size={16} color={token.colorWarning} />,
      iconBg: token.colorWarningBg,
      iconColor: token.colorWarning,
      progress: overviewSummary?.usedCreditPercent || 0,
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
        <PageSubHeader
          title="Organization Dashboard"
          subtitle="Monitor usage and manage resources across all projects"
          background={token.colorBgContainer}
          borderColor={token.colorBorder}
          titleColor={token.colorTextBase}
          subtitleColor={token.colorTextSecondary}
          chipBg={token.colorBgTextActive}
          chipText={token.colorTextSecondary}
          // rightSlot={
          //   approvalRows.length > 0 ? (
          //     <Badge count={approvalRows.length}>
          //       <Button
          //         icon={<AlertTriangle size={14} />}
          //         onClick={() => setActiveTab("approvals")}
          //       >
          //         Pending Approvals
          //       </Button>
          //     </Badge>
          //   ) : null
          // }
          compact
        />
      </Layout.Header>

      <Layout.Content className="p-3 md:p-6">
        <DashboardCustomTab
          value={
            activeTab as
              | "overview"
              | "users"
              | "projects"
              | "analytics"
              | "approvals"
          }
          onChange={
            setActiveTab as (
              value:
                | "overview"
                | "users"
                | "projects"
                | "analytics"
                | "approvals",
            ) => void
          }
          usersTotal={filteredUsers.length}
          projectsTotal={filteredProjects.length}
          approvalsTotal={approvalRows.length}
        />

        <div className="mt-4">
          {activeTab === "overview" && (
            <OverviewTab
              loading={loading}
              statCards={statCards}
              alertUsers={alertUsers}
              pendingApprovals={approvalRows}
              openQuotaModal={openQuotaModal}
              onApprove={handleApprove}
              onDeny={handleDeny}
              setActiveTab={setActiveTab}
              usedCreditPerMonth={usedCreditPerMonth}
              usedCreditByType={usedCreditByType}
            />
          )}
          {activeTab === "users" && (
            <UsersTab
              loading={loading}
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              userColumns={userColumns}
              filteredUsers={filteredUsers}
            />
          )}
          {activeTab === "projects" && (
            <ProjectsTab
              loading={loading}
              projectSearch={projectSearch}
              setProjectSearch={setProjectSearch}
              projectColumns={projectColumns}
              filteredProjects={filteredProjects}
            />
          )}
          {activeTab === "analytics" && (
            <AnalyticsTab
              loading={loading}
              userRows={userRows}
              summaryByProject={summaryByProject}
              projects={projects}
              token={token}
              formatNumber={formatNumber}
              generatedByType={generatedByType}
              generatedPerMonth={generatedPerMonth}
            />
          )}
          {/* {activeTab === "approvals" && (
            <ApprovalsTab
              loading={loading}
              pendingApprovals={approvalRows}
              openQuotaModal={openQuotaModal}
              onApprove={handleApprove}
              onDeny={handleDeny}
              onApproveAll={handleApproveAll}
              onDenyAll={handleDenyAll}
            />
          )} */}
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
    </Layout>
  );
};
export default DashboardPage;
