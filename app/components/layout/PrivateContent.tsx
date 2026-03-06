import { Layout } from "antd";
import useResponsive from "@/app/hooks/useResponsive";
const { Content } = Layout;

interface ClientLayoutProps {
  children: React.ReactNode;
  user?: { fullname: string };
}

export default function PrivateContent({ children, user }: ClientLayoutProps) {
  const { isMobile } = useResponsive();

  if (user) {
    return (
      <Content

        style={{
          margin: 0,
          padding: 0,
          overflow: "auto",
          height: isMobile ? "calc(100vh - 64px)" : "calc(100vh - 80px)",
        }}
      >
        {children}
      </Content>
    );
  }

  return <Content className="h-full">{children}</Content>;
}
