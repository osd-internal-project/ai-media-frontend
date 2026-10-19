"use client";

import React, { useMemo } from "react";
import { Menu } from "antd";
import type { MenuProps } from "antd";
import { CreditCard, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { canSeeBilling } from "@/app/utils/permissions";

const PROFILE_ITEM = { key: "/page/profile", icon: <User size={16} />, label: "Profile" };
const BILLING_ITEM = { key: "/page/profile/billing", icon: <CreditCard size={16} />, label: "Billing Profiles" };

interface ProfileLayoutProps {
  children: React.ReactNode;
}

/**
 * Wraps every /page/profile/* page with a left vertical sub-menu so users can
 * switch between profile information, billing profiles and WHT requests.
 */
const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  // Billing Profiles is part of the billing surface, hidden until FEATURES.billing ships.
  const showBilling = canSeeBilling(session?.user?.systemRole);
  const menuItems: MenuProps["items"] = showBilling ? [PROFILE_ITEM, BILLING_ITEM] : [PROFILE_ITEM];

  // Pick the most specific matching menu key for the current route.
  const selectedKey = useMemo(() => {
    if (pathname.includes("/profile/billing")) return "/page/profile/billing";
    return "/page/profile";
  }, [pathname]);

  return (
    <div className="flex h-full flex-col gap-4 md:flex-row">
      <aside className="w-full shrink-0 md:w-60">
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ borderRadius: 12, height: "100%" }}
        />
      </aside>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
};

export default ProfileLayout;
