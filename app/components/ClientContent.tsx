import { Layout } from "antd";
const { Content } = Layout;
interface ClientLayoutProps {
  children: React.ReactNode;
  user?: { name: string };
}

export default function ClientContent({ children, user }: ClientLayoutProps) {
  if (user) {
    return (
      <Content
        style={{
          padding: 20,
          margin: 0,
        }}>
        {children}
      </Content>
    );
  }

  return <Content>{children}</Content>;
}
