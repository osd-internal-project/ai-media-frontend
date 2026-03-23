import React from "react";
import { Card, Col, Flex, Row, Spin, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { PermissionGuard } from "@/app/components/PermissionGuard";
import { projectPermissions } from "@/app/utils/permissions";

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
}: Props) {
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
            {!loading && !isFetchingHistory && messagesLength === 0 ? (
              <Flex align="center" justify="center" style={{ height: "100%", paddingInline: 24 }}>
                <Flex vertical align="center" style={{ textAlign: "center", maxWidth: 320 }}>
                  <Typography.Title level={4} style={{ marginBottom: 8 }}>
                    Ready to generate
                  </Typography.Title>
                  <Typography.Text type="secondary">{emptyDescription}</Typography.Text>
                </Flex>
              </Flex>
            ) : null}

            {(loading || isFetchingHistory) && hasMore && (
              <Flex justify="center" style={{ paddingBlock: 8 }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              </Flex>
            )}

            {rightContent}
            <div ref={bottomRef} />
          </div>
        </Card>
      </Col>
    </Row>
  );
}
