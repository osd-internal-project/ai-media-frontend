"use client";

import {
  Avatar,
  Button,
  ConfigProvider,
  Divider,
  Drawer,
  Image,
  Layout,
  Menu,
  Popover,
  Select,
  Space,
  Tag,
  theme,
} from "antd";

import { signOut } from "next-auth/react";
import {
  ExclamationCircleOutlined,
  MenuOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  User,
  LogOut,
  CreditCard,
  FileImage,
  FileVideoCamera,
  Coins,
  CircleQuestionMark,
  ShieldUser,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { IOrganization } from "../common/organization.type";
import {
  canCreateOrganization,
  canViewOrganization,
  canViewDashboard,
} from "../utils/permissions";
import { renderMenuItems, MenuSider } from "../config/menu";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import PackageModal from "./PackageModal";
import { formatNumber } from "../utils/format";

const { Header } = Layout;

interface Props {
  user?: { fullname: string };
  pageTitle: string;
  organizationId?: string;
  personalOrganizations: IOrganization[];
  teamOrganizations: IOrganization[];
  handleOrganizationChange: (value: string) => void;
  handleOpenCreateOrg: () => void;
  handleManageOrg: () => void;
  organizationRole?: string;
  currentOrganization: IOrganization | undefined;
  systemRole?: string;
}
const NavbarUser: React.FC<Props> = ({
  user,
  pageTitle,
  organizationId,
  currentOrganization,
  personalOrganizations,
  teamOrganizations,
  handleOrganizationChange,
  handleOpenCreateOrg,
  handleManageOrg,
  organizationRole,
  systemRole,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [isHoldTokenAmountTag, setIsHoldTokenAmountTag] = useState(false);

  const currentPath = pathname.split("/")[2];
  const mappedPath = currentPath === "project" ? "project" : currentPath;
  const currentPathSub = pathname.split("/")[3];

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const content = (
    <>
      <div
        className="flex items-center gap-3 px-3 py-2 text-white hover:bg-gray-500/30 hover:rounded-lg cursor-pointer transition-colors text-left"
        onClick={() => {
          router.push("/page/profile");
        }}
      >
        <User className="w-4 h-4" />
        <span className="text-sm font-medium">User Profile</span>
      </div>
      <div className="h-px bg-gray-600/50 mx-3 my-2"></div>
      {systemRole === "SUPER_ADMIN" && (
        <div>
          <div
            className="flex items-center gap-3 px-3 py-2 text-white hover:bg-gray-500/30 hover:rounded-lg cursor-pointer transition-colors text-left"
            onClick={() => {
              router.push("/page/admin-management");
            }}
          >
            <ShieldUser className="w-4 h-4" />
            <span className="text-sm font-medium">For Admin</span>
          </div>
          <div className="h-px bg-gray-600/50 mx-3 my-2"></div>
        </div>
      )}

      <div className="px-3 py-1">
        <div className="flex items-center gap-3 py-2 text-white">
          <CreditCard className="w-4 h-4" />
          <span className="text-sm font-medium">My Plan</span>
        </div>
        <div
          className="flex items-center justify-between ml-7 px-2 py-1.5 text-white hover:bg-gray-500/30 hover:rounded-lg cursor-pointer transition-colors text-left"
          onClick={() => {
            /* Handle subscription click */
          }}
        >
          <span className="text-sm text-purple-400">Subscription</span>
          <span className="text-xs text-gray-400">Free</span>
        </div>
        <div
          className="flex items-center justify-between ml-7 px-2 py-1.5 text-white hover:bg-gray-500/30 hover:rounded-lg cursor-pointer transition-colors text-left"
          onClick={() => {
            /* Handle credit usage click */
          }}
        >
          <span className="text-sm text-gray-300">Credit usage</span>
          <span className="text-xs bg-green-600 text-white px-1 py-0.5 rounded text-[10px]">
            New!
          </span>
        </div>
        <div
          className="flex items-center gap-3 ml-7 px-2 py-1.5 text-white hover:bg-gray-500/30 hover:rounded-lg cursor-pointer transition-colors text-left"
          onClick={() => {
            /* Handle payments click */
          }}
        >
          <span className="text-sm text-gray-300">Payments</span>
        </div>
      </div>
      <div className="h-px bg-gray-600/50 mx-3 my-2"></div>
      <div
        className="flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-gray-500/30 hover:rounded-lg cursor-pointer transition-colors text-left"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-medium">Logout</span>
      </div>
    </>
  );
  return (
    <Header
      style={{
        // height: "80px",
        background: "transparent",
        lineHeight: "normal",
        padding: 10,
        boxShadow: "none",
        borderRadius: "30px",
      }}
    >
      <div className="mx-auto px-2 sm:px-4 lg:px-8 flex justify-between items-center">
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            className="text-white border-none flex-shrink-0"
            onClick={() => setMobileMenuOpen(true)}
            size="large"
          />
        )}

        <span className="text-sm font-medium text-gray-600 whitespace-nowrap hidden sm:block">
          ORGANIZATION:
        </span>
        <div
          className={`flex items-center ${isMobile ? "flex-1 min-w-0" : "justify-between w-full"
            } px-2 sm:px-4`}
        >
          <div
            className={`flex items-center gap-2 sm:gap-6 ${isMobile ? "flex-1 min-w-0" : ""
              }`}
          >
            <Select
              size="middle"
              className="dark-select w-[180px] sm:w-[250px]"
              placeholder="Choose Organization"
              onChange={handleOrganizationChange}
              value={organizationId}
              getPopupContainer={isMobile ? () => document.body : undefined}
              // dropdownStyle={
              //   isMobile
              //     ? {
              //         zIndex: 9999,
              //         position: "fixed",
              //       }
              //     : undefined
              // }
              popupMatchSelectWidth={!isMobile}
              options={[
                {
                  label: <span>PERSONAL</span>,
                  title: "personal",
                  options: personalOrganizations.map((organization) => ({
                    label: <span>{organization.name}</span>,
                    value: organization.organizationId,
                  })),
                },
                {
                  label: <span>TEAMS</span>,
                  title: "teams",
                  options: teamOrganizations.map((organization) => ({
                    label: <span>{organization.name}</span>,
                    value: organization.organizationId,
                  })),
                },
              ]}
              popupRender={(menu) => (
                <div
                  className={
                    isMobile ? "w-[280px] max-h-[400px] overflow-y-auto" : ""
                  }
                >
                  <div className="p-2">{menu}</div>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-600/50 to-transparent mx-3" />
                  <div className="p-2 space-y-1">
                    {canCreateOrganization(organizationRole) && (
                      <Button
                        hidden
                        type="text"
                        size="large"
                        onClick={handleOpenCreateOrg}
                        icon={<PlusCircleOutlined className="text-blue-400" />}
                        className="w-full !text-left !justify-start !bg-transparent hover:!bg-gray-800/70 !text-gray-300 hover:!text-white !border-none !rounded-lg !px-3 !py-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                      >
                        <span className="font-medium">
                          Add new organization system admin
                        </span>
                      </Button>
                    )}
                    {canCreateOrganization(organizationRole) && (
                      <Button
                        type="text"
                        size="large"
                        onClick={() => setPackageModalOpen(true)}
                        icon={<PlusCircleOutlined className="text-blue-400" />}
                        className="w-full !text-left !justify-start !bg-transparent hover:!bg-gray-800/70 !text-gray-300 hover:!text-white !border-none !rounded-lg !px-3 !py-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                      >
                        <span className="font-medium">
                          Add new organization
                        </span>
                      </Button>
                    )}
                    {canViewOrganization(organizationRole) && (
                      <Button
                        type="text"
                        size="large"
                        onClick={handleManageOrg}
                        icon={<SettingOutlined className="text-green-400" />}
                        className="w-full !text-left !justify-start !bg-transparent hover:!bg-gray-800/70 !text-gray-300 hover:!text-white !border-none !rounded-lg !px-3 !py-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                      >
                        <span className="font-medium">Manage Organization</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            />
          </div>

          {/* User Section */}
          {user && (
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              {canViewDashboard(organizationRole) && (
                <Button
                  type="primary"
                  onClick={() => setPackageModalOpen(true)}
                  style={{
                    fontSize: isMobile ? "10px" : "13px",
                    padding: isMobile ? "3px 8px" : "6px 16px",
                    borderRadius: isMobile ? "24px" : "12px",
                    backgroundColor: "#1A1A1A",
                    borderColor: "#3f3f46",
                    background:
                      "linear-gradient(135deg, #fdcec9 0%, #94a96b 50%, #60983f 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                  className={`!border-zinc-700 hover:!border-zinc-500 hover:!bg-zinc-800 transition-all duration-300 hover:shadow-md ${isMobile ? "w-auto" : "w-full sm:w-auto"
                    }`}
                >
                  Upgrade
                </Button>
              )}

              <Tag
                style={{
                  // background:
                  //   "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  background: isHoldTokenAmountTag
                    ? "linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  color: "white",
                  fontSize: isMobile ? "10px" : "13px",
                  fontWeight: "600",
                  padding: isMobile ? "3px 8px" : "6px 16px",
                  borderRadius: isMobile ? "12px" : "20px",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
                onMouseOver={(e) => setIsHoldTokenAmountTag(true)}
                onMouseOut={(e) => setIsHoldTokenAmountTag(false)}
              >
                <div className=" flex flex-row gap-2  w-[130px]">
                  {isHoldTokenAmountTag ? (
                    <div className=" flex flex-row gap-2 items-center justify-between">
                      <div className=" flex gap-2 items-center">
                        <Coins size={15} />
                        {formatNumber(currentOrganization?.packageTokenAmount)}
                      </div>
                      <CircleQuestionMark size={13} />
                    </div>
                  ) : (
                    <div className=" flex flex-row gap-2 items-center w-[130px] justify-between">
                      <div className=" flex gap-2 items-center">
                        <FileImage size={15} />
                        {formatNumber(currentOrganization?.packageImageAmount)}
                      </div>
                      <CircleQuestionMark size={13} />
                    </div>
                  )}
                </div>
              </Tag>
              <div
                className={`flex items-center ${isMobile ? "gap-1" : "gap-2 sm:gap-4"
                  }`}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{
                    background:
                      "linear-gradient(90deg, #5B6BF9 0%, #9D5BF9 100%)",
                    border: "none",
                  }}
                  size={isMobile ? 34 : 42}
                />
                {!isMobile && (
                  <div className="flex items-center min-w-0">
                    <span className="font-bold text-white whitespace-nowrap text-sm sm:text-base truncate">
                      {user.fullname}
                    </span>
                  </div>
                )}
                <Popover
                  content={content}
                  arrow={false}
                  trigger="click"
                  placement={isMobile ? "bottomLeft" : "bottomRight"}
                  title={false}
                  styles={{
                    body: {
                      padding: 4,
                      backgroundColor: "#18181B",
                      borderRadius: "8px",
                      border: "1px solid #333",
                      width: isMobile ? "200px" : "220px",
                    },
                  }}
                >
                  <Button
                    type="default"
                    size={isMobile ? "small" : "small"}
                    icon={<SettingOutlined />}
                    className="flex-shrink-0"
                  />
                </Popover>
              </div>
            </div>
          )}

          {/* Guest User Section */}
          {!user && (
            <div className="flex items-center gap-4 flex-shrink-0">
              <Avatar
                icon={<UserOutlined />}
                style={{
                  background:
                    "linear-gradient(90deg, #5B6BF9 0%, #9D5BF9 100%)",
                  border: "none",
                }}
                size={isMobile ? 34 : 42}
              />
              <div className="grid grid-cols-1 items-center gap-2">
                <span className="font-bold text-white">{`Guest`}</span>
              </div>
              <Popover
                content={content}
                arrow={false}
                trigger="click"
                placement={isMobile ? "bottomLeft" : "bottomRight"}
                title={false}
                styles={{
                  body: {
                    padding: 4,
                    backgroundColor: "#18181B",
                    borderRadius: "8px",
                    border: "1px solid #333",
                    width: isMobile ? "200px" : "220px",
                  },
                }}
              >
                <Button
                  type="default"
                  size={isMobile ? "small" : "small"}
                  icon={<SettingOutlined />}
                  className="flex-shrink-0"
                />
              </Popover>
            </div>
          )}
        </div>
      </div>

      {isMobile && (
        <Drawer
          title=""
          placement="left"
          closable={true}
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          styles={{
            body: { padding: "0rem", backgroundColor: "#0f0f0f" },
            header: { display: "none" },
          }}
          width={90}
        >
          <div className="bg-black rounded-2xl h-full flex flex-col">
            {/* Logo at top of mobile drawer */}
            <div className="w-full flex justify-center items-center pt-8 flex-shrink-0">
              <Image
                // width={"60px"}
                src="/images/logo-1.png"
                alt="OSD Logo"
                preview={false}
                className="mb-2"
              />
            </div>

            {organizationId && (
              <ConfigProvider
                theme={{
                  algorithm: theme.darkAlgorithm,
                  components: {
                    Menu: {
                      itemBg: "transparent",
                      itemColor: "white",
                      itemHoverBg: "#363A3D",
                      itemHoverColor: "white",
                      itemSelectedBg: "transparent",
                      itemSelectedColor: "white",
                      itemDisabledColor: "white",
                    },
                  },
                }}
              >
                <Menu
                  mode="vertical"
                  selectedKeys={[mappedPath, `${mappedPath}/${currentPathSub}`]}
                  defaultSelectedKeys={[
                    mappedPath,
                    `${mappedPath}/${currentPathSub}`,
                  ]}
                  items={renderMenuItems(MenuSider, organizationRole)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-drawer"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "white",
                  }}
                />
              </ConfigProvider>
            )}
          </div>
        </Drawer>
      )}

      {/* Package Modal */}
      <PackageModal
        open={packageModalOpen}
        onClose={() => setPackageModalOpen(false)}
      />
    </Header>
  );
};

export default NavbarUser;
