
import React, { useState, useRef, useEffect } from "react";
import { Button, Card, Col, Flex, Input, InputRef, Row, Spin, Typography } from "antd";
import { ArrowUpOutlined, LoadingOutlined, SendOutlined } from "@ant-design/icons";
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

  // Mobile left pane overlay state
  const [showLeftOverlay, setShowLeftOverlay] = useState(false);
  const inputRef = useRef<InputRef>(null);

useEffect(() => {
  if (isMobile) {
    console.log("DEBUG mobile render");
  }
}, [isMobile]);
  
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
  
  // Handler: show overlay when input focused
  const handleInputFocus = () => {
    if (isMobile) {
      console.log('DEBUG: input focused, setShowLeftOverlay(true)');
      setShowLeftOverlay(true);
    }
  };

  // Handler: hide overlay (after generate or close)
  const handleHideOverlay = () => {
    setShowLeftOverlay(false);
    // Optionally blur input
    if (inputRef.current) inputRef.current.blur();
  };

 
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
    
      color: semantic.colorPrimary,

      cursor: "pointer",
    
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

 
const prevLoadingRef = useRef(loading);
useEffect(() => {
  // loading จาก true -> false และ overlay ยังเปิดอยู่
  if (isMobile && showLeftOverlay && prevLoadingRef.current && !loading) {
    handleHideOverlay();
  }

  prevLoadingRef.current = loading;
}, [loading, isMobile, showLeftOverlay]);
 
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
      {/* LEFT PANE: Desktop = sidebar, Mobile = overlay+input */}
      {!isMobile && (
        <Col flex="320px" style={{ minHeight: 0, paddingInline: 0 }}>
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
      )}

      {/* MOBILE: input bar at bottom, overlay for leftPanel */}
      {isMobile && (
        <>
          {/* Overlay for leftPanel: scrollable, input bar always visible */}
          {showLeftOverlay && (
            (() => { console.log('DEBUG: Render overlay leftPanel'); return null; })(),
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1200,
                background: "rgba(0,0,0,0.32)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              
              }}
              onClick={handleHideOverlay}
            >
              <div
                style={{
                  background: semantic.colorBgContainer,
                  borderRadius: 20,
                  boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
                  minHeight: 220,
                  maxHeight: "70vh",
                  width: "calc(100vw - 32px)",
                  margin: "0 auto 16px auto",
                  animation: "slideUp .2s cubic-bezier(.4,0,.2,1)",
                  display: "flex",
                  flexDirection: "column",
                  padding: 0,
                  position: "relative",
                }}
                onClick={e => e.stopPropagation()}
              >
                {/* Close button at top right */}
                <button
                  onClick={handleHideOverlay}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 12,
                    zIndex: 10,
                    background: "rgba(0,0,0,0.08)",
                    border: "none",
                    borderRadius: 16,
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  aria-label="Close overlay"
                >
                  <span style={{ fontSize: 22, color: semantic.colorTextSecondary }}>&#10005;</span>
                </button>
                <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
                  {(() => { console.log('DEBUG: leftPanel overlay scrollable div rendered'); return null; })()}
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
                </div>
                {/* Input bar at bottom of overlay */}
             {/* <div
  style={{
    borderTop: `1px solid ${semantic.colorBorder}`,
    background: semantic.colorBgContainer,
    padding: "12px 16px 16px",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: 6,
      borderRadius: 999,
      background: semantic.colorBgElevated,
      border: `1px solid ${semantic.colorBorder}`,
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    }}
  >
    <Input
      ref={inputRef}
      placeholder="Type your prompt..."
      autoFocus
      readOnly
      bordered={false}
      style={{
        flex: 1,
        fontSize: 15,
        background: "transparent",
        color: semantic.colorText,
        boxShadow: "none",
      }}
    />

    <Button
      type="primary"
      shape="circle"
      icon={<ArrowUpOutlined />}
      style={{
        flexShrink: 0,
        boxShadow: "none",
      }}
    />
  </div>
</div> */}
              </div>
            </div>
          )}
          {/* Main input bar at bottom of page (when overlay not open) */}
       {/* Main input bar at bottom of page (when overlay not open) */}
{!showLeftOverlay && (
  <div
    style={{
      position: "fixed",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1100,
      padding: "12px 16px calc(env(safe-area-inset-bottom, 0px) + 12px)",
      background: "transparent",
      pointerEvents: "none",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: 6,
        borderRadius: 999,
        background: semantic.colorBgContainer,
        border: `1px solid ${semantic.colorBorder}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        pointerEvents: "auto",
      }}
    >
      <Input
        ref={inputRef}
        placeholder="Type your prompt..."
        bordered={false}
        readOnly
        onFocus={handleInputFocus}
        style={{
          flex: 1,
          fontSize: 15,
          background: "transparent",
          color: semantic.colorText,
          boxShadow: "none",
        }}
      />

      <Button
        type="primary"
        shape="circle"
        icon={<SendOutlined />}
        onClick={handleInputFocus}
        style={{
          flexShrink: 0,
          boxShadow: "none",
          background: `linear-gradient(135deg, ${semantic.colorPrimary} 0%, ${semantic.colorPrimary} 50%, ${aiCaveColors.secondary} 100%)`
        }}
      />
    </div>
  </div>
)}
        </>
      )}

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
              WebkitOverflowScrolling: "touch",
              paddingInline: 16,
              paddingBlock: 12,
              // mobile: leave space for input bar
              paddingBottom: isMobile ? 64 : 12,
              boxSizing: "border-box",
              minHeight: 0,
              maxHeight: isMobile ? 'calc(100vh - 64px)' : undefined,
            }}
          >
            {(() => { if (isMobile) console.log('DEBUG: rightContent scrollable div rendered'); return null; })()}
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
                {/* Auto-hide overlay after generate: listen for loading=false and overlay open */}
                {/* {isMobile && showLeftOverlay && !loading && (
                  (() => { setTimeout(handleHideOverlay, 200); return null; })()
                )} */}
              </>
            )}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
