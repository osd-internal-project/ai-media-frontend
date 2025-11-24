"use client";

import { usePathname } from "next/navigation";
import Navbar from "./PrivateNavbar";
import { findMenuLabel, MenuSider } from "../config/menu";
interface NavigationProps {
  user?: { fullname: string };
}

const PrivateNavigation: React.FC<NavigationProps> = ({ user }) => {
  const pathname = usePathname(); // /page/roles
  const key = pathname.split("/"); // roles
  const pageTitle = findMenuLabel(MenuSider, key[2]) || "";
  return <Navbar user={user} pageTitle={pageTitle} />;
};

export default PrivateNavigation;
