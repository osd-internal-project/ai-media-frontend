"use client";

import { Avatar, Button, Divider, Layout, Popover, Select, Space } from "antd";
import { signOut } from "next-auth/react";
import {
  ExclamationCircleOutlined,
  PlusCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
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
  const content = (
    <div className="flex flex-col gap-2">
      <p style={{ marginBottom: 8 }}></p>
      <Button
        type="default"
        block
        size="small"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sign Out
      </Button>
    </div>
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
        <div className=" justify-center items-center py-5 flex-shrink-0 px-2">
          {/* <div className="mt-3 w-full mb-2">
            <Button
              size="middle"
              onClick={handleOpenCreateOrg}
              icon={<PlusCircleOutlined />}
              className="w-full"
            >
              {`Add new organization`}
            </Button>
          </div> */}
          <div className="w-full flex items-center space-x-1">
            <Select
              size="large"
              className="dark-select w-[200px]  "
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
                <div className=" w-fit">
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <Button
                    type="link"
                    size="middle"
                    onClick={handleOpenCreateOrg}
                    icon={<PlusCircleOutlined />}
                    className="w-full"
                  >
                    {`Add new organization`}
                  </Button>
                  <Divider style={{ margin: "8px 0" }} />
                  <Button
                    type="link"
                    size="middle"
                    onClick={handleManageOrg}
                    icon={<SettingOutlined />}
                    className="w-full"
                  >
                    {`Manage Organization`}
                  </Button>
                </div>
              )}
            />
          </div>
        </div>
        {user ? (
          <div className="flex items-center gap-4">
            <Avatar size={48} />
            <div className="grid grid-cols-1 items-center gap-2">
              <span className="font-bold text-white">{user.fullname}</span>
            </div>
            <>
              <Popover
                content={content}
                trigger="click"
                placement="bottomRight"
                title={false}
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
