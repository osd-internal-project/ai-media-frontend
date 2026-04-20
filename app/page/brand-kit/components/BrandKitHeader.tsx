import { Row, Col, Divider, Tabs, Button, Typography, Space, Tooltip } from "antd";
import { StarOutlined, BgColorsOutlined, FontSizeOutlined, BranchesOutlined, StarFilled, PictureOutlined, MessageOutlined } from "@ant-design/icons";
import React from "react";

import { Palette } from "lucide-react";

interface BrandKitHeaderProps {
  selectedKit: any;
  selectedTab: string;
  setSelectedTab: (key: string) => void;
  isMobile: boolean;
  isTablet?: boolean;
  isSidebarVisible?: boolean;
  semantic: any;
  onToggleSidebar?: () => void;
  isDefaultKit?: boolean;
  setDefaultLoading?: boolean;
  onSetDefault?: () => void;
}


const { Title, Text } = Typography;

const BrandKitHeader: React.FC<BrandKitHeaderProps> = ({
  selectedKit,
  selectedTab,
  setSelectedTab,
  isMobile,
  isTablet = false,
  isSidebarVisible = true,
  semantic,
  onToggleSidebar,
  isDefaultKit = false,
  setDefaultLoading = false,
  onSetDefault,
}) => (
  <div
    className="brandkit-header-shell"
    style={{
      background: semantic.colorBgContainer,
      borderBottom: "1px solid " + semantic.colorBorder,
      boxSizing: "border-box",
      zIndex: 10,
      width: "100%",
    }}
  >
    {(isMobile || isTablet || !isSidebarVisible) && onToggleSidebar ? (
      <Row
        align="middle"
        style={{ minHeight: isMobile ? 26 : 30, width: "100%", padding: isMobile ? "0 8px" : "0 14px" }}
      >
        <Col flex="none" style={{ marginRight: 8 }}>
          <Button
            className="brandkit-header-action"
            type="text"
            icon={<Palette size={16} />}
            onClick={onToggleSidebar}
            style={{ display: "flex", alignItems: "center", padding: isMobile ? 0 : 4, color: semantic.colorPrimary }}
            aria-label={isSidebarVisible ? "ซ่อนเมนู Brandkit" : "เปิดเมนู Brandkit ทั้งหมด"}
          >
            <span style={{ fontWeight: 400, fontSize: isMobile ? 13 : 14, color: semantic.colorPrimary }}>
              {isSidebarVisible ? "ซ่อน Brandkit" : "Brandkit ทั้งหมด"}
            </span>
          </Button>
        </Col>
      </Row>
    ) : null}
    <Row align="middle" style={{ minHeight: isMobile ? 50 : isTablet ? 58 : 64, width: '100%', padding: isMobile ? "0 8px" : isTablet ? "0 14px" : "0 20px" }}>
     
      <Col flex="auto">
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 0 : 2, width: isMobile ? "100%" : "auto" }}>
          <Title
            style={{
              color: semantic.colorTextBase,
              margin: 0,
              fontSize: isMobile ? 15 : isTablet ? 20 : 24,
              lineHeight: 1.2,
              whiteSpace: isMobile ? "nowrap" : undefined,
              overflow: isMobile ? "hidden" : undefined,
              textOverflow: isMobile ? "ellipsis" : undefined,
              maxWidth: isMobile ? 180 : isTablet ? 280 : undefined,
            }}
            level={isMobile ? 5 : isTablet ? 4 : 3}
          >
            {selectedKit.name || "-"}
          </Title>
          <Text style={{ color: semantic.colorTextSecondary, fontSize: isMobile ? 10 : isTablet ? 12 : 13, whiteSpace: isMobile ? "nowrap" : undefined, overflow: isMobile ? "hidden" : undefined, textOverflow: isMobile ? "ellipsis" : undefined, maxWidth: isMobile ? 180 : isTablet ? 320 : undefined }}>
            {(selectedKit.industryType || "-")} · Updated {(selectedKit.updatedAt || "-")}
          </Text>
        </div>
      </Col>
      <Col>
        <Tooltip
          title={
            isDefaultKit
              ? "This is already the default brand kit"
              : "Set this brand kit as default"
          }
        >
          <Button
            className="brandkit-header-action"
            type="default"
            icon={
              isDefaultKit ? (
                <StarFilled style={{ color: "#f59e0b" }} />
              ) : (
                <StarOutlined style={{ color: semantic.colorTextSecondary }} />
              )
            }
            loading={setDefaultLoading}
            disabled={isDefaultKit || !selectedKit?.id}
            onClick={onSetDefault}
            style={{
              fontSize: isMobile ? 11 : isTablet ? 12 : 14,
              height: isMobile ? 24 : isTablet ? 28 : 32,
              padding: isMobile ? "0 8px" : isTablet ? "0 10px" : undefined,
              minWidth: isMobile ? 92 : isTablet ? 112 : 126,
            }}
            size={isMobile || isTablet ? "small" : "middle"}
          >
            {isMobile ? "Default" : "Default Kit"}
          </Button>
        </Tooltip>
      </Col>
    </Row>
    <Divider style={{ margin: isMobile ? "6px 0 0 0" : isTablet ? "10px 0 0 0" : "12px 0 0 0", width: "100%", maxWidth: "100%", color: `${semantic.colorBorder}` }} />
    {/* Tabs */}
    <Tabs
      className="brandkit-header-tabs"
      activeKey={selectedTab}
      onChange={setSelectedTab}
      tabBarStyle={{
        margin: 0,
        paddingTop: isMobile ? 0 : isTablet ? 6 : 10,
        paddingLeft: isMobile ? 12 : isTablet ? 14 : 20,
        paddingRight: isMobile ? 0 : 0,
        fontSize: isMobile ? 11 : isTablet ? 13 : 15,
        width: "100%",
      }}
      items={[
        { key: "colors", label: <Space size={isMobile ? 2 : 4}><BgColorsOutlined />Colors</Space> },
        { key: "typography", label: <Space size={isMobile ? 2 : 4}><FontSizeOutlined />Typography</Space> },
        // { key: "logos", label: <Space size={isMobile ? 2 : 4}><PictureOutlined />Logos</Space> },
        { key: "ci", label: <Space size={isMobile ? 2 : 4}><BranchesOutlined />CI Prompt</Space> },
        // { key: "voice", label: <Space size={isMobile ? 2 : 4}><MessageOutlined />Brand Voice</Space> },
      ]}
    />

    <style jsx global>{`
      .brandkit-header-action {
        transition: all 180ms ease;
      }

      .brandkit-header-action:hover {
        transform: translateY(-1px);
      }

      .brandkit-header-tabs .ant-tabs-tab {
        transition: all 180ms ease;
      }

      .brandkit-header-tabs .ant-tabs-tab:hover {
        transform: translateY(-1px);
      }
    `}</style>
  </div>
);

export default BrandKitHeader;
