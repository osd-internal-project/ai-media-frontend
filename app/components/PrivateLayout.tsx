"use client";
import {
  ConfigProvider,
  Layout,
  Menu,
  Image,
  Modal,
  theme,
  Spin,
} from "antd";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { renderMenuItems, MenuSider } from "../config/menu";
import Sider from "antd/es/layout/Sider";
import PrivateNavigation from "./PrivateNavigation";
import PrivateContent from "./PrivateContent";
import { useSession } from "next-auth/react";
import UserServices from "../services/users.service";
import { axiosUser } from "../lib/axios/axios";
import type { TUser } from "../common/user.type";
import OrganizationService from "../services/organization.service";
import { ICreditBalance, IOrganization } from "../common/organization.type";
import { OrganizationProvider } from "../context/OrganizationContext";
import OrganizationMembersServices from "../services/organization-members.service";
import CreditBalanceServices from "../services/credit-balance.service";

interface ClientLayoutProps {
  children: React.ReactNode;
}

const darkThemeToken = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorBgBase: "#000000",
    colorBgContainer: "#000000",
    colorBgElevated: "#1a1a1a",
    colorTextBase: "#f0f0f0",
  },
};

export default function PrivateLayout({ children }: ClientLayoutProps) {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);

  const pathname = usePathname();
  const [, , currentPath, currentPathSub] = pathname.split("/");

  const [modal, contextHolder] = Modal.useModal();

  const userServices = UserServices(axiosUser);
  const organizationService = OrganizationService(axiosUser);
  const creditBalanceService = CreditBalanceServices(axiosUser);
  const organizationMemberService = OrganizationMembersServices(axiosUser);

  const [currentOrganization, setCurrentOrganization] = useState<
    IOrganization | undefined
  >();
  const [creditBalance, setCreditBalance] = useState<
    ICreditBalance | undefined
  >(undefined);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [organizationRole, setOrganizationRole] = useState<string>("");
  const [teamOrganizations, setTeamOrganizations] = useState<IOrganization[]>(
    [],
  );
  const [personalOrganizations, setPersonalOrganizations] = useState<
    IOrganization[]
  >([]);
  const [userProfile, setUserProfile] = useState<TUser | null>(null);

  useEffect(() => {
    if (session?.user?.id) setLoading(true);
  }, [session?.user?.id]);

  useEffect(() => {
    if (loading) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const fetchData = async () => {
    await fetchDataUser();
    setLoading(false);
  };

  async function fetchDataByOrganization(organizationId: string) {
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

    await userServices.findOrganizationUserDetails(organizationId);
    setLoading(false);
  }

  const fetchDataUser = async () => {
    const userDetail = await userServices.findDetailByToken(
      session?.user?.id as string,
    );
    setUserProfile(userDetail);

    const [personalOrgs, teamOrgs] = await Promise.all([
      organizationService.findManyByUserId(userDetail?.userId || "", {
        type: "personal",
      }),
      organizationService.findManyByUserId(userDetail?.userId || "", {
        type: "team",
      }),
    ]);
    setPersonalOrganizations(personalOrgs || []);
    setTeamOrganizations(teamOrgs || []);

    if (userDetail?.recentOrganizationId) {
      const organization = [
        ...(personalOrgs || []),
        ...(teamOrgs || []),
      ].find((org) => org.organizationId === userDetail?.recentOrganizationId);
      if (organization) {
        const creditBalance = await creditBalanceService.findByOrganizationId(
          organization.organizationId,
        );
        setCurrentOrganization(organization);
        setCreditBalance(creditBalance);
      }
      fetchDataByOrganization(userDetail?.recentOrganizationId);
    }
  };

  function handleManageOrg(): void {
    router.push(`/page/organization`);
  }

  async function handleOrganizationChange(
    organizationId: string,
  ): Promise<void> {
    setReload(true);
    try {
      await userServices.updateDetailByToken(session?.user?.id as string, {
        recentOrganizationId: organizationId,
      });
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          organizationId: organizationId,
        },
      });
      router.push("/page/project");
    } catch {
      modal.error({
        title: "Change Organize fail",
        content: "Please Try again",
      });
    } finally {
      setReload(false);
    }
  }

  if (!session?.user.id) {
    return (
      <ConfigProvider theme={darkThemeToken}>
        <Layout className="h-screen overflow-hidden">
          <Spin spinning={true}></Spin>
        </Layout>
      </ConfigProvider>
    );
  }

  const isAdminRoute = pathname.startsWith("/page/admin-management");

  if (isAdminRoute) {
    return (
      <ConfigProvider theme={darkThemeToken}>
        <Spin spinning={loading || reload}>
          <OrganizationProvider
            value={{
              organizationRole,
            }}
          >
            {children}
          </OrganizationProvider>
        </Spin>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
      theme={{
        ...darkThemeToken,
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
            itemDisabledColor: "#999",
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
            optionSelectedBg: "#333",
          },
        },
      }}
    >
      <Spin spinning={loading || reload}>
        {contextHolder}

        <Layout className="h-screen overflow-hidden">
          <Sider
            width={100}
            trigger={null}
            collapsible
            collapsed={false}
            className="hidden md:block p-2 h-screen mobile-hide"
          >
            <div className="bg-black rounded-2xl h-full flex flex-col">
              <div className="w-full flex justify-center items-center py-5 flex-shrink-0">
                <Image
                  src="/images/logo-1.png"
                  alt="OSD Logo"
                  preview={false}
                  className="mb-2"
                />
              </div>
              <div className="w-full text-[#F0F0F073] line-height-[16px] text-[12px] px-2"></div>
              {organizationId && (
                <div className="flex-1 overflow-y-auto hide-scrollbar overflow-x-hidden">
                  <Menu
                    selectedKeys={[
                      currentPath,
                      `${currentPath}/${currentPathSub}`,
                    ]}
                    defaultSelectedKeys={[
                      currentPath,
                      `${currentPath}/${currentPathSub}`,
                    ]}
                    items={renderMenuItems(MenuSider, organizationRole)}
                  />
                </div>
              )}
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
              handleManageOrg={handleManageOrg}
              currentOrganization={currentOrganization}
              creditBalance={creditBalance}
              systemRole={userProfile?.role && userProfile.role}
            />
            <div className="w-full h-full flex flex-col overflow-hidden">
              <PrivateContent user={userProfile ?? undefined}>
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
