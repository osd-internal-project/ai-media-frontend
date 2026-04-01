"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProjectFormModal from "./component/project-form-modal";
import {
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  message,
  Dropdown,
  Tooltip,
  Select,
  InputNumber,
  Spin,
  Typography,
  Space,
  Divider,
  Radio,
  Table,
  Progress,
  theme,
  Badge,
  Card,
  Tag,
} from "antd";
import {
  PlusOutlined,
  ProjectOutlined,
  TeamOutlined,
  CalendarOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { IProject } from "@/app/common/project.type";
import ProjectService from "@/app/services/project.service";
import UserServices from "@/app/services/users.service";
import { useOrganization } from "@/app/context/OrganizationContext";
import { axiosCore, axiosUser } from "@/app/lib/axios/axios";
import { canCreateProjects } from "../../utils/permissions";
import OrganizationServices from "@/app/services/organization.service";
import {
  ICreditBalance,
  IOrganization,
  IOrganizationSubscription,
} from "@/app/common/organization.type";
import { formatNumber } from "@/app/utils/format";
import { useWebSocket } from "@/app/hooks/useWebsocket";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import ProjectGridView from "./component/project-grid-view";
import ProjectListView from "./component/project-list-view";
import useResponsive from "@/app/hooks/useResponsive";
import { JsonObject, JsonValue } from "next-auth/adapters";
import PageSubHeader from "@/app/components/layout/PageSubHeader";
import OrganizationSubscriptionServices from "@/app/services/organization-subscription.service";
import CreditBalanceServices from "@/app/services/credit-balance.service";

const MAX_MEMBERS = 5;

const ProjectsPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { organizationRole } = useOrganization();
  const [searchForm] = Form.useForm();
  const [messageApi, contextMessageHolder] = message.useMessage();
  const projectService = ProjectService(axiosCore);
  const userServices = UserServices(axiosUser);
  const organizationService = OrganizationServices(axiosUser);
  const organizationSubscriptionService =
    OrganizationSubscriptionServices(axiosUser);
  const creditBalanceService = CreditBalanceServices(axiosUser);

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
  const [searchTexts, setSearchTexts] = useState<{ [key: number]: string }>({});
  const [assignedCredit, setAssignedCredit] = useState<number>(0);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "USER" | "VIEWER">(
    "USER",
  );
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
  const [modal, contextHolder] = Modal.useModal();
  const [editForm] = Form.useForm();
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const { isMobile, isTablet } = useResponsive();

  const activeProjects = useMemo(
    () =>
      projects.filter(
        (project) => (project.status || "").toLowerCase() === "active",
      ).length,
    [projects],
  );
  const inactiveProjects = useMemo(
    () => projects.length - activeProjects,
    [projects.length, activeProjects],
  );

  const projectActionItems = [
    {
      key: "edit",
      label: "Edit",
    },
    {
      key: "archive",
      label: "Archive",
    },
    {
      key: "delete",
      label: "Delete",
      danger: true,
    },
  ];

  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};

  const onClickProjectAction = (action: string, project: IProject) => {
    console.log("click", action, project);
    setSelectedProject(project);
    if (action === "edit") {
      console.log(
        "Opening edit for project:",
        project.name,
        "Members:",
        project.members,
      );

      setOpenEdit(true);
      const members =
        project.members?.map((member: any) => ({
          userId: member.userId,
          role: member.role || "USER",
          limitCreditAllowance: member.limitCreditAllowance,
        })) || [];
      console.log("Setting project members:", members);
      setProjectMembers(members);

      const initialSearchTexts: { [key: number]: string } = {};
      members.forEach((member: any, index: number) => {
        const user = organizationMembers.find(
          (u) => u.userId === member.userId,
        );
        if (user) {
          initialSearchTexts[index] = user.fullname;
        }
      });
      setSearchTexts(initialSearchTexts);

      editForm.setFieldsValue({ ...project });
    }
    if (action === "delete") {
      modal.confirm({
        title: "Delete Project",
        content: "Are you sure you want to delete this project?",
        onOk: () => {
          async function deleteProject() {
            await projectService.deleteProject(project.id);
            messageApi.success("Project deleted successfully");
            fetchProjects();
          }
          deleteProject();
          setLoading(true);
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
            });
            messageApi.success("Project archived successfully");
            fetchProjects();
          } catch (error) {
            console.error("Failed to archive project:", error);
            messageApi.error("Failed to archive project");
          } finally {
            setLoading(false);
          }
        },
      });
    }
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(true);
    setLoading(true);
    if (userProfile) {
      setSearchTexts((prev) => ({ 0: userProfile.fullname }));
      console.log(searchTexts);
      setProjectMembers([{ userId: userProfile.userId, role: "ADMIN" }]);
      setLoading(false);
    } else {
      setProjectMembers([]);
      setSearchTexts({});
    }

    form.resetFields();
  };

  const handleClose = () => {
    setOpen(false);
    form.resetFields();
    setProjectMembers([]);
    setShowAddMember(false);
    setSelectedUser("");
    setSelectedRole("USER");
    setSearchTexts({});
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    editForm.resetFields();
    setProjectMembers([]);
    setSearchTexts({});
  };

  const onFinishAdd = async (values: any) => {
    try {
      setLoading(true);
      if (!organization) {
        messageApi.error("Organization not found");
        setLoading(false);
        return;
      }
      const maxCreditAll = projectMembers.reduce(
        (per, total) => (total = per + total.limitCreditAllowance),
        0,
      );
      if (maxCreditAll > values.limitCreditAllowance) {
        messageApi.error("Max credit is too high");
        setLoading(false);
        return;
      }

      const projectData = {
        ...values,
        members: projectMembers.filter((m) => m.userId),
        organizationId: organizationId,
      };

      const response = await projectService.create({
        ...projectData,
        organizationId: organizationId,
      });

      if (response) {
        // const remainImageAmount =
        //   (organization?.remainImageAmount || 0) - response.accessImageAmount;
        // const remainTokenAmount =
        //   (organization?.remainTokenAmount || 0) - response.accessTokenAmount;
        // await organizationService.update(organization.organizationId, {
        //   remainImageAmount,
        //   remainTokenAmount,
        // });
        messageApi.success("Project created successfully");
        setOpen(false);
        setProjectMembers([]);
        form.resetFields();
        fetchOrganizationMembers();
        fetchProjects();
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      messageApi.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const onFinishEdit = async (values: any) => {
    setLoading(true);
    try {
      const project = form.getFieldsValue(); 
      if (!organization) {
        messageApi.error("Organization not found");
        setLoading(false);
        return;
      }
      const maxCreditAll = projectMembers.reduce(
        (per, total) => (total = per + total.limitCreditAllowance),
        0,
      );
      if (maxCreditAll > project.limitCreditAllowance) {
        messageApi.error("Max credit is too high");
        setLoading(false);
        return;
      }
      const projectData = {
        ...values,
        members: projectMembers.filter((m) => m.userId),
      };
      console.log(projectData, maxCreditAll);
      const updateResponse = await projectService.update(
        values.id,
        projectData,
      );
      if (updateResponse) {
        messageApi.success("Project updated successfully");
      }
      setOpenEdit(false);
      setProjectMembers([]);
      fetchProjects();
      fetchOrganizationMembers();
    } catch (error) {
      console.error("Failed to update project:", error);
      messageApi.error("Failed to update project");
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProfile();
    }

    setOrganizationId(session?.user?.organizationId || "");
  }, [session?.user?.id, session?.user.organizationId]);

  useEffect(() => {
    if (organizationId) {
      fetchProjects();
      fetchOrganizationMembers();
    }
  }, [organizationId]);

  useEffect(() => {
    fetchProjects();
  }, [searchValue]);

  const fetchOrganizationMembers = async () => {
    try {
      if (organizationId) {
        const organization = await organizationService.findById(organizationId);
        console.log(organization);
        setOrganization(organization);

        const subscription =
          await organizationSubscriptionService.findByOrganizationId(
            organizationId,
          );
        setOrganizationSubscription(subscription);
        const creditBalance =
          await creditBalanceService.findByOrganizationId(organizationId);
        setCreditBalance(creditBalance);
      }
    } catch (error) {
      console.error("Failed to fetch organization :", error);
    }
    try {
      if (organizationId) {
        const response =
          await userServices.findOrganizationUserDetails(organizationId);
        setOrganizationMembers(response || []);
      }
    } catch (error) {
      console.error("Failed to fetch organization members:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      if (session?.user?.id) {
        const profile = await userServices.findDetailByToken(session.user.id);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      if (organizationId && session?.user?.id) {
        const response = await projectService.findByOrganizationId(
          organizationId,
          session.user.id,
          searchValue,
        );
        setProjects(response || []);
        const totalAssignedCredit = response?.reduce((total, project) => {
          return total + project.limitCreditAllowance;
        }, 0);
        setAssignedCredit(totalAssignedCredit);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      messageApi.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const onClickProject = (projectId: string) => {
    // if (socket) {
    //   socket.emit('chat:get-history', {
    //     projectId,
    //     skip: 0,
    //     pageSize: 3
    //   });
    // }
    router.push(`/page/project/${projectId}`);
  };

  async function handleSearch(search: JsonObject): Promise<void> {
    setSearchValue((prev) => ({ ...prev, ...search }));
    // await fetchProjects();
  }

  const contentViewportHeight = isMobile
    ? "calc(100svh - 54px)"
    : isTablet
      ? "calc(100svh - 58px)"
      : "calc(100svh - 62px)";

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
            count={projects.length}
            background={semantic.colorBgContainer as string}
            borderColor={semantic.colorBorder as string}
            titleColor={semantic.colorTextBase as string}
            subtitleColor={semantic.colorTextSecondary as string}
            chipBg={semantic.colorBgTextActive as string}
            chipText={semantic.colorTextSecondary as string}
            rightSlot={
              canCreateProjects(organizationRole) ? (
                <Button
                  type="primary"
                  size={"small"}
                  icon={<PlusOutlined />}
                  onClick={handleOpen}
                >
                  {isMobile ? "New" : "New Project"}
                </Button>
              ) : null
            }
            compact
          />
          {/* Filter/Search Section */}
          <Row
            className="project-filter-row"
            align={isMobile ? "top" : "middle"}
            justify="space-between"
            gutter={[10, isMobile ? 6 : 8]}
            wrap
            style={{
              minHeight: isMobile ? 40 : isTablet ? 44 : 46,
              height: "auto",
              width: "100%",
              margin: 0,
              padding: isMobile ? "6px 10px" : isTablet ? "8px 12px" : "8px 14px",
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
          <Form
            form={searchForm}
            onFinish={(value) => handleSearch(value)}
            style={{ width: "100%" }}
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
                  size="small"
                  style={{
                    // width: 28,
                    // height: 28,
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
                    style={{ width: isTablet ? 220 : 380, maxWidth: "100%", borderRadius: 4 }}
                    onClick={() => console.log("Icon clicked!")}
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
              <Space size={isMobile ? 4 : isTablet ? 8 : 12} wrap>
                <Button
                  className="project-filter-btn"
                  type={!searchValue["status"] ? "primary" : "default"}
                  ghost
                  variant="outlined"
                  size={"small" }
                  style={{
                    color: semantic.colorTextSecondary,
                    fontWeight: 500,
                  }}
                  onClick={() => handleSearch({ status: undefined })}
                >
                  All ({projects.length})
                </Button>
                <Button
                  className="project-filter-btn"
                  type={searchValue.status === "active" ? "primary" : "default"}
                  ghost
                  variant="outlined"
                  size={"small" }
                  style={{
                    color: semantic.colorTextSecondary,
                    fontWeight: 500,
                  }}
                  onClick={() => handleSearch({ status: "active" })}
                >
                  Active ({activeProjects})
                </Button>
                <Button
                  className="project-filter-btn"
                  type={
                    searchValue.status === "inactive" ? "primary" : "default"
                  }
                  ghost
                  variant="outlined"
                  size={"small"}
                  style={{
                    color: semantic.colorTextSecondary,
                    fontWeight: 500,
                  }}
                  onClick={() => handleSearch({ status: "inactive" })}
                >
                  Inactive ({inactiveProjects})
                </Button>
              </Space>
            </Space>
          </Form>
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
            {!isMobile && !isTablet ? (
              <Typography.Text
                style={{ fontSize: 16, color: semantic.colorTextSecondary }}
              >
                {projects.length} projects
              </Typography.Text>
            ) : null}
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
                style={{
                  background:
                    viewType === "list" ? semantic.colorPrimary : "transparent",
                  color: viewType === "list" ? "#fff" : semantic.colorTextBase,
                  borderRadius: isMobile || isTablet ? 4 : "6px 0px 0px 6px",
                  
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
                style={{
                  background:
                    viewType === "grid" ? semantic.colorPrimary : "transparent",
                  color: viewType === "grid" ? "#fff" : semantic.colorTextBase,
                  borderRadius: isMobile || isTablet ? 4 : "0px 6px 6px 0px",
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
                <AppstoreOutlined style={{ fontSize: isMobile ? 12 : isTablet ? 13 : 14 }} />
              </Radio.Button>
            </Radio.Group>
          </Space>
          </Col>
          </Row>
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
          {/* Project List Section */}
          {loading ? (
            <div className="text-center text-gray-400">Loading ...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <ProjectOutlined className="text-6xl text-gray-600 mb-4" />
              <h3 className="text-xl text-gray-400 mb-2">No project yet</h3>
            </div>
          ) : viewType === "grid" ? (
            <ProjectGridView
              projects={projects}
              semantic={semantic}
              onClickProject={onClickProject}
              formatDate={formatDate}
              showActionMenu={canCreateProjects(organizationRole)}
              projectActionItems={projectActionItems}
              onClickProjectAction={onClickProjectAction}
            />
          ) : (
            <ProjectListView
              projects={projects}
              semantic={semantic}
              organizationRole={organizationRole}
              onClickProject={onClickProject}
              formatDate={formatDate}
              canCreateProjects={canCreateProjects}
              projectActionItems={projectActionItems}
              onClickProjectAction={onClickProjectAction}
            />
          )}
        </div>

        {/* Modal Section */}
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
            searchTexts={searchTexts}
            setSearchTexts={setSearchTexts}
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
        {/* Context Holder for Modal */}
        {contextHolder}
      </div>

      <style jsx global>{`
        .project-top-shell {
          animation: projectTopIn 280ms ease;
        }

        .project-filter-row {
          backdrop-filter: saturate(140%) blur(2px);
        }

        .project-filter-btn {
          transition: transform 160ms ease, box-shadow 160ms ease;
        }

        .project-filter-btn:hover {
          transform: translateY(-1px);
        }

        .project-view-toggle .ant-radio-button-wrapper {
          transition: transform 160ms ease, background-color 160ms ease;
        }

        .project-view-toggle .ant-radio-button-wrapper:hover {
          transform: translateY(-1px);
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
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Spin>
  );
};

export default ProjectsPage;
