import { UserCog, LockKeyholeOpen, LayoutDashboard, Gem, Ticket } from "lucide-react";
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
    icon: <Gem size={16} />,
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
  {
    key: "coupon-management",
    icon: <Ticket size={16} />,
    label: (
      <Link href="/page/admin-management/coupon-management">
        Coupon Management
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
  if (pathname.includes("/admin-management/coupon-management")) {
    return "coupon-management";
  }
  return ""; // default
};
