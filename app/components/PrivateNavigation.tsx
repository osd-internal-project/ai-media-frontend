"use client";

import Navbar from "./PrivateNavbar";

interface NavigationProps {
  user: { name: string };
}

const PrivateNavigation: React.FC<NavigationProps> = ({ user }) => {
  return <Navbar user={user} />;
};

export default PrivateNavigation;
