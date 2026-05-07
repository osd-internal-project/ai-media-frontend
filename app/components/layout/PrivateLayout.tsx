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
  InputNumber,
  Row,
  Col,
} from "antd";
import { useEffect, useState } from "react";
import { notFound, usePathname, useRouter } from "next/navigation";
import { renderMenuItems, MenuSider } from "../../config/menu";
import Sider from "antd/es/layout/Sider";
import PrivateNavigation from "./../PrivateNavigation";
import { signOut, useSession } from "next-auth/react";
import { PlusCircleOutlined } from "@ant-design/icons";
import UserServices from "../../services/users.service";
import ProjectService from "../../services/project.service";
import { axiosCore, axiosUser } from "../../lib/axios/axios";
import type { TUser } from "../../common/user.type";
import type { IProject, ProjectMemberInput } from "../../common/project.type";
import OrganizationService from "../../services/organization.service";
import { ICreditBalance, IOrganization } from "../../common/organization.type";
import { OrganizationProvider } from "../../context/OrganizationContext";
import OrganizationMembersServices from "../../services/organization-members.service";
import { PrivateHeader } from "./../layout/PrivateHeader";
import PrivateSider from "./../layout/PrivateSider";
import PrivateContent from "./../layout/PrivateContent";
import UseCouponModal from "../UseCouponModal";
import useResponsive from "@/app/hooks/useResponsive";
import { useThemeMode } from "../ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import CreditBalanceServices from "@/app/services/credit-balance.service";
import CouponService from "@/app/services/coupon.service";
import "./LayoutStyle.css";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function PrivateLayout({ children }: ClientLayoutProps) {
  const router = useRouter();
  const { isMobile,isTablet } = useResponsive();
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const { data: session, update: updateSession } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [mobileSiderOpen, setMobileSiderOpen] = useState(false);

  const pathname = usePathname();
  const currentPath = pathname.split("/")[2];
  const mappedPath = currentPath === "project" ? "project" : currentPath;
  const currentPathSub = pathname.split("/")[3];
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editForm] = Form.useForm();
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();

  const userServices = UserServices(axiosUser);

  const organizationService = OrganizationService(axiosUser);
  const organizationMemberService = OrganizationMembersServices(axiosUser);
  const creditฺBalanceService = CreditBalanceServices(axiosUser);
  const couponService = CouponService(axiosUser);
  const [organizationMember, setOrganizationMember] = useState<TUser[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<
    IOrganization | undefined
  >();
  const [creditBalance, setCreditBalance] = useState<
    ICreditBalance | undefined
  >(undefined);
  // const [getProject, setProject] = useState<IProject[]>([]);
  // const [projectMembers, setProjectMembers] = useState<ProjectMemberInput[]>(
  //   [],
  // );
  // const [showAddMember, setShowAddMember] = useState(false);
  // const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<
    "OWNER" | "ADMIN" | "USER" | "VIEWER"
  >("USER");
  const [searchTexts, setSearchTexts] = useState<{ [key: number]: string }>({});
  const [organizationId, setOrganizationId] = useState<string>("");
  const [organizationRole, setOrganizationRole] = useState<string>("");

  const [teamOrganizations, setTeamOrganizations] = useState<IOrganization[]>(
    [],
  );
  const [personalOrganizations, setPersonalOrganizations] = useState<
    IOrganization[]
  >([]);
  const [userProfile, setUserProfile] = useState<TUser | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState<boolean>(false);
  const [couponLoading, setCouponLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isMobile) {
      setMobileSiderOpen(false);
    }
  }, [pathname, isMobile]);

  useEffect(() => {
    if (session?.user?.id) setLoading(true);
  }, [session?.user?.id]);

  useEffect(() => {
    if (loading) {
      fecthdata();
    }
  }, [loading]);
  const fecthdata = async () => {
    await fetchdataUser();

    setLoading(false);
  };
  async function fecthdataByOrganization(organizationId: string) {
    setOrganizationId(organizationId);
    const organizationDetail =
      await organizationMemberService.findUserMemberByOrganization(
        organizationId,
        session?.user?.id as string,
      );
    const role = organizationDetail?.role
      ? organizationDetail?.role
      : session?.user?.systemRole === "SUPER_ADMIN"
        ? "SUPER_ADMIN"
        : "";
    setOrganizationRole(role);

    const members =
      await userServices.findOrganizationUserDetails(organizationId);
    setOrganizationMember(members);
    setLoading(false);
  }

  const fetchdataUser = async () => {
    const userDetail = await userServices.findDetailByToken(
      session?.user?.id as string,
    );
    setUserProfile(userDetail);

    const personalOrganizations = await organizationService.findManyByUserId(
      userDetail?.userId || "",
      { type: "personal" },
    );
    setPersonalOrganizations(personalOrganizations || []);

    const teamOrganizations = await organizationService.findManyByUserId(
      userDetail?.userId || "",
      { type: "team" },
    );
    setTeamOrganizations(teamOrganizations || []);

    // const userRoles = user?.roles?.map((r: any) => r.role.name) || [];

    // setRoles(userRoles || []);

    // setGroupName(userDetail.name);
    if (userDetail?.recentOrganizationId) {
      const organization = [
        ...personalOrganizations,
        ...teamOrganizations,
      ].find((org) => org.organizationId === userDetail?.recentOrganizationId);
      if (organization) {
        setCurrentOrganization(organization);
        const credit = await creditฺBalanceService.findByOrganizationId(
          userDetail?.recentOrganizationId,
        );
        setCreditBalance(credit);
      }
      fecthdataByOrganization(userDetail?.recentOrganizationId);
    }
  };

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
      remainTokenAmount: values.packageTokenAmount,
      remainImageAmount: values.packageImageAmount,
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
  function handleManageOrg(): void {
    router.push(`/page/organization`);
  }
  async function handleOrganizationChange(
    organizationId: string,
  ): Promise<void> {
    // console.log(organizationId);
    setReload(true);

    await userServices
      .updateDetailByToken(session?.user?.id as string, {
        recentOrganizationId: organizationId,
      })
      .then(async () => {
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            organizationId: organizationId,
          },
        });
      })
      .finally(() => {
        setReload(false);
        window.location.href = "/page/project";
      });
  }

  if (!session?.user.id) {
    return (
      // <ConfigProvider
      //   theme={{
      //     algorithm: theme.darkAlgorithm,
      //     token: {
      //       colorBgBase: "#000000",
      //       colorBgContainer: "#000000",
      //       colorBgElevated: "#1a1a1a",
      //       colorTextBase: "#f0f0f0",
      //     },
      //   }}
      // >
      <Layout
        className="h-screen overflow-hidden"
        style={{ position: "relative" }}
      >
        <Spin spinning={true}></Spin>
      </Layout>
      // </ConfigProvider>
    );
  }

  const isAdminRoute = pathname.startsWith("/page/admin-management");

  // if (isAdminRoute) {
  //   return (
  //     // <ConfigProvider
  //     //   theme={{
  //     //     algorithm: theme.darkAlgorithm,
  //     //     token: {
  //     //       colorBgBase: "#000000",
  //     //       colorBgContainer: "#000000",
  //     //       colorBgElevated: "#1a1a1a",
  //     //       colorTextBase: "#f0f0f0",
  //     //     },
  //     //   }}
  //     // >
  //     <Spin spinning={loading || reload}>
  //       <OrganizationProvider
  //         value={{
  //           organizationRole,
  //         }}
  //       >
  //         {children}
  //       </OrganizationProvider>
  //     </Spin>
  //     // </ConfigProvider>
  //   );
  // }
  
  if (isAdminRoute && session?.user?.systemRole !== "SUPER_ADMIN") {
    notFound();
  }

  // Use Coupon

  const handleCouponSubmit = async (values: { code: string }) => {
    if (!organizationId || !session?.user?.userId) {
      modal.error({
        title: "Error",
        content: "Session expired or missing organization information",
      });
      return;
    }

    setCouponLoading(true);
    try {
      await couponService.useCoupon({
        code: values.code,
        organizationId: organizationId,
        userId: session?.user?.userId,
      });
      modal.success({
        title: "Success",
        content: "Coupon applied successfully!",
      });
      setIsCouponModalOpen(false);
      // Reload page to update credit balance
      window.location.reload();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Failed to apply coupon";
      modal.error({
        title: "Error",
        content: errorMsg,
      });
    } finally {
      setCouponLoading(false);
    }
  };
  //User Pages

  return (
    // <ConfigProvider
    //   theme={{
    //     algorithm: theme.darkAlgorithm,
    //     token: {
    //       colorBgBase: "#000000",
    //       colorBgContainer: "#000000",
    //       colorBgElevated: "#1a1a1a",
    //       colorTextBase: "#f0f0f0",
    //     },
    //     components: {
    //       Button: {
    //         boxShadow: "none",
    //         defaultShadow: "none",
    //         primaryShadow: "none",
    //       },
    //       Menu: {
    //         itemBg: "transparent",
    //         itemColor: "white",
    //         itemHoverBg: "#363A3D",
    //         itemHoverColor: "white",
    //         itemSelectedBg: "transparent",
    //         itemSelectedColor: "white",
    //         itemDisabledColor: "#white",
    //       },
    //       Layout: {
    //         siderBg: "#0f0f0f",
    //       },
    //       Select: {
    //         selectorBg: "#151515",
    //         colorBgContainer: "#151515",
    //         colorText: "white",
    //         colorTextPlaceholder: "#777",
    //         colorBorder: "#333",
    //         colorBgElevated: "#1e1e1e",
    //         optionActiveBg: "#333",
    //         optionSelectedBg: "#gg",
    //       },
    //     },
    //   }}
    // >
    <Spin spinning={loading || reload}>
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
            size="small"
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
            <Row gutter={[6, 0]}>
              <Col span={12}>
                <Form.Item
                  rules={[
                    {
                      message: "Please enter package token amount",
                      required: true,
                    },
                  ]}
                  label="จำนวน Package Token"
                  name="packageTokenAmount"
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Enter package token amount"
                    defaultValue={0}
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  rules={[
                    {
                      message: "Please enter package image amount",
                      required: true,
                    },
                  ]}
                  label="จำนวน Package Image"
                  name="packageImageAmount"
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Enter package image amount"
                    defaultValue={0}
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  rules={[
                    {
                      message: "Please enter max user access",
                      required: true,
                    },
                  ]}
                  label="จำนวน User"
                  name="maxUserAccess"
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Enter max user access"
                    defaultValue={1}
                    min={1}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Description" name="description">
              <Input.TextArea rows={3} placeholder="Optional description" />
            </Form.Item>
            {/* <Button type="primary" htmlType="submit">
                Create Organization
              </Button> */}
          </Form>
        </Modal>
      ) : null}
      <UseCouponModal
        isCouponModalOpen={isCouponModalOpen}
        setIsCouponModalOpen={setIsCouponModalOpen}
        handleCouponSubmit={handleCouponSubmit}
        couponLoading={couponLoading}
      />
      <Layout
        className="h-screen overflow-hidden private-layout-shell"
        style={{ position: "relative" }}
      >
        {!(isMobile || isTablet) ? (
          <PrivateSider
            organizationId={organizationId}
            mappedPath={mappedPath}
            currentPathSub={currentPathSub}
            organizationRole={organizationRole}
          />
        ) : null}

        {(isMobile || isTablet) ? (
          <>
            {mobileSiderOpen ? (
              <div
                className="private-layout-backdrop"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.35)",
                  zIndex: 1200,
                  opacity: mobileSiderOpen ? 1 : 0,
                  transition: "opacity 220ms ease",
                }}
                onClick={() => setMobileSiderOpen(false)}
              />
            ) : null}
            <div
              className="private-layout-mobile-sider"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 1300,
                width: 92,
                background: semantic.colorBgContainer,
                transform: mobileSiderOpen
                  ? "translateX(0)"
                  : "translateX(-100%)",
                transition: "transform 0.22s ease",
                boxShadow: mobileSiderOpen
                  ? "0 18px 36px rgba(0,0,0,0.22)"
                  : "none",
              }}
            >
              <PrivateSider
                organizationId={organizationId}
                mappedPath={mappedPath}
                currentPathSub={currentPathSub}
                organizationRole={organizationRole}
                onClose={() => setMobileSiderOpen(false)}
              />
            </div>
          </>
        ) : null}
        <Layout className="flex-1 w-full h-full overflow-hidden">
          {/* <PrivateNavigation
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
              currentOrganization={currentOrganization}
              systemRole={userProfile?.role && userProfile.role}
            /> */}
          <PrivateHeader
            organizationRole={organizationRole}
            creditBalance={creditBalance}
            user={
              userProfile ? { fullname: userProfile.fullname ?? "" } : undefined
            }
            organizationId={organizationId}
            personalOrganizations={personalOrganizations}
            teamOrganizations={teamOrganizations}
            handleOrganizationChange={handleOrganizationChange}
            handleOpenCreateOrg={handleOpenCreateOrg}
            handleManageOrg={handleManageOrg}
            currentOrganization={currentOrganization}
            systemRole={userProfile?.role && userProfile.role}
            onToggleSider={() => setMobileSiderOpen((prev) => !prev)}
            handleOpenCouponModal={() => setIsCouponModalOpen(true)}
          />
          <div className="w-full h-full flex flex-col overflow-hidden">
            <PrivateContent user={userProfile ? userProfile : undefined}>
              <OrganizationProvider
                value={{
                  organizationRole,
                }}
              >
                {children}
              </OrganizationProvider>
            </PrivateContent>
          </div>
        </Layout>
      </Layout>
      
    </Spin>
    //   <style>{`
    //     /* Dark Select Styling */
    //     .dark-select .ant-select-selector {
    //       background-color: #27272a !important;
    //       border: 1px solid #3f3f46 !important;
    //       color: #d1d5db !important;
    //     }

    //     .dark-select .ant-select-selection-item {
    //       color: #d1d5db !important;
    //     }

    //     .dark-select .ant-select-selection-placeholder {
    //       color: #6b7280 !important;
    //     }

    //     .dark-select:hover .ant-select-selector {
    //       border-color: #52525b !important;
    //     }

    //     .dark-select.ant-select-focused .ant-select-selector {
    //       border-color: #3b82f6 !important;
    //       box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
    //     }

    //     .dark-select .ant-select-arrow {
    //       color: #9ca3af !important;
    //     }

    //     /* Custom Sidebar Menu Styling */
    //     .ant-menu-item-selected .menu-icon-container {
    //       background-color: #1677ff;
    //       border-radius: 8px;
    //       padding: 8px;
    //       min-width: 40px;
    //       height: 40px;
    //       display: flex;
    //       align-items: center;
    //       justify-content: center;
    //     }
    //     .menu-text-label {
    //       color:gray !important;
    //     }
    //     .ant-menu-item-selected .menu-text-label {
    //       font-weight: bold !important;
    //       color: white !important;
    //     }

    //     /* Remove ALL sidebar borders and lines */
    //     .ant-layout-sider,
    //     .ant-layout-sider *,
    //     .ant-layout-sider::before,
    //     .ant-layout-sider::after {
    //       border: none !important;
    //       border-right: none !important;
    //       border-left: none !important;
    //       outline: none !important;
    //       box-shadow: none !important;
    //     }

    //     /* Force transparent borders on layout */
    //     .ant-layout {
    //       border: none !important;
    //     }

    //     /* Ensure icon container is centered and has spacing */
    //     .menu-icon-container {
    //       padding: 8px;
    //       border-radius: 8px;
    //       min-width: 40px;
    //       height: 40px;
    //       display: flex;
    //       align-items: center;
    //       justify-content: center;
    //     }

    //   `}</style>
    // </ConfigProvider>
  );
}
