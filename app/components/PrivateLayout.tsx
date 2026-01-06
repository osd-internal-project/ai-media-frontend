"use client";
import {
  ConfigProvider,
  Layout,
  Menu,
  Image,
  Button,
  Form,
  Modal,
  Input,
  Select,
  theme,
  Spin,
} from "antd";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { renderMenuItems, MenuSider } from "../config/menu";
import Sider from "antd/es/layout/Sider";
import PrivateNavigation from "./PrivateNavigation";
import PrivateContent from "./PrivateContent";
import { signOut, useSession } from "next-auth/react";
import { PlusCircleOutlined, UserSwitchOutlined } from "@ant-design/icons";
import UserServices from "../services/users.service";
import ProjectService from "../services/project.service";
import { axiosCore, axiosUser } from "../lib/axios/axios";
import type { TUser } from "../common/user.type";
import type { IProject, ProjectMemberInput } from "../common/project.type";
import OrganizationService from "../services/organization.service";
import { IOrganization } from "../common/organization.type";
import { OrganizationProvider } from "../context/OrganizationContext";
import OrganizationMembersServices from "../services/organization-members.service";
import { checkRole } from "../utils/checkRole";
interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function PrivateLayout({ children }: ClientLayoutProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const pathname = usePathname();
  const currentPath = pathname.split("/")[2];
  const mappedPath = currentPath === "project" ? "project-layout" : currentPath;
  const currentPathSub = pathname.split("/")[3];
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editForm] = Form.useForm();
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();

  const userServices = UserServices(axiosUser);

  const organizationService = OrganizationService(axiosUser);
  const organizationMemberService = OrganizationMembersServices(axiosUser);
  const projectService = ProjectService(axiosCore);
  const [organizationMember, setOrganizationMember] = useState<TUser[]>([]);
  const [getProject, setProject] = useState<IProject[]>([]);
  // const [groupName, setGroupName] = useState<string>("");
  // const [roles, setRoles] = useState<string[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMemberInput[]>(
    []
  );
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<
    "OWNER" | "ADMIN" | "USER" | "VIEWER"
  >("USER");
  const [searchTexts, setSearchTexts] = useState<{ [key: number]: string }>({});
  // const filteredMenu = filterMenuByRole(MenuSider, roles);
  const [organizationId, setOrganizationId] = useState<string | undefined>();
  const [organizationRole, setOrganizationRole] = useState<string>("");
  const [teamOrganizations, setTeamOrganizations] = useState<IOrganization[]>(
    []
  );
  const [personalOrganizations, setPersonalOrganizations] = useState<
    IOrganization[]
  >([]);
  const [userProfile, setUserProfile] = useState<TUser | null>(null);
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
  // const searchParams = useSearchParams();
  // const urlOrganizationId = searchParams.get("organizationId");

  useEffect(() => {
    if (session?.user?.id) setLoading(true);
  }, [session?.user?.id]);

  // useEffect(() => {
  //   if (
  //     session?.user?.id &&
  //     urlOrganizationId &&
  //     userProfile &&
  //     urlOrganizationId !== userProfile.recentOrganizationId
  //   ) {
  //     handleOrganizationChange(urlOrganizationId);
  //   }
  // }, [session?.user?.id, urlOrganizationId, userProfile]);
  useEffect(() => {
    if (loading) {
      fecthdata();
    }
  }, [loading]);
  const fecthdata = async () => {
    await fetchdataUser();

    setLoading(false);
    // const response = await projectService.findAll(session?.user?.id as string);
    // setProject(response);
  };
  async function fecthdataByOrganization(organizationId: string) {
    setOrganizationId(organizationId);
    const organizationDetail =
      await organizationMemberService.findUserMemberByOrganization(
        organizationId,
        session?.user?.id as string
      );
    setOrganizationRole(organizationDetail?.role || "");
    const projects = await projectService.findByOrganizationId(
      organizationId,
      session?.user?.id as string
    );
    setProject(projects);
    const members = await userServices.findOrganizationUserDetails(
      organizationId
    );
    setOrganizationMember(members);
    setLoading(false);
  }

  const fetchdataUser = async () => {
    const userDetail = await userServices.findDetailByToken(
      session?.user?.id as string
    );
    setUserProfile(userDetail);
    const personalOrganizations = await organizationService.findManyByUserId(
      userDetail?.userId || "",
      { type: "personal" }
    );
    setPersonalOrganizations(personalOrganizations || []);

    const teamOrganizations = await organizationService.findManyByUserId(
      userDetail?.userId || "",
      { type: "team" }
    );
    setTeamOrganizations(teamOrganizations || []);
    // const userRoles = user?.roles?.map((r: any) => r.role.name) || [];

    // setRoles(userRoles || []);

    // setGroupName(userDetail.name);
    if (userDetail?.recentOrganizationId) {
      fecthdataByOrganization(userDetail?.recentOrganizationId);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (userProfile) {
      setSearchTexts((prev) => ({ 0: userProfile.fullname }));
      console.log(searchTexts);
      setProjectMembers([{ userId: userProfile.userId, role: "ADMIN" }]);
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

  const handleRemoveMember = (userId: string) => {
    setProjectMembers(projectMembers.filter((m) => m.userId !== userId));
  };

  const handleRoleChange = (
    userId: string,
    role: "ADMIN" | "USER" | "VIEWER"
  ) => {
    setProjectMembers(
      projectMembers.map((m) => (m.userId === userId ? { ...m, role } : m))
    );
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
    editForm.resetFields();
    setProjectMembers([]);
    setSearchTexts({});
  };

  const onFinish = async (values: any) => {
    const projectData = {
      ...values,
      members: projectMembers.filter((m) => m.userId), // Only include members with selected users
      organizationId: organizationId,
    };

    const response = await projectService.create({
      ...projectData,
      organizationId: organizationId,
    });
    if (response) {
      setOpen(false);
      setLoading(true);
      setProjectMembers([]);
      form.resetFields();
    }
  };
  const onFinishEdit = async (values: any) => {
    const projectData = {
      ...values,
      members: projectMembers.filter((m) => m.userId), // Only include members with selected users
    };

    const response = await projectService.update(values.id, projectData);
    if (response) {
      setOpenEdit(false);
      setLoading(true);
      setProjectMembers([]);
    }
  };
  const onClickProjectAction = (action: string, project: IProject) => {
    console.log("click", action, project);
    if (action === "edit") {
      setOpenEdit(true);
      const members =
        project.members.map((member: any) => ({
          userId: member.userId,
          role: member.role || "USER",
        })) || [];
      setProjectMembers(members);

      // Pre-populate search texts with user names for existing members
      const initialSearchTexts: { [key: number]: string } = {};
      members.forEach((member: any, index: number) => {
        const user = organizationMember.find((u) => u.userId === member.userId);
        if (user) {
          initialSearchTexts[index] = user.fullname;
        }
      });
      setSearchTexts(initialSearchTexts);

      editForm.setFieldsValue({ ...project });
    }
    if (action === "delete") {
      // router.push(`/page/project/${project.id}`);
      modal.confirm({
        title: "Delete Project",
        content: "Are you sure you want to delete this project?",
        onOk: () => {
          projectService.update(project.id, { status: "deleted" });
          setLoading(true);
        },
      });
    }
  };
  const content = (
    <div className="flex flex-col gap-2">
      <p style={{ marginBottom: 8 }}></p>
      <Button
        type="default"
        block
        size="small"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Sign Out
      </Button>
    </div>
  );
  /* Create Organization Modal */
  const [openCreateOrg, setOpenCreateOrg] = useState(false);
  const [createOrgForm] = Form.useForm();

  const handleOpenCreateOrg = () => setOpenCreateOrg(true);
  const handleCloseCreateOrg = () => {
    setOpenCreateOrg(false);
    createOrgForm.resetFields();
  };

  const onFinishCreateOrg = async (values: any) => {
    const payload = {
      ...values,
      type: "team",
      createdById: userProfile?.userId || "",
      slug: values.name.toLowerCase().replace(/ /g, "-"),
    };
    const response = await organizationService.createOwner(payload);
    if (response) {
      setOpenCreateOrg(false);
      createOrgForm.resetFields();
      setLoading(true); // Trigger data refresh
    }
  };

  async function handleOrganizationChange(
    organizationId: string
  ): Promise<void> {
    // console.log(organizationId);
    const response = await userServices.updateDetailByToken(
      session?.user?.id as string,
      {
        recentOrganizationId: organizationId,
      }
    );
    fecthdataByOrganization(organizationId);
    if (response) {
      router.push(`/page/project-layout`);
    }
  }
  if (!session?.user.id) {
    return (
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorBgBase: "#000000",
            colorBgContainer: "#000000",
            colorBgElevated: "#1a1a1a",
            colorTextBase: "#f0f0f0",
          },
        }}
      >
        <Layout className="h-screen overflow-hidden">
          <Spin spinning={true}></Spin>
        </Layout>
      </ConfigProvider>
    );
  }

  const isAdminRoute = pathname.startsWith("/page/admin-management");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  function handleManageOrg(): void {
    router.push(`/page/organization`);
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgBase: "#000000",
          colorBgContainer: "#000000",
          colorBgElevated: "#1a1a1a",
          colorTextBase: "#f0f0f0",
        },
        components: {
          Button: {
            boxShadow: "none",
            defaultShadow: "none",
            primaryShadow: "none",
          },
          Menu: {
            itemBg: "transparent",
            itemColor: "white",
            itemHoverBg: "#363A3D",
            itemHoverColor: "white",
            itemSelectedBg: "transparent",
            itemSelectedColor: "white",
            itemDisabledColor: "#white",
          },
          Layout: {
            siderBg: "#0f0f0f",
          },
          Select: {
            selectorBg: "#151515",
            colorBgContainer: "#151515",
            colorText: "white",
            colorTextPlaceholder: "#777",
            colorBorder: "#333",
            colorBgElevated: "#1e1e1e",
            optionActiveBg: "#333",
            optionSelectedBg: "#gg",
          },
        },
      }}
    >
      <Spin spinning={loading}>
        {contextHolder}
        {openCreateOrg ? (
          <Modal
            title="Create Organization (Team)"
            open={openCreateOrg}
            onCancel={handleCloseCreateOrg}
            footer={false}
            width={500}
          >
            <Form
              form={createOrgForm}
              layout="vertical"
              name="create_org_form"
              onFinish={onFinishCreateOrg}
            >
              <Form.Item
                label="Organization Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter organization name" },
                ]}
              >
                <Input placeholder="Enter organization name" />
              </Form.Item>
              <Form.Item label="Description" name="description">
                <Input.TextArea rows={3} placeholder="Optional description" />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                Create Organization
              </Button>
            </Form>
          </Modal>
        ) : null}
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
                rules={[
                  { required: true, message: "Please enter project name" },
                ]}
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
                                  ? organizationMember
                                    .filter(
                                      (u) =>
                                        !projectMembers.find(
                                          (m, i) =>
                                            m.userId === u.userId &&
                                            i !== index
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
                              onChange={(
                                role: "OWNER" | "ADMIN" | "USER" | "VIEWER"
                              ) => {
                                const newMembers = [...projectMembers];
                                newMembers[index].role = role;
                                setProjectMembers(newMembers);
                              }}
                              options={[
                                { value: "OWNER", label: "Owner" },
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
              <Button
                type="primary"
                htmlType="submit"
              >{`Create Project`}</Button>
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
                rules={[
                  { required: true, message: "Please enter project name" },
                ]}
              >
                <Input placeholder="Enter project id" />
              </Form.Item>
              <Form.Item
                label="Project Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter project name" },
                ]}
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
                                  ? organizationMember
                                    .filter(
                                      (u) =>
                                        !projectMembers.find(
                                          (m, i) =>
                                            m.userId === u.userId &&
                                            i !== index
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
                              onChange={(
                                role: "OWNER" | "ADMIN" | "USER" | "VIEWER"
                              ) => {
                                const newMembers = [...projectMembers];
                                newMembers[index].role = role;
                                setProjectMembers(newMembers);
                              }}
                              options={[
                                { value: "OWNER", label: "Owner" },
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
        <Layout className="h-screen overflow-hidden">
          <Sider
            width={90}
            trigger={null}
            collapsible
            // collapsed={true}
            className="hidden md:block p-2 h-screen"
          >
            <div className="bg-black rounded-2xl h-full flex flex-col">
              {/* Logo at top of sidebar */}
              <div className="w-full flex justify-center items-center py-5 flex-shrink-0">
                <Image
                  width={"120px"}
                  src="/images/Logo.png"
                  alt="OSD Logo"
                  preview={false}
                  className="mb-2"
                />
              </div>
              {/* Admin Management Button */}
              <div className="w-full text-[#F0F0F073] line-height-[16px] text-[12px] px-2">
                {/* {checkRole(["ADMIN", "OWNER"], organizationRole) && (
                  <>
                    <div className="w-full text-[#F0F0F073] line-height-[16px] text-[12px] px-2">
                      ADMIN
                    </div>
                    <div className="mt-3 w-full">
                      <Button
                        icon={<UserSwitchOutlined />}
                        // type="primary"
                        onClick={() => router.push("/page/admin-management")}
                      >
                        Admin
                      </Button>
                    </div>
                  </>
                )} */}
              </div>
              {organizationId && (
                <div className="flex-1 overflow-y-auto hide-scrollbar overflow-x-hidden">
                  <Menu
                    // mode="inline"
                    selectedKeys={[
                      mappedPath,
                      `${mappedPath}/${currentPathSub}`,
                    ]}
                    defaultSelectedKeys={[
                      mappedPath,
                      `${mappedPath}/${currentPathSub}`,
                    ]}
                    items={renderMenuItems(MenuSider, organizationRole)}
                  // inlineCollapsed={true}
                  />
                  {/* <div className="!text-gray-400 px-4 mt-2">
                    <div className="text-[12px]">{`PROJECT`}</div>
                    {checkRole(["ADMIN", "OWNER"], organizationRole) && (
                      <div className="mt-3 w-full">
                        <Button
                          icon={<PlusCircleOutlined />}
                          className="w-full"
                          onClick={handleOpen}
                        >
                          {`Add new project`}
                        </Button>
                      </div>
                    )}
                    <div>
                      {getProject?.map((project) => (
                        <div
                          key={project.id}
                          className="w-full  justify-center mt-2 gap-4"
                        >
                          <Space.Compact className=" w-full">
                            <Button
                              className="w-full !bg-gray-800 !whitespace-normal !break-words !h-auto !p-2 !text-center"
                              onClick={() =>
                                router.push(`/page/project/${project.id}`)
                              }
                            >
                              <Space>
                                {project.name}{" "}
                                {project.status === "deleted" && (
                                  <Tag color="red">Deleted</Tag>
                                )}
                              </Space>
                            </Button>
                            {checkRole(
                              ["ADMIN", "OWNER"],
                              organizationRole
                            ) && (
                              <Dropdown
                                menu={{
                                  items: projectActionItems,
                                  onClick: (e) =>
                                    onClickProjectAction(e.key, project),
                                }}
                                placement="bottomRight"
                              >
                                <Button
                                  className="!h-auto flex items-center"
                                  icon={<EllipsisVertical size={16} />}
                                />
                              </Dropdown>
                            )}
                          </Space.Compact>
                        </div>
                      ))}
                    </div>
                  </div> */}
                </div>
              )}
              {/* <div className="bg-black rounded-2xl p-4 flex items-center gap-5 flex-shrink-0 mt-3">
                <Badge dot color="green">
                  <Avatar />
                </Badge>
                <div className="grid grid-cols-1">
                  <span className="text-white text-sm">{`${session?.user?.name}`}</span>
                  <span className="text-[#6366F1]">Premium</span>
                </div>
                <>
                  <Popover
                    content={content}
                    trigger="click"
                    placement="bottomRight"
                    title={false}
                  >
                    <Button
                      type="default"
                      size="small"
                      icon={<SettingOutlined />}
                    />
                  </Popover>
                </>
              </div> */}
              {/* {groupName !== "admin-user" ? (
              <div className="bg-black rounded-2xl p-4 flex items-center gap-5 flex-shrink-0 mt-3">
                <Badge dot color="green">
                  <Avatar />
                </Badge>
                <div className="grid grid-cols-1">
                  <span className="text-white text-sm">{`${session?.user?.name}`}</span>
                  <span className="text-[#6366F1]">Premium</span>
                </div>
                <>
                  <Popover
                    content={content}
                    trigger="click"
                    placement="bottomRight"
                    title={false}
                  >
                    <Button
                      type="default"
                      size="small"
                      icon={<SettingOutlined />}
                    />
                  </Popover>
                </>
              </div>
            ) : null} */}
            </div>
          </Sider>
          <Layout className="flex-1 w-full h-full overflow-hidden">
            <PrivateNavigation
              organizationRole={organizationRole}
              user={
                userProfile
                  ? { fullname: userProfile.fullname ?? "" }
                  : undefined
              }
              organizationId={organizationId}
              personalOrganizations={personalOrganizations}
              teamOrganizations={teamOrganizations}
              handleOrganizationChange={handleOrganizationChange}
              handleOpenCreateOrg={handleOpenCreateOrg}
              handleManageOrg={handleManageOrg}
            />
            <div className="w-full h-screen p-2  overflow-y-auto">
              <PrivateContent user={userProfile ? userProfile : undefined}>
                <OrganizationProvider
                  value={{ organizationId, organizationRole }}
                >
                  {children}
                </OrganizationProvider>
              </PrivateContent>
            </div>
          </Layout>
        </Layout>
      </Spin>
      <style>{`
        /* Dark Select Styling */
        .dark-select .ant-select-selector {
          background-color: #27272a !important;
          border: 1px solid #3f3f46 !important;
          color: #d1d5db !important;
        }

        .dark-select .ant-select-selection-item {
          color: #d1d5db !important;
        }

        .dark-select .ant-select-selection-placeholder {
          color: #6b7280 !important;
        }

        .dark-select:hover .ant-select-selector {
          border-color: #52525b !important;
        }

        .dark-select.ant-select-focused .ant-select-selector {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
        }

        .dark-select .ant-select-arrow {
          color: #9ca3af !important;
        }

        /* Custom Sidebar Menu Styling */
        .ant-menu-item-selected .menu-icon-container {
          background-color: #1677ff; 
          border-radius: 8px; 
          padding: 8px;
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .menu-text-label {
          color:gray !important;
        }
        .ant-menu-item-selected .menu-text-label {
          font-weight: bold !important;
          color: white !important; 
        }
  
        /* Remove ALL sidebar borders and lines */
        .ant-layout-sider,
        .ant-layout-sider *,
        .ant-layout-sider::before,
        .ant-layout-sider::after {
          border: none !important;
          border-right: none !important;
          border-left: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        
        /* Force transparent borders on layout */
        .ant-layout {
          border: none !important;
        }
        
        /* Ensure icon container is centered and has spacing */
        .menu-icon-container {
          padding: 8px;
          border-radius: 8px;
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
     

      `}</style>
    </ConfigProvider>
  );
}
