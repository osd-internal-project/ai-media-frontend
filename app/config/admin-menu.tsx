import { UserCog, LockKeyholeOpen, LayoutDashboard } from "lucide-react";
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
  {
    key: "plan-management",
    icon: <LayoutDashboard size={16} />,
    label: (
      <Link href="/page/admin-management/plan-management">
        Plan Management
      </Link>
    ),
  },
  {
    key: "model-pricing",
    icon: <LayoutDashboard size={16} />,
    label: (
      <Link href="/page/admin-management/model-pricing">
        Model Pricing
      </Link>
    ),
  },
];

export const getSelectedAdminKey = (pathname: string) => {
  if (pathname.includes("/admin-management/users-management")) {
    return "users-management";
  }
  if (pathname.includes("/admin-management/organization")) {
    return "organization";
  }
  if (pathname.includes("/admin-management/plan-management")) {
    return "plan-management";
  }
  if (pathname.includes("/admin-management/model-pricing")) {
    return "model-pricing";
  }
  return ""; // default
};
