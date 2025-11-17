import { Layout } from "antd";
const { Content } = Layout;

interface ClientLayoutProps {
  children: React.ReactNode;
  user?: { name: string };
}

export default function PrivateContent({ children, user }: ClientLayoutProps) {
  if (user) {
    return (
      <Content
        className="!pt-3 !pr-3 !pb-3 bg-[#0f0f0f]"
        style={{
          margin: 0,
        }}>
        {children}
      </Content>
    );
  }

  return <Content>{children}</Content>;
}
