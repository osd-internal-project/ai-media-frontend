"use client";

import React, { useMemo } from "react";
import { Menu } from "antd";
import type { MenuProps } from "antd";
import { CreditCard, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

/** Left sub-menu items for the profile section. */
const PROFILE_MENU: MenuProps["items"] = [
  {
    key: "/page/profile",
    icon: <User size={16} />,
    label: "Profile",
  },
  {
    key: "/page/profile/billing",
    icon: <CreditCard size={16} />,
    label: "Billing Profiles",
  },
];

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
          items={PROFILE_MENU}
          onClick={({ key }) => router.push(key)}
          style={{ borderRadius: 12, height: "100%" }}
        />
      </aside>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
};

export default ProfileLayout;
