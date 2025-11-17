"use client";

import { usePathname } from "next/navigation";
import Navbar from "./PrivateNavbar";
import { findMenuLabel, MenuSider } from "../config/menu";
interface NavigationProps {
  user: { name: string };
}

const PrivateNavigation: React.FC<NavigationProps> = ({ user }) => {
  const pathname = usePathname(); // /page/roles
  const key = pathname.split("/").pop(); // roles

  const pageTitle = findMenuLabel(MenuSider, String(key)) || "Dashboard";
  return <Navbar user={user} pageTitle={pageTitle} />;
};

export default PrivateNavigation;
