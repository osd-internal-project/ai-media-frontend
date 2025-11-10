"use client";

import { Layout, Typography } from "antd";

const { Footer } = Layout;
const { Text } = Typography;

interface FooterProps {
  darkMode?: boolean;
  setDarkMode?: (value: boolean) => void;
}

const OSDFooter: React.FC<FooterProps> = ({ darkMode, setDarkMode }) => {
  return (
    <Footer className="overflow-hidden">
      <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-2">
        <Text className="!text-white">@ 2025 - OSD Company Limited</Text>
      </div>
    </Footer>
  );
};

export default OSDFooter;
