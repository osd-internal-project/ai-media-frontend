"use client";

import {
  Avatar,
  Button,
  ConfigProvider,
  Divider,
  Layout,
  Popover,
  Select,
  Space,
  Tag,
} from "antd";

import { signOut } from "next-auth/react";
import {
  ExclamationCircleOutlined,
  PlusCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { User, LogOut, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { IOrganization } from "../common/organization.type";
import { checkRole } from "../utils/checkRole";

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
}
const NavbarUser: React.FC<Props> = ({
  user,
  pageTitle,
  organizationId,
  personalOrganizations,
  teamOrganizations,
  handleOrganizationChange,
  handleOpenCreateOrg,
  handleManageOrg,
  organizationRole,
}) => {
  const router = useRouter();

  const content = (
    <>
      <div
        className="flex items-center gap-3 px-3 py-2 text-white hover:bg-gray-500/30 hover:rounded-lg cursor-pointer transition-colors text-left"
        onClick={() => {
          router.push('/page/profile');
        }}
      >
        <User className="w-4 h-4" />
        <span className="text-sm font-medium">User Profile</span>
      </div>

      <div className="h-px bg-gray-600/50 mx-3 my-2"></div>

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
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
          ORGANIZATION:
        </span>
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center gap-6">
            <Select
              size="middle"
              className="dark-select w-[250px]  "
              placeholder="Choose Organization"
              onChange={handleOrganizationChange}
              value={organizationId}
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
                <div>
                  <div className="p-2">{menu}</div>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-600/50 to-transparent mx-3" />
                  <div className="p-2 space-y-1">
                    <Button
                      type="text"
                      size="large"
                      onClick={handleOpenCreateOrg}
                      icon={<PlusCircleOutlined className="text-blue-400" />}
                      className="w-full !text-left !justify-start !bg-transparent hover:!bg-gray-800/70 !text-gray-300 hover:!text-white !border-none !rounded-lg !px-3 !py-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                    >
                      <span className="font-medium">Add new organization</span>
                    </Button>
                    <Button
                      type="text"
                      size="large"
                      onClick={handleManageOrg}
                      icon={<SettingOutlined className="text-green-400" />}
                      className="w-full !text-left !justify-start !bg-transparent hover:!bg-gray-800/70 !text-gray-300 hover:!text-white !border-none !rounded-lg !px-3 !py-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                    >
                      <span className="font-medium">Manage Organization</span>
                    </Button>
                  </div>
                </div>
              )}
            />
          </div>
        </div>
        {user ? (
          <>
            <Tag
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                color: "white",
                fontSize: "13px",
                fontWeight: "600",
                padding: "6px 16px",
                borderRadius: "20px",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              1,000 Tokens
            </Tag>
            <div className="flex items-center gap-4">
              <Avatar size={48} />
              <div className="flex items-center">
                <span className="font-bold text-white whitespace-nowrap">
                  {user.fullname}
                </span>
              </div>
              <>
                <Popover
                  content={content}
                  arrow={false}
                  trigger="click"
                  placement="bottomRight"
                  title={false}
                  styles={{
                    body: {
                      padding: 4,
                      backgroundColor: "#18181B",
                      borderRadius: "8px",
                      border: "1px solid #333",
                      width: "220px",
                    },
                  }}
                >
                  {checkRole(["ADMIN", "OWNER"], organizationRole) && (
                    <Button
                      type="default"
                      size="small"
                      icon={<SettingOutlined />}
                    />
                  )}
                </Popover>
              </>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Avatar size={48} />
            <div className="grid grid-cols-1 items-center gap-2">
              <span className="font-bold text-white">{`Geust`}</span>
            </div>
          </div>
        )}
      </div>
    </Header>
  );
};

export default NavbarUser;
