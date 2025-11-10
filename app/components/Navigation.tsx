"use client";

import Navbar from "./Navbar";

interface NavigationProps {
  user: { name: string };
}

const Navigation: React.FC<NavigationProps> = ({ user }) => {
  return <Navbar user={user} />;
};

export default Navigation;
