// Utility to convert hex color to rgba
function hexToRgba(hex: string, alpha: number) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
import React from "react";
import { Button, Card, Col, Flex, Row, Spin, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { PermissionGuard } from "@/app/components/PermissionGuard";
import { projectPermissions } from "@/app/utils/permissions";

import { PictureOutlined, VideoCameraOutlined, UserOutlined } from "@ant-design/icons";
import { Sparkle } from "lucide-react";
import { aiCaveColors } from "@/app/theme/themeConfig";

type EmptyAction = {
  label: string;
  onClick: () => void;
  type?: "primary" | "default";
};

type Props = {
  semantic: Record<string, any>;
  isMobile: boolean;
  projectRole?: string | null;
  fallbackDescription: string;
  leftPanel: React.ReactNode;
  rightContent: React.ReactNode;
  loading: boolean;
  isFetchingHistory: boolean;
  hasMore: boolean;
  messagesLength: number;
  emptyDescription: string;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  tabKey?: string;
  emptyActions?: EmptyAction[];
  form?: any;
};

export default function GenerateTwoPaneLayout({
  semantic,
  isMobile,
  projectRole,
  fallbackDescription,
  leftPanel,
  rightContent,
  loading,
  isFetchingHistory,
  hasMore,
  messagesLength,
  emptyDescription,
  onScroll,
  chatContainerRef,
  bottomRef,
  tabKey,
  emptyActions,
  form,
}: Props) {
  // Use form instance from props if provided
  const formInstance = form;

 
  const imageActions = [
    {
      label: "Product Photography",
      prompt: "Professional product photography of [product], studio lighting, white background, high detail, commercial quality",
    },
    {
      label: "Social Media Post",
      prompt: "Vibrant and engaging [theme] for social media, modern design, bold colors, attention-grabbing",
    },
  ];
  const videoAction = [
    {
      label: "Product Demo Video",
      prompt: "Dynamic product demonstration of [product], smooth camera movements, feature highlights, professional quality",
    },
  ];
  const omnihumenAction = [
    {
      label: "Corperate Sporkerperson",
      prompt: "Professional business person in formal attire, confident posture, neutral background, speaking to camera",
    },
  ];
  const dreamActorAction = [
    {
      label: "Customer Service Avatar",
      prompt: "Friendly and approachable customer service representative, warm smile, professional attire, helpful demeanor",
    },
  ];

  // Handler to set prompt value
  const handleSetPrompt = (prompt: string) => {
    if (formInstance && typeof formInstance.setFieldValue === 'function') {
      formInstance.setFieldValue('prompt', prompt);
    }
  };

  // Render actions based on tabKey
  const renderActions = () => {
    const buttonStyle = {
      padding: "8px 20px",
      borderRadius: 999,
      border: "none",
      background: "#fff",
      color: semantic.colorPrimary,
      fontWeight: 600,
      fontSize: 15,
      cursor: "pointer",
      boxShadow: "0 1px 4px 0 rgba(0,0,0,0.03)",
    };
    if (tabKey === "image") {
      return imageActions.map((action, idx) => (
        <Button
          key={action.label + idx}
          type="default"
          shape="round"
          style={buttonStyle}
          onClick={() => handleSetPrompt(action.prompt)}
        >
          {action.label}
        </Button>
      ));
    }
    if (tabKey === "video") {
      return videoAction.map((action, idx) => (
        <Button
          key={action.label + idx}
          type="default"
          shape="round"
          style={buttonStyle}
          onClick={() => handleSetPrompt(action.prompt)}
        >
          {action.label}
        </Button>
      ));
    }
    if (tabKey === "omnihumen") {
      return omnihumenAction.map((action, idx) => (
        <Button
          key={action.label + idx}
          type="default"
          shape="round"
          style={buttonStyle}
          onClick={() => handleSetPrompt(action.prompt)}
        >
          {action.label}
        </Button>
      ));
    }
    if (tabKey === "dream-actor") {
      return dreamActorAction.map((action, idx) => (
        <Button
          key={action.label + idx}
          type="default"
          shape="round"
          style={buttonStyle}
          onClick={() => handleSetPrompt(action.prompt)}
        >
          {action.label}
        </Button>
      ));
    }
    return [];
  };
   // Debug log for tabKey and renderActions
    console.log('DEBUG tabKey:', tabKey);
    console.log('DEBUG renderActions:', renderActions());
  return (
    <Row
      gutter={16}
      wrap={isMobile}
      style={{
        height: "100%",
        minHeight: 0,
        margin: 0,
        padding: 16,
      }}
    >
      <Col flex={isMobile ? "100%" : "320px"} style={{ minHeight: 0, paddingInline: 0 }}>
        <Card
          style={{
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
            background: semantic.colorBgContainer,
            borderColor: semantic.colorBorder,
          }}
          styles={{ body: { height: "100%", padding: 0 } }}
        >
          <PermissionGuard
            roles={projectPermissions.useChat}
            userRole={projectRole}
            fallback={
              <Card size="small" style={{ textAlign: "center", margin: 12 }}>
                <Typography.Title level={5} style={{ marginBottom: 8 }}>
                  🚫 Access Restricted
                </Typography.Title>
                <Typography.Paragraph style={{ marginBottom: 4 }}>
                  {fallbackDescription}
                </Typography.Paragraph>
                <Typography.Text type="secondary">
                  Contact your project administrator for access.
                </Typography.Text>
              </Card>
            }
          >
            {leftPanel}
          </PermissionGuard>
        </Card>
      </Col>

      <Col flex="auto" style={{ minHeight: 0, paddingInline: 0 }}>
        <Card
          variant="borderless"
          style={{
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
            background: "transparent",
            boxShadow: "none",
          }}
          styles={{
            body: {
              height: "100%",
              display: "flex",
              flexDirection: "column",
              padding: 0,
            },
          }}
        >
          <div
            ref={chatContainerRef}
            onScroll={onScroll}
            style={{
              flex: 1,
              overflowY: "auto",
              paddingInline: 16,
              paddingBlock: 12,
            }}
          >
            {(!loading && !isFetchingHistory && messagesLength === 0) ? (
              <Flex align="center" justify="center" style={{ height: "100%", paddingInline: 24 }}>
                <Flex vertical align="center" style={{ textAlign: "center", maxWidth: 320 }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${hexToRgba(semantic.colorPrimary, 0.25)} 0%, ${hexToRgba(semantic.colorPrimary, 0.25)} 50%, ${hexToRgba(aiCaveColors.secondary, 0.25)} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}>
                    {tabKey === "image" ? (
                      <PictureOutlined style={{ fontSize: 32, color: semantic.colorPrimary }} />
                    ) : tabKey === "video" ? (
                      <VideoCameraOutlined style={{ fontSize: 32, color: semantic.colorPrimary }} />
                    ) : tabKey === "omnihumen" ? (
                      <Sparkle style={{ fontSize: 32, color: semantic.colorPrimary }} />
                    ) : (
                      <Sparkle style={{ fontSize: 32, color: semantic.colorPrimary }} />
                    )}
                  </div>
                  <Typography.Title level={4} style={{ marginBottom: 8 }}>
                    Ready to generate
                  </Typography.Title>
                  <Typography.Text type="secondary">{emptyDescription}</Typography.Text>
                  {(tabKey === "image" || tabKey === "video" || tabKey === "omnihumen" || tabKey === "dream-actor") && (
                    <Flex gap={8} justify="center" style={{ marginTop: 20 }}>
                      {renderActions()}
                    </Flex>
                  )}
                </Flex>
              </Flex>
            ) : (loading || isFetchingHistory) && hasMore ? (
              <Flex justify="center" style={{ paddingBlock: 8 }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              </Flex>
            ) : (
              <>
                {rightContent}
                <div ref={bottomRef} />
              </>
            )}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
