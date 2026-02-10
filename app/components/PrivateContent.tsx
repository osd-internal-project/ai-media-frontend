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
        className="h-full p-2 md:p-2 mobile-padding mobile-full overflow-y-auto"
        style={{
          margin: 0,
        }}
      >
        {children}
      </Content>
    );
  }

  return <Content className="h-full">{children}</Content>;
}
