import { Layout } from "antd";
const { Content } = Layout;

interface ClientLayoutProps {
  children: React.ReactNode;
  user?: { fullname: string };
}

export default function PrivateContent({ children, user }: ClientLayoutProps) {
  if (user) {
    return (
      <Content
        style={{
          paddingRight: 1,
          margin: 0,
        }}
      >
        {children}
      </Content>
    );
  }

  return <Content>{children}</Content>;
}
