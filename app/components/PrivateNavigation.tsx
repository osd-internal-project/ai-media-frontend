"use client";

import { usePathname } from "next/navigation";
import Navbar from "./PrivateNavbar";
import { findMenuLabel, MenuSider } from "../config/menu";
import { IOrganization } from "../common/organization.type";
interface NavigationProps {
  user?: { fullname: string };
  organizationId?: string;
  personalOrganizations: IOrganization[];
  teamOrganizations: IOrganization[];
  handleOrganizationChange: (value: string) => void;
  handleOpenCreateOrg: () => void;
  handleManageOrg: () => void;
  organizationRole?: string;
  currentOrganization: IOrganization | undefined;
}

const PrivateNavigation: React.FC<NavigationProps> = ({
  user,
  organizationId,
  personalOrganizations,
  teamOrganizations,
  handleOrganizationChange,
  handleOpenCreateOrg,
  handleManageOrg,
  organizationRole,
  currentOrganization,
}) => {
  const pathname = usePathname(); // /page/roles
  const key = pathname.split("/"); // roles
  const pageTitle = findMenuLabel(MenuSider, key[2]) || "";
  return (
    <Navbar
      user={user}
      pageTitle={pageTitle}
      organizationId={organizationId}
      personalOrganizations={personalOrganizations}
      teamOrganizations={teamOrganizations}
      handleOrganizationChange={handleOrganizationChange}
      handleOpenCreateOrg={handleOpenCreateOrg}
      handleManageOrg={handleManageOrg}
      organizationRole={organizationRole}
      currentOrganization={currentOrganization}
    />
  );
};

export default PrivateNavigation;
