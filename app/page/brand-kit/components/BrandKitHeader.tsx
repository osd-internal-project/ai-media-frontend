import { Row, Col, Divider, Tabs, Button, Typography, Space } from "antd";
import { StarOutlined, BgColorsOutlined, FontSizeOutlined, BranchesOutlined } from "@ant-design/icons";
import React from "react";

import { MenuOutlined } from "@ant-design/icons";
import { Palette } from "lucide-react";

interface BrandKitHeaderProps {
  selectedKit: any;
  selectedTab: string;
  setSelectedTab: (key: string) => void;
  isMobile: boolean;
  semantic: any;
  onToggleSidebar?: () => void;
}


const { Title, Text } = Typography;

const BrandKitHeader: React.FC<BrandKitHeaderProps> = ({ selectedKit, selectedTab, setSelectedTab, isMobile, semantic, onToggleSidebar }) => (
  <div
    style={{
      background: semantic.colorBgContainer,
      borderBottom: "1px solid " + semantic.colorBorder,
      
      boxSizing: "border-box",
      zIndex: 10,
      width: '100%',
    }}
    >
           {isMobile && ( <Row align="middle" style={{ minHeight: isMobile ? 24 : 72, width: '100%', padding: isMobile ? "0 8px" : "0 24px" }}>
     
       
            <Col flex="none" style={{ marginRight: 8 }}>
                
          <Button
            type="text"
            icon={<Palette size={16}  />}
            onClick={onToggleSidebar}
            style={{ display: 'flex', alignItems: 'center', padding: isMobile ? 0 : 6, color: semantic.colorPrimary }}
            aria-label="เปิดเมนู Brandkit ทั้งหมด"
          >
            <span style={{ fontWeight: 400, fontSize: 14, color: semantic.colorPrimary }}>Brandkit ทั้งหมด</span>
          </Button>
        </Col>
           
            </Row> )}
    <Row align="middle" style={{ minHeight: isMobile ? 56 : 72, width: '100%', padding: isMobile ? "0 8px" : "0 24px" }}>
     
      <Col flex="auto">
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 0 : 2, width: isMobile ? "100%" : "auto" }}>
          <Title
            style={{
              color: semantic.colorTextBase,
              margin: 0,
              fontSize: isMobile ? 16 : 28,
              lineHeight: 1.2,
              whiteSpace: isMobile ? "nowrap" : undefined,
              overflow: isMobile ? "hidden" : undefined,
              textOverflow: isMobile ? "ellipsis" : undefined,
              maxWidth: isMobile ? 200 : undefined,
            }}
            level={isMobile ? 5 : 3}
          >
            {selectedKit.name || "-"}
          </Title>
          <Text style={{ color: semantic.colorTextSecondary, fontSize: isMobile ? 10 : 14, whiteSpace: isMobile ? "nowrap" : undefined, overflow: isMobile ? "hidden" : undefined, textOverflow: isMobile ? "ellipsis" : undefined, maxWidth: isMobile ? 200 : undefined }}>
            {(selectedKit.industryType || "-")} · Updated {(selectedKit.updatedAt || "-")}
          </Text>
        </div>
      </Col>
      <Col>
        <Button
          type="default"
          icon={<StarOutlined />}
          style={{
            fontSize: isMobile ? 11 : 16,
            height: isMobile ? 24 : 32,
            padding: isMobile ? "0 8px" : undefined,
            minWidth: isMobile ? 80 : 100,
          }}
          size={isMobile ? "small" : "middle"}
        >
          Default Kit
        </Button>
      </Col>
    </Row>
    <Divider style={{ margin: isMobile ? "8px 0 0 0" : "16px 0 0 0", width: "100%", maxWidth: "100%", color: `${semantic.colorBorder}` }} />
    {/* Tabs */}
    <Tabs
      activeKey={selectedTab}
      onChange={setSelectedTab}
      tabBarStyle={{
        margin: 0,
        paddingTop: isMobile ? 2 : 12,
        paddingLeft: isMobile ? 16 : 24,
        paddingRight: isMobile ? 0 : 0,
        fontSize: isMobile ? 11 : 16,
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
  </div>
);

export default BrandKitHeader;
