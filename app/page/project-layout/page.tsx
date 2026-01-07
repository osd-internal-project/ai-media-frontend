"use client";

import React, { useEffect, useState } from "react";
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
} from "antd";
import {
  PlusOutlined,
  ProjectOutlined,
  TeamOutlined,
  CalendarOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { EllipsisVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { IProject } from "@/app/common/project.type";
import ProjectService from "@/app/services/project.service";
import UserServices from "@/app/services/users.service";
import { useOrganization } from "@/app/context/OrganizationContext";
import { axiosCore, axiosUser } from "@/app/lib/axios/axios";
import { checkRole } from "../../utils/checkRole";

const ProjectsPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { organizationId, organizationRole } = useOrganization();

  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [organizationMembers, setOrganizationMembers] = useState<any[]>([]);
  const [searchTexts, setSearchTexts] = useState<{ [key: number]: string }>({});
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "USER" | "VIEWER">(
    "USER"
  );
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const [editForm] = Form.useForm();

  const projectService = ProjectService(axiosCore);
  const userServices = UserServices(axiosUser);

  const projectActionItems = [
    {
      key: "edit",
      label: "Edit",
    },
    {
      key: "delete",
      label: "Delete",
    },
  ];

  const onClickProjectAction = (action: string, project: IProject) => {
    console.log("click", action, project);
    if (action === "edit") {
      console.log(
        "Opening edit for project:",
        project.name,
        "Members:",
        project.members
      );

      setOpenEdit(true);
      const members =
        project.members?.map((member: any) => ({
          userId: member.userId,
          role: member.role || "USER",
        })) || [];
      console.log("Setting project members:", members);
      setProjectMembers(members);

      const initialSearchTexts: { [key: number]: string } = {};
      members.forEach((member: any, index: number) => {
        const user = organizationMembers.find(
          (u) => u.userId === member.userId
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
            await projectService.update(project.id, { status: "deleted" });
            message.success("Project deleted successfully");
            fetchProjects();
          }
          deleteProject();
          projectService.update(project.id, { status: "deleted" });
          setLoading(true);
        },
      });
    }
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(true);
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

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
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
        message.success("Project created successfully");
        setOpen(false);
        setProjectMembers([]);
        form.resetFields();
        fetchProjects();
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      message.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const onFinishEdit = async (values: any) => {
    try {
      const projectData = {
        name: values.name,
        description: values.description,
        members: projectMembers.filter((m) => m.userId),
      };
      console.log("Sending project update with members:", projectData.members);
      console.log("Original projectMembers array:", projectMembers);

      const updateResponse = await projectService.update(
        values.id,
        projectData
      );
      console.log("Backend update response:", updateResponse);
      message.success("Project updated successfully");
      setOpenEdit(false);
      setProjectMembers([]);
      fetchProjects();
    } catch (error) {
      console.error("Failed to update project:", error);
      message.error("Failed to update project");
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProfile();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (organizationId) {
      fetchProjects();
      fetchOrganizationMembers();
    }
  }, [organizationId]);

  const fetchOrganizationMembers = async () => {
    try {
      if (organizationId) {
        const response = await userServices.findOrganizationUserDetails(
          organizationId
        );
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
          session.user.id
        );
        setProjects(response || []);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      message.error("Failed to load projects");
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

  return (
    <div className="p-6 bg-black text-white h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Projects
          </h1>
        </div>
        {checkRole(["ADMIN", "OWNER"], organizationRole) && (
          <Button
            size="large"
            icon={<PlusOutlined />}
            onClick={handleOpen}
            style={{ backgroundColor: "#1A1A1A", borderColor: "#3f3f46" }}
            className="!border-zinc-700 hover:!border-zinc-500 !text-white hover:!text-white hover:!bg-zinc-800 transition-all duration-300 hover:shadow-md"
          >
            Create Project
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center text-gray-400">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <ProjectOutlined className="text-6xl text-gray-600 mb-4" />
          <h3 className="text-xl text-gray-400 mb-2">No projects yet</h3>
        </div>
      ) : (
        <Row gutter={[12, 12]}>
          {projects.map((project) => (
            <Col xs={24} sm={12} lg={8} key={project.id}>
              <div
                className="group relative rounded-xl p-4 hover:bg-zinc-700/50 hover:scale-100 hover:shadow-lg hover:shadow-zinc-400/10 transition-all duration-300 cursor-pointer hover:border-zinc-500/60 h-full flex flex-col border border-zinc-700/50"
                style={{ backgroundColor: "#18181B" }}
                onClick={() => router.push(`/page/project/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-200 group-hover:shadow-md">
                        <ProjectOutlined className="text-sm text-white" />
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        {project.name && project.name.length > 20 ? (
                          <Tooltip
                            title={project.name}
                            placement="top"
                            mouseEnterDelay={0.5}
                          >
                            <h3 className="text-lg font-semibold text-white truncate min-w-0">
                              {project.name}
                            </h3>
                          </Tooltip>
                        ) : (
                          <h3 className="text-lg font-semibold text-white truncate min-w-0">
                            {project.name}
                          </h3>
                        )}
                        {project.status === "deleted" ? (
                          <span className="inline-block w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                        ) : (
                          <span className="inline-block w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {checkRole(["ADMIN", "OWNER"], organizationRole) && (
                    <div className="flex-shrink-0">
                      <Dropdown
                        menu={{
                          items: projectActionItems,
                          onClick: (e) => {
                            e.domEvent.stopPropagation();
                            onClickProjectAction(e.key, project);
                          },
                        }}
                        placement="bottomRight"
                      >
                        <Button
                          className="!h-auto flex items-center text-gray-400 hover:text-white hover:bg-gray-700"
                          type="text"
                          size="small"
                          icon={<EllipsisVertical size={16} />}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Dropdown>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.description || "No description provided"}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                  {/* <div className="flex items-center space-x-1">
                    <UserOutlined />
                    <span>{getUserRole(project)}</span>
                  </div> */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <TeamOutlined />
                      <span>{project.members?.length || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CalendarOutlined />
                      <span>{formatDate(project.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {open ? (
        <Modal
          title="Add Project"
          open={open}
          onCancel={handleClose}
          footer={false}
          okText="Submit"
          width={500}
        >
          <Form
            form={form}
            layout="vertical"
            name="create_project_form"
            onFinish={onFinish}
          >
            <Form.Item
              label="Project Name"
              name="name"
              rules={[{ required: true, message: "Please enter project name" }]}
            >
              <Input placeholder="Enter project name" />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea rows={3} placeholder="Optional description" />
            </Form.Item>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontWeight: "normal",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                Team Members
              </span>
              <Button
                type="primary"
                size="small"
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  setProjectMembers([
                    ...projectMembers,
                    { userId: "", role: "USER" },
                  ]);
                }}
              >
                Add Member
              </Button>
            </div>
            <Form.Item>
              <div>
                {projectMembers.length > 0 && (
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginBottom: "8px",
                      }}
                    >
                      Team Members (
                      {projectMembers.filter((m) => m.userId).length})
                    </div>
                    {projectMembers.map((member, index) => {
                      return (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <Select
                            showSearch
                            placeholder="Type to search users..."
                            value={member.userId || undefined}
                            style={{ flex: 1, marginRight: "8px" }}
                            filterOption={false}
                            onSearch={(searchText) => {
                              setSearchTexts((prev) => ({
                                ...prev,
                                [index]: searchText,
                              }));
                            }}
                            onChange={(userId: string) => {
                              if (
                                userId &&
                                !projectMembers.find(
                                  (m, i) => m.userId === userId && i !== index
                                )
                              ) {
                                const newMembers = [...projectMembers];
                                newMembers[index].userId = userId;
                                setProjectMembers(newMembers);
                              }
                            }}
                            options={
                              searchTexts[index] &&
                              searchTexts[index].length > 0
                                ? organizationMembers
                                    .filter(
                                      (u) =>
                                        !projectMembers.find(
                                          (m, i) =>
                                            m.userId === u.userId && i !== index
                                        ) &&
                                        u.fullname
                                          .toLowerCase()
                                          .includes(
                                            searchTexts[index].toLowerCase()
                                          )
                                    )
                                    .map((e) => ({
                                      value: e.userId,
                                      label: e.fullname,
                                    }))
                                : []
                            }
                          />
                          <Select
                            value={member.role}
                            style={{ width: 80, marginRight: "8px" }}
                            onChange={(role: "ADMIN" | "USER" | "VIEWER") => {
                              const newMembers = [...projectMembers];
                              newMembers[index].role = role;
                              setProjectMembers(newMembers);
                            }}
                            options={[
                              { value: "ADMIN", label: "Admin" },
                              { value: "USER", label: "User" },
                              { value: "VIEWER", label: "Viewer" },
                            ]}
                          />
                          <Button
                            size="small"
                            type="text"
                            danger
                            onClick={() => {
                              setProjectMembers(
                                projectMembers.filter((_, i) => i !== index)
                              );
                              const newSearchTexts: {
                                [key: number]: string;
                              } = {};
                              Object.keys(searchTexts).forEach((key) => {
                                const oldIndex = parseInt(key);
                                if (oldIndex < index) {
                                  newSearchTexts[oldIndex] =
                                    searchTexts[oldIndex];
                                } else if (oldIndex > index) {
                                  newSearchTexts[oldIndex - 1] =
                                    searchTexts[oldIndex];
                                }
                              });
                              setSearchTexts(newSearchTexts);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Form.Item>
            <Button type="primary" htmlType="submit">{`Create Project`}</Button>
          </Form>
        </Modal>
      ) : null}
      {openEdit ? (
        <Modal
          title="Edit Project"
          open={openEdit}
          onCancel={handleCloseEdit}
          footer={false}
          width={500}
        >
          <Form
            form={editForm}
            layout="vertical"
            name="create_project_form"
            onFinish={onFinishEdit}
          >
            <Form.Item
              label="ID"
              name="id"
              hidden
              rules={[{ required: true, message: "Please enter project name" }]}
            >
              <Input placeholder="Enter project id" />
            </Form.Item>
            <Form.Item
              label="Project Name"
              name="name"
              rules={[{ required: true, message: "Please enter project name" }]}
            >
              <Input placeholder="Enter project name" />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea rows={3} placeholder="Optional description" />
            </Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontWeight: "normal",
                  color: "rgba(255, 255, 255, 0.85)",
                }}
              >
                Team Members
              </span>
              <Button
                type="primary"
                size="small"
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  setProjectMembers([
                    ...projectMembers,
                    { userId: "", role: "USER" },
                  ]);
                }}
              >
                Add Member
              </Button>
            </div>

            <Form.Item>
              <div>
                {/* Selected Members List */}
                {projectMembers.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-400 mb-2">
                      Team Members (
                      {projectMembers.filter((m) => m.userId).length})
                    </div>
                    {projectMembers.map((member, index) => {
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between mb-2"
                        >
                          <Select
                            showSearch
                            placeholder="Type to search users..."
                            value={member.userId || undefined}
                            style={{ flex: 1, marginRight: "8px" }}
                            filterOption={false}
                            onSearch={(searchText) => {
                              setSearchTexts((prev) => ({
                                ...prev,
                                [index]: searchText,
                              }));
                            }}
                            onChange={(userId: string) => {
                              if (
                                userId &&
                                !projectMembers.find(
                                  (m, i) => m.userId === userId && i !== index
                                )
                              ) {
                                const newMembers = [...projectMembers];
                                newMembers[index].userId = userId;
                                setProjectMembers(newMembers);
                              }
                            }}
                            options={
                              searchTexts[index] &&
                              searchTexts[index].length > 0
                                ? organizationMembers
                                    .filter(
                                      (u) =>
                                        !projectMembers.find(
                                          (m, i) =>
                                            m.userId === u.userId && i !== index
                                        ) &&
                                        u.fullname
                                          .toLowerCase()
                                          .includes(
                                            searchTexts[index].toLowerCase()
                                          )
                                    )
                                    .map((e) => ({
                                      value: e.userId,
                                      label: e.fullname,
                                    }))
                                : []
                            }
                          />
                          <Select
                            value={member.role}
                            style={{ width: 80, marginRight: "8px" }}
                            onChange={(role: "ADMIN" | "USER" | "VIEWER") => {
                              const newMembers = [...projectMembers];
                              newMembers[index].role = role;
                              setProjectMembers(newMembers);
                            }}
                            options={[
                              { value: "ADMIN", label: "Admin" },
                              { value: "USER", label: "User" },
                              { value: "VIEWER", label: "Viewer" },
                            ]}
                          />
                          <Button
                            size="small"
                            type="text"
                            danger
                            onClick={() => {
                              setProjectMembers(
                                projectMembers.filter((_, i) => i !== index)
                              );
                              const newSearchTexts: {
                                [key: number]: string;
                              } = {};
                              Object.keys(searchTexts).forEach((key) => {
                                const oldIndex = parseInt(key);
                                if (oldIndex < index) {
                                  newSearchTexts[oldIndex] =
                                    searchTexts[oldIndex];
                                } else if (oldIndex > index) {
                                  newSearchTexts[oldIndex - 1] =
                                    searchTexts[oldIndex];
                                }
                              });
                              setSearchTexts(newSearchTexts);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Form.Item>
            <Button type="primary" htmlType="submit">{`Edit Project`}</Button>
          </Form>
        </Modal>
      ) : null}
      {contextHolder}
    </div>
  );
};

export default ProjectsPage;
