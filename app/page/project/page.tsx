"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ProjectFormModal from "./component/project-form-modal";
import {
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  message,
  Radio,
  Spin,
  Space,
  Divider,
  Empty,
  Grid,
  Segmented,
  theme,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { IProject } from "@/app/common/project.type";
import ProjectService from "@/app/services/project.service";
import GalleryServices from "@/app/services/gellory.service";
import type { ProjectPreview } from "./component/project-grid-view";
import UserServices from "@/app/services/users.service";
import { useOrganization } from "@/app/context/OrganizationContext";
import { axiosCore, axiosUser } from "@/app/lib/axios/axios";
import { canCreateProjects } from "../../utils/permissions";
import GuideTourButton from "@/app/components/guide-tour/GuideTourButton";
import { PROJECT_LIST_GUIDE } from "@/app/components/guide-tour/tour-steps";
import OrganizationServices from "@/app/services/organization.service";
import {
  ICreditBalance,
  IOrganization,
  IOrganizationSubscription,
} from "@/app/common/organization.type";
import { formatNumber } from "@/app/utils/format";
import ProjectGridView from "./component/project-grid-view";
import ProjectListView from "./component/project-list-view";
import useResponsive from "@/app/hooks/useResponsive";
import { JsonObject } from "next-auth/adapters";
import PageSubHeader from "@/app/components/layout/PageSubHeader";
import OrganizationSubscriptionServices from "@/app/services/organization-subscription.service";
import CreditBalanceServices from "@/app/services/credit-balance.service";

const MAX_MEMBERS = 5;

// Static constant — defined once, never recreated
const PROJECT_ACTION_ITEMS = [
  { key: "edit", label: "Edit" },
  { key: "archive", label: "Archive" },
  { key: "delete", label: "Delete", danger: true },
];

// Pure helper — no closure, safe at module level
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const ProjectsPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { organizationRole } = useOrganization();
  const [searchForm] = Form.useForm();
  const [messageApi, contextMessageHolder] = message.useMessage();
  const [modal, contextHolder] = Modal.useModal();

  // Service instances memoized — created once per mount, not on every render
  const projectService = useMemo(() => ProjectService(axiosCore), []);
  const galleryService = useMemo(() => GalleryServices(axiosCore), []);
  const [previews, setPreviews] = useState<Record<string, ProjectPreview[]>>({});
  const userServices = useMemo(() => UserServices(axiosUser), []);
  const organizationService = useMemo(
    () => OrganizationServices(axiosUser),
    [],
  );
  const organizationSubscriptionService = useMemo(
    () => OrganizationSubscriptionServices(axiosUser),
    [],
  );
  const creditBalanceService = useMemo(
    () => CreditBalanceServices(axiosUser),
    [],
  );

  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<IProject | undefined>(
    undefined,
  );
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [organizationMembers, setOrganizationMembers] = useState<any[]>([]);
  const [assignedCredit, setAssignedCredit] = useState<number>(0);
  const [searchValue, setSearchValue] = useState<JsonObject>({
    name: undefined,
    status: undefined,
  });
  const [organizationId, setOrganizationId] = useState<string>("");
  const [organization, setOrganization] = useState<IOrganization | undefined>(
    undefined,
  );
  const [organizationSubscription, setOrganizationSubscription] = useState<
    IOrganizationSubscription | undefined
  >(undefined);
  const [creditBalance, setCreditBalance] = useState<
    ICreditBalance | undefined
  >(undefined);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const { isMobile, isTablet } = useResponsive();
  const isWide = !!Grid.useBreakpoint().xl;

  // Memoized semantic tokens — recomputed only when theme changes
  const semantic = theme.useToken().token;

  const countByStatus = useCallback(
    (status: string) =>
      projects.filter((p) => (p.status || "").toLowerCase() === status).length,
    [projects],
  );
  const activeProjects = useMemo(() => countByStatus("active"), [countByStatus]);
  const inactiveProjects = useMemo(
    () => countByStatus("inactive"),
    [countByStatus],
  );
  // status filters client-side so the tab counts always reflect the full list
  const visibleProjects = useMemo(() => {
    const status = searchValue.status as string | undefined;
    if (!status) return projects;
    return projects.filter((p) => (p.status || "").toLowerCase() === status);
  }, [projects, searchValue.status]);

  // ── Data fetching ──────────────────────────────────────────────────────────

  // Latest three works per project (All Activity's filter: everything except failed), so cards show
  // the work instead of only a name. `status: true` would mean Library-only and hid photo-event work.
  const loadPreviews = async (list: IProject[]) => {
    const entries = await Promise.all(
      list.map(async (p) => {
        const res = await galleryService.findById(p.id, organizationId, 1, 3, undefined, { hideFailed: true });
        const items: ProjectPreview[] = (res?.data ?? [])
          .filter((it: { imageUrl?: string }) => !!it.imageUrl)
          .map((it: { id: string; imageUrl: string; typeGenerate?: string }) => ({
            id: it.id,
            url: it.imageUrl,
            isVideo: (it.typeGenerate ?? "").toLowerCase().includes("video"),
          }));
        return [p.id, items] as const;
      }),
    );
    setPreviews(Object.fromEntries(entries));
  };

  const fetchProjects = async () => {
    if (!organizationId || !session?.user?.id) return;
    setLoading(true);
    try {
      const response = await projectService.findByOrganizationId(
        organizationId,
        session.user.id,
        { name: searchValue.name },
      );
      setProjects(response || []);
      loadPreviews(response || []);
      setAssignedCredit(
        response?.reduce((acc, p) => acc + p.limitCreditAllowance, 0) ?? 0,
      );
    } catch {
      messageApi.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  // Fetches org metadata, subscription, credit balance, and members in parallel
  const fetchOrgData = async () => {
    if (!organizationId) return;
    try {
      const [org, subscription, credit, members] = await Promise.all([
        organizationService.findById(organizationId),
        organizationSubscriptionService.findByOrganizationId(organizationId),
        creditBalanceService.findByOrganizationId(organizationId),
        userServices.findOrganizationUserDetails(organizationId),
      ]);
      setOrganization(org);
      setOrganizationSubscription(subscription);
      setCreditBalance(credit);
      setOrganizationMembers(members || []);
    } catch (error) {
      console.error("Failed to fetch org data:", error);
    }
  };

  const fetchUserProfile = async () => {
    if (!session?.user?.id) return;
    try {
      const profile = await userServices.findDetailByToken(session.user.id);
      setUserProfile(profile);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (session?.user?.id) fetchUserProfile();
    setOrganizationId(session?.user?.organizationId || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, session?.user?.organizationId]);

  // On org load: fetch projects and org metadata in parallel (not waterfall)
  useEffect(() => {
    if (!organizationId) return;
    Promise.all([fetchProjects(), fetchOrgData()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  // On search change: re-fetch projects only (org data unchanged)
  useEffect(() => {
    if (!organizationId) return;
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue.name]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleOpen = useCallback(() => {
    setOpen(true);
    if (userProfile) {
      setProjectMembers([{ userId: userProfile.userId, role: "ADMIN" }]);
    } else {
      setProjectMembers([]);
    }
    form.resetFields();
  }, [userProfile, form]);

  const handleClose = useCallback(() => {
    setOpen(false);
    form.resetFields();
    setProjectMembers([]);
  }, [form]);

  const handleCloseEdit = useCallback(() => {
    setOpenEdit(false);
    editForm.resetFields();
    setProjectMembers([]);
  }, [editForm]);

  const handleSearch = useCallback((search: JsonObject) => {
    setSearchValue((prev) => ({ ...prev, ...search }));
  }, []);

  const onClickProject = useCallback(
    (projectId: string) => {
      router.push(`/page/project/${projectId}`);
    },
    [router],
  );

  const onClickProjectAction = useCallback(
    (action: string, project: IProject) => {
      setSelectedProject(project);
      if (action === "edit") {
        const members =
          project.members?.map((member: any) => ({
            userId: member.userId,
            role: member.role || "USER",
            limitCreditAllowance: member.limitCreditAllowance,
          })) || [];
        setProjectMembers(members);
        setOpenEdit(true);
        editForm.setFieldsValue({ ...project });
      }
      if (action === "delete") {
        modal.confirm({
          title: "Delete Project",
          content: "Are you sure you want to delete this project?",
          onOk: async () => {
            setLoading(true);
            try {
              await projectService.deleteProject(project.id);
              messageApi.success("Project deleted successfully");
              fetchProjects();
            } finally {
              setLoading(false);
            }
          },
        });
      }
      if (action === "archive") {
        modal.confirm({
          title: "Archive Project",
          content: "Are you sure you want to archive this project?",
          onOk: async () => {
            setLoading(true);
            try {
              await projectService.update(project.id, {
                status: "inactive" as any,
                userId: session?.user?.id,
              });
              messageApi.success("Project archived successfully");
              fetchProjects();
            } catch {
              messageApi.error("Failed to archive project");
            } finally {
              setLoading(false);
            }
          },
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editForm, modal, projectService, messageApi, session?.user?.id],
  );

  const onFinishAdd = useCallback(
    async (values: any) => {
      setLoading(true);
      try {
        if (!organization) {
          messageApi.error("Organization not found");
          return;
        }
        const maxCreditAll = projectMembers.reduce(
          (acc, m) => acc + (m.limitCreditAllowance || 0),
          0,
        );
        if (maxCreditAll > values.limitCreditAllowance) {
          messageApi.error("Max credit is too high");
          return;
        }
        const response = await projectService.create({
          ...values,
          members: projectMembers.filter((m) => m.userId),
          organizationId,
        });
        if (response) {
          messageApi.success("Project created successfully");
          setOpen(false);
          setProjectMembers([]);
          form.resetFields();
          await Promise.all([fetchProjects(), fetchOrgData()]);
        }
      } catch {
        messageApi.error("Failed to create project");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      organization,
      projectMembers,
      organizationId,
      projectService,
      messageApi,
      form,
    ],
  );

  const onFinishEdit = useCallback(
    async (values: any) => {
      setLoading(true);
      try {
        if (!organization) {
          messageApi.error("Organization not found");
          return;
        }
        const maxCreditAll = projectMembers.reduce(
          (acc, m) => acc + (m.limitCreditAllowance || 0),
          0,
        );
        if (maxCreditAll > values.limitCreditAllowance) {
          messageApi.error("Max credit is too high");
          return;
        }
        await projectService.update(values.id, {
          ...values,
          userId: session?.user?.id,
          members: projectMembers.filter((m) => m.userId),
        });
        messageApi.success("Project updated successfully");
        setOpenEdit(false);
        setProjectMembers([]);
        await Promise.all([fetchProjects(), fetchOrgData()]);
      } catch (error: any) {
        const message = error?.response?.data?.message;
        messageApi.error(
          (Array.isArray(message) ? message[0] : message) ||
            "Failed to update project",
        );
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [organization, projectMembers, projectService, messageApi, session?.user?.id],
  );

  const contentViewportHeight = isMobile
    ? "calc(100svh - 54px)"
    : isTablet
      ? "calc(100svh - 58px)"
      : "calc(100svh - 62px)";

  // ≥1200px: search, filters and view toggle join the header row, so the list starts higher.
  const searchControls = (
              <Form
                form={searchForm}
                onFinish={(value) => handleSearch(value)}
                style={{ width: isWide ? "auto" : "100%" }}
              >
                <Space
                  size={isMobile ? 6 : isTablet ? 10 : 16}
                  align="center"
                  wrap
                  style={{ width: "100%" }}
                >
                  {isMobile ? (
                    <Button
                      onClick={() => searchForm.submit()}
                      type={"default"}
                      icon={<SearchOutlined style={{ fontSize: 12 }} />}
                      aria-label="Search projects"
                      size="small"
                      style={{
                        minWidth: 28,
                        borderRadius: 6,
                        border: `1px solid ${semantic.colorBorder}`,
                        color: semantic.colorTextSecondary,
                        backgroundColor: semantic.colorBgContainer,
                      }}
                    />
                  ) : (
                    <Form.Item name="name" style={{ marginBottom: 0 }}>
                      <Input
                        size="small"
                        placeholder="Search project..."
                        style={{
                          width: isWide ? 240 : isTablet ? 220 : 380,
                          maxWidth: "100%",
                          borderRadius: 4,
                        }}
                        prefix={
                          <SearchOutlined
                            onClick={() => searchForm.submit()}
                            style={{ color: semantic.colorTextSecondary }}
                          />
                        }
                        onPressEnter={() => searchForm.submit()}
                      />
                    </Form.Item>
                  )}
                  <Segmented
                    className="project-status-seg"
                    aria-label="Filter projects by status"
                    value={(searchValue.status as string | undefined) ?? "all"}
                    options={[
                      // The header chip already shows the total, so "All" carries no count.
                      { label: "All", value: "all" },
                      { label: `Active (${activeProjects})`, value: "active" },
                      { label: `Inactive (${inactiveProjects})`, value: "inactive" },
                    ]}
                    onChange={(v) => handleSearch({ status: v === "all" ? undefined : v })}
                  />
                </Space>
              </Form>
  );
  const viewToggle = (
                <Radio.Group
                  className="project-view-toggle"
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                  style={{
                    background: "transparent",
                    borderRadius: 8,
                    padding: isMobile ? "1px" : isTablet ? "2px" : "3px",
                    border: `1px solid ${semantic.colorBorder}`,
                    display: "flex",
                    gap: isMobile ? 2 : isTablet ? 3 : 4,
                  }}
                >
                  <Radio.Button
                    value="list"
                    aria-label="List view"
                    title="List view"
                    style={{
                      background:
                        viewType === "list"
                          ? semantic.colorPrimary
                          : "transparent",
                      color:
                        viewType === "list" ? "#fff" : semantic.colorTextBase,
                      borderRadius:
                        isMobile || isTablet ? 4 : "6px 0px 0px 6px",
                      width: isMobile ? 20 : isTablet ? 22 : 24,
                      height: isMobile ? 20 : isTablet ? 22 : 24,
                      padding: 0,
                      border: "none",
                      transition: "background 0.2s",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <UnorderedListOutlined
                      style={{ fontSize: isMobile ? 12 : isTablet ? 13 : 14 }}
                    />
                  </Radio.Button>
                  <Radio.Button
                    value="grid"
                    aria-label="Grid view"
                    title="Grid view"
                    style={{
                      background:
                        viewType === "grid"
                          ? semantic.colorPrimary
                          : "transparent",
                      color:
                        viewType === "grid" ? "#fff" : semantic.colorTextBase,
                      borderRadius:
                        isMobile || isTablet ? 4 : "0px 6px 6px 0px",
                      width: isMobile ? 20 : isTablet ? 22 : 24,
                      height: isMobile ? 20 : isTablet ? 22 : 24,
                      padding: 0,
                      border: "none",
                      transition: "background 0.2s",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <AppstoreOutlined
                      style={{ fontSize: isMobile ? 12 : isTablet ? 13 : 14 }}
                    />
                  </Radio.Button>
                </Radio.Group>
  );

  return (
    <Spin spinning={loading} style={{ height: "100%" }}>
      <div
        style={{
          height: contentViewportHeight,
          maxHeight: contentViewportHeight,
          display: "flex",
          flexDirection: "column",
          overflowY: "hidden",
          overflowX: "hidden",
        }}
      >
        {contextMessageHolder}
        {/* Header + Filter Fixed Section */}
        <div
          className="project-top-shell"
          style={{
            zIndex: 20,
            backgroundColor: semantic.colorBgContainer,
          }}
        >
          <PageSubHeader
            title="Projects"
            count={visibleProjects.length}
            background={semantic.colorBgContainer as string}
            borderColor={semantic.colorBorder as string}
            titleColor={semantic.colorTextBase as string}
            subtitleColor={semantic.colorTextSecondary as string}
            chipBg={semantic.colorBgTextActive as string}
            chipText={semantic.colorTextSecondary as string}
            rightSlot={
              <Space size={isWide ? 12 : 8} align="center" className="project-header-actions">
                {isWide && searchControls}
                {isWide && viewToggle}
                <GuideTourButton guide={PROJECT_LIST_GUIDE} />
                {canCreateProjects(organizationRole) ? (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleOpen}
                  >
                    {isMobile ? "New" : "New Project"}
                  </Button>
                ) : null}
              </Space>
            }
            compact
          />
          {/* Filter/Search Section */}
          {!isWide && (
          <Row
            className="project-filter-row"
            align={isMobile ? "top" : "middle"}
            justify="space-between"
            gutter={[10, isMobile ? 6 : 8]}
            wrap
            style={{
              minHeight: isMobile ? 40 : 42,
              height: "auto",
              width: "100%",
              margin: 0,
              padding: isMobile
                ? "6px 10px"
                : isTablet
                  ? "4px 12px"
                  : "4px 14px",
              backgroundColor: semantic.colorBgContainer,
              borderBottom: `1px solid ${semantic.colorBorder}`,
            }}
          >
            <Col
              xs={24}
              sm={24}
              md={16}
              lg={18}
              flex="1"
              style={{ display: "flex", alignItems: "center" }}
            >
              {searchControls}
            </Col>
            <Col
              xs={24}
              sm={24}
              md={8}
              lg={6}
              flex="none"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: isMobile ? "flex-start" : "flex-end",
                marginTop: isMobile ? 2 : 0,
              }}
            >
              <Space size={isMobile ? 8 : isTablet ? 12 : 16}>
                {viewToggle}
              </Space>
            </Col>
          </Row>
          )}
        </div>

        <div
          className="project-main-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth",
          }}
        >
          <Divider style={{ margin: 0 }} />
          {loading && visibleProjects.length === 0 ? (
            // The page-level <Spin> already shows progress; this only reserves room for it.
            <div style={{ minHeight: 240 }} />
          ) : visibleProjects.length === 0 ? (
            searchValue.name || searchValue.status ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No project matches this search or filter."
                style={{ marginTop: 48 }}
              >
                <Button
                  onClick={() => {
                    searchForm.setFieldsValue({ name: undefined });
                    handleSearch({ name: undefined, status: undefined });
                  }}
                >
                  Clear search
                </Button>
              </Empty>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No projects yet."
                style={{ marginTop: 48 }}
              >
                {canCreateProjects(organizationRole) && (
                  <Button type="primary" onClick={handleOpen}>
                    New project
                  </Button>
                )}
              </Empty>
            )
          ) : viewType === "grid" ? (
            <ProjectGridView
              projects={visibleProjects}
              previews={previews}
              semantic={semantic}
              onClickProject={onClickProject}
              formatDate={formatDate}
              showActionMenu={canCreateProjects(organizationRole)}
              projectActionItems={PROJECT_ACTION_ITEMS}
              onClickProjectAction={onClickProjectAction}
            />
          ) : (
            <ProjectListView
              projects={visibleProjects}
              semantic={semantic}
              organizationRole={organizationRole}
              onClickProject={onClickProject}
              formatDate={formatDate}
              canCreateProjects={canCreateProjects}
              projectActionItems={PROJECT_ACTION_ITEMS}
              onClickProjectAction={onClickProjectAction}
            />
          )}
        </div>

        {(open || openEdit) && (
          <ProjectFormModal
            open={open || openEdit}
            title={openEdit ? "Edit Project" : "Create New Project"}
            onCancel={openEdit ? handleCloseEdit : handleClose}
            form={openEdit ? editForm : form}
            organization={organization}
            selectedProject={openEdit ? selectedProject : undefined}
            projectMembers={projectMembers}
            setProjectMembers={setProjectMembers}
            organizationMembers={organizationMembers}
            loading={loading}
            onFinish={openEdit ? onFinishEdit : onFinishAdd}
            maxMembers={MAX_MEMBERS}
            mode={openEdit ? "edit" : "create"}
            formatNumber={formatNumber}
            organizationSubscription={organizationSubscription}
            creditBalance={creditBalance}
            assignedCredit={assignedCredit}
          />
        )}
        {contextHolder}
      </div>

      <style jsx global>{`
        .project-top-shell {
          animation: projectTopIn 280ms ease;
        }

        .project-view-toggle .ant-radio-button-wrapper {
          transition: background-color 160ms ease;
        }

        /* One control height (32px) across the header row; the shared buttons default to 24 or 40. */
        .project-header-actions .ant-btn,
        .project-header-actions .ant-input-affix-wrapper {
          height: 32px;
        }
        .project-header-actions .ant-btn-icon-only {
          width: 32px;
        }
        .project-status-seg .ant-segmented-item-label {
          min-height: 28px;
          line-height: 28px;
        }

        /* Touch screens get a 44px target; the inline 20–24px sizes suit a pointer only. */
        @media (hover: none) {
          .project-view-toggle .ant-radio-button-wrapper {
            min-width: 44px !important;
            min-height: 44px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .project-top-shell {
            animation: none;
          }
        }

        .project-main-scroll::-webkit-scrollbar {
          width: 9px;
        }

        .project-main-scroll::-webkit-scrollbar-thumb {
          background: rgba(120, 120, 120, 0.28);
          border-radius: 999px;
        }

        .project-main-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        @keyframes projectTopIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Spin>
  );
};

export default ProjectsPage;
