import { UserCog, LockKeyholeOpen } from "lucide-react";
import Link from "next/link";

export const getAdminMenuItems = () => [
  {
    key: "users-management",
    icon: <UserCog size={16} />,
    label: (
      <Link href="/page/admin-management/users-management">
        User Management
      </Link>
    ),
  },
  {
    key: "organization",
    icon: <LockKeyholeOpen size={16} />,
    label: <Link href="/page/admin-management/organization">Organization</Link>,
  },
];

export const getSelectedAdminKey = (pathname: string) => {
  if (pathname.includes("/admin-management/users-management")) {
    return "users-management";
  }
  if (pathname.includes("/admin-management/organization")) {
    return "organization";
  }
  return ""; // default
};
