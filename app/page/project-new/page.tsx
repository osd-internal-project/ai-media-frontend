"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProjectForm from "./component/project-form";
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
import { IOrganization } from "@/app/common/organization.type";
import { formatNumber } from "@/app/utils/format";
import { useWebSocket } from "@/app/hooks/useWebsocket";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import ProjectGridView from "./component/project-grid-view";
import ProjectListView from "./component/project-list-view";
import useResponsive from "@/app/hooks/useResponsive";

const MAX_MEMBERS = 5;

const ProjectsPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { organizationRole } = useOrganization();
  const [messageApi, contextMessageHolder] = message.useMessage();
  const projectService = ProjectService(axiosCore);
  const userServices = UserServices(axiosUser);
  const organizationService = OrganizationServices(axiosUser);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [organizationMembers, setOrganizationMembers] = useState<any[]>([]);
  const [searchTexts, setSearchTexts] = useState<{ [key: number]: string }>({});
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "USER" | "VIEWER">(
    "USER",
  );
  const [organizationId, setOrganizationId] = useState<string>("");
  const [organization, setOrganization] = useState<IOrganization | undefined>(
    undefined,
  );
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const [editForm] = Form.useForm();
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const { isMobile } = useResponsive();

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
          maxToken: member.maxToken,
          maxImages: member.maxImages,
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
            await projectService.update(project.id, { status: "inactive" as any });
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
      const maxTokenAll = projectMembers.reduce(
        (per, total) => (total = per + total.maxToken),
        0,
      );
      const maxImageAll = projectMembers.reduce(
        (per, total) => (total = per + total.maxImages),
        0,
      );
      if (maxTokenAll > values.accessTokenAmount) {
        messageApi.error("Max token  is too high");
        setLoading(false);
        return;
      }
      if (maxImageAll > values.accessImageAmount) {
        messageApi.error(" Max image is too high");
        setLoading(false);
        return;
      }
      const projectData = {
        ...values,
        remainImageAmount: values.accessImageAmount - maxImageAll,
        remainTokenAmount: values.accessTokenAmount - maxTokenAll,
        members: projectMembers.filter((m) => m.userId),
        organizationId: organizationId,
      };

      const response = await projectService.create({
        ...projectData,
        organizationId: organizationId,
      });

      if (response) {
        const remainImageAmount =
          (organization?.remainImageAmount || 0) - response.accessImageAmount;
        const remainTokenAmount =
          (organization?.remainTokenAmount || 0) - response.accessTokenAmount;
        await organizationService.update(organization.organizationId, {
          remainImageAmount,
          remainTokenAmount,
        });
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
      if (!organization) {
        messageApi.error("Organization not found");
        setLoading(false);
        return;
      }
      const maxTokenAll = projectMembers.reduce(
        (per, total) => (total = per + total.maxToken),
        0,
      );
      const maxImageAll = projectMembers.reduce(
        (per, total) => (total = per + total.maxImages),
        0,
      );
      if (maxTokenAll > values.accessTokenAmount) {
        messageApi.error("Max token  is too high");
        setLoading(false);
        return;
      }
      if (maxImageAll > values.accessImageAmount) {
        messageApi.error(" Max image is too high");
        setLoading(false);
        return;
      }
      const projectData = {
        name: values.name,
        description: values.description,
        accessTokenAmount: values.accessTokenAmount,
        accessImageAmount: values.accessImageAmount,
        remainImageAmount: values.accessImageAmount - maxImageAll,
        remainTokenAmount: values.accessTokenAmount - maxTokenAll,
        members: projectMembers.filter((m) => m.userId),
      };

      const updateResponse = await projectService.update(
        values.id,
        projectData,
      );
      if (updateResponse) {
        const remainImageAmount =
          (organization?.remainImageAmount || 0) +
          (selectedProject?.accessImageAmount || 0) -
          updateResponse.accessImageAmount;
        const remainTokenAmount =
          (organization?.remainTokenAmount || 0) +
          (selectedProject?.accessTokenAmount || 0) -
          updateResponse.accessTokenAmount;
        await organizationService.update(organization.organizationId, {
          remainImageAmount,
          remainTokenAmount,
        });
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

  const fetchOrganizationMembers = async () => {
    try {
      if (organizationId) {
        const organization = await organizationService.findById(organizationId);
        console.log(organization);
        setOrganization(organization);
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
        );
        setProjects(response || []);
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
    router.push(`/page/project-new/${projectId}`);
  };



  return (
    <Spin spinning={loading}>

        {contextMessageHolder}
        {/* Header Section */}
        <Row align="middle" justify="space-between" gutter={[12, 12]} style={{ minHeight: isMobile ? 56 : 64, display: 'flex',padding: isMobile ? "16px" : "24px" , backgroundColor: semantic.colorBgContainer, borderBottom: `1px solid ${semantic.colorBorder}` }} >
          <Col flex="1" style={{ display: 'flex', alignItems: 'center' }}>
            <Typography.Title
              level={3}
              style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: isMobile ? 22 : undefined }}
            >
              Projects
              <Tag
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: isMobile ? "2px 8px" : "4px 10px",
                  borderRadius: 999,
                  backgroundColor: semantic.colorBgTextActive,
                  color: semantic.colorTextSecondary,
                  border: "none",
                  fontSize: isMobile ? 12 : 16,
                  fontWeight: 500,
                  lineHeight: 1,
                  marginInlineEnd: 0,
                }}
              >
                {projects.length}
              </Tag>
            </Typography.Title>
          </Col>
          <Col flex="none" style={{ display: 'flex', alignItems: 'center' }}>
          {canCreateProjects(organizationRole) && (
            <Button
              type="primary"
              size={isMobile ? "small" : "large"}
              icon={<PlusOutlined />}
              onClick={handleOpen}
              // style={{ backgroundColor: semantic.colorPrimary }}
              >
                New Project
              </Button>
            )}
          </Col>
        </Row>
        {/* <Divider style={{ margin: 0 }} /> */}
        {/* Filter/Search Section */}
        <Row align="middle" justify="space-between" gutter={[8, 8]} style={{ minHeight: 56, display: 'flex', padding: isMobile ? "16px" : "24px" , backgroundColor: semantic.colorBgContainer, borderBottom: `1px solid ${semantic.colorBorder}` }} >
          <Col xs={24} sm={16} md={18} lg={20} flex="1" style={{ display: 'flex', alignItems: 'center' }}>
            <Space
              size={isMobile ? 6 : 16}
              // direction={isMobile ? "vertical" : "horizontal"}
              style={{ width: "100%" }}
            >
              {isMobile ? (
                <Button
                  type="default"
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
                <Input
                  placeholder="Search project..."
                  style={{ width: 380, maxWidth: "100%", borderRadius: 10 }}
                  prefix={<SearchOutlined style={{ color: semantic.colorTextSecondary }} />}
                  // value={searchValue}
                  // onChange={e => setSearchValue(e.target.value)}
                />
              )}
              <Space size={isMobile ? 2 : 12} wrap>
                <Button
                  variant="outlined"
                  size={isMobile ? "small" : "middle"}
                  style={{
                    color: semantic.colorTextSecondary,
                    fontWeight: 500,
                  }}
                >All ({projects.length})</Button>
                <Button
                  variant="outlined"
                  size={isMobile ? "small" : "middle"}
                  style={{
                    color: semantic.colorTextSecondary,
                    fontWeight: 500,
                  }}
                >Active ({activeProjects})</Button>
                 <Button
                  variant="outlined"
                  size={isMobile ? "small" : "middle"}
                  style={{
                    color: semantic.colorTextSecondary,
                    fontWeight: 500,
                  }}
                >Inactive ({inactiveProjects})</Button>
              </Space>
            </Space>
          </Col>
          <Col xs={24} sm={8} md={6} lg={4} flex="none" style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
            <Space size={isMobile ? 8 : 16}>
              {!isMobile ? (
                <Typography.Text style={{ fontSize: 20, color: semantic.colorTextSecondary }}>{projects.length} projects</Typography.Text>
              ) : null}
              <Radio.Group
                value={viewType}
                onChange={e => setViewType(e.target.value)}
                style={{
                  background: 'transparent',
                  borderRadius: 8,
                  padding: isMobile ? '1px' : '3px',
                  border: `1px solid ${semantic.colorBorder}`,
                  display: 'flex',
                  gap: isMobile ? 2 : 4,
                }}
              >
                <Radio.Button
                  value="list"
                  style={{
                    background: viewType === 'list' ? semantic.colorPrimary : 'transparent',
                    color: viewType === 'list' ? '#fff' : semantic.colorTextBase,
                    borderRadius: isMobile ? 4 : 6,
                    width: isMobile ? 24 : 32,
                    height: isMobile ? 24 : 32,
                    padding: 0,
                    border: 'none',
                    transition: 'background 0.2s',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <UnorderedListOutlined style={{ fontSize: isMobile ? 14 : 20 }} />
                </Radio.Button>
                <Radio.Button
                  value="grid"
                  style={{
                    background: viewType === 'grid' ? semantic.colorPrimary : 'transparent',
                    color: viewType === 'grid' ? '#fff' : semantic.colorTextBase,
                    borderRadius: isMobile ? 4 : 6,
                    width: isMobile ? 24 : 32,
                    height: isMobile ? 24 : 32,
                    padding: 0,
                    border: 'none',
                    transition: 'background 0.2s',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <AppstoreOutlined style={{ fontSize: isMobile ? 14 : 20 }} />
                </Radio.Button>
              </Radio.Group>
            </Space>
          </Col>
        </Row>
        <Divider style={{ margin: 0 }} />
        {/* Project List Section */}
        {loading ? (
          <div className="text-center text-gray-400">Loading ...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <ProjectOutlined className="text-6xl text-gray-600 mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">No project yet</h3>
          </div>
        ) : viewType === 'grid' ? (
          <ProjectGridView
            projects={projects}
            semantic={semantic}
            onClickProject={onClickProject}
            formatDate={formatDate}
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
        {/* Modal Section */}
        {(open || openEdit) && (
          <Modal
            title={openEdit ? "Edit Team" : "Create Project"}
            open={open || openEdit}
            onCancel={openEdit ? handleCloseEdit : handleClose}
            footer={false}
            okText={openEdit ? "Edit Team" : "Create Project"}
            width={isMobile ? "92%" : 700}
          >
            <ProjectForm
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
            />
          </Modal>
        )}
        {/* Context Holder for Modal */}
        {contextHolder}

    </Spin>
  );
};

export default ProjectsPage;
