import { Layout } from "antd";
import useResponsive from "@/app/hooks/useResponsive";
import "./LayoutStyle.css";
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
        className="private-content-scroll"
        style={{
          margin: 0,
          padding: 0,
          overflow: "auto",
          height: isMobile ? "calc(100dvh - 64px)" : "calc(100dvh - 80px)",
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
        }}
      >
        {children}
        
      </Content>
    );
  }

  return <Content className="h-full">{children}</Content>;
}
