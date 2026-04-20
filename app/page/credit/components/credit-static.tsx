import React from "react";
import { Row, Col, Card, Typography, Progress, Space } from "antd";
import {
  RiseOutlined,
  FallOutlined,
  PictureOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { useThemeMode } from "@/app/components/ThemeProvider";
import useResponsive from "@/app/hooks/useResponsive";

const { Text, Title } = Typography;

export default function CreditStatic() {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const { isMobile, isTablet } = useResponsive();

  const cardStyle: React.CSSProperties = {
    borderRadius: 18,
    border: `1px solid ${semantic.colorBorder}`,
    background: semantic.colorBgContainer,

    width: "100%",
    height: "100%",
    minHeight: isMobile ? 160 : 142,
    boxShadow:
      mode === "dark"
        ? "0 10px 30px rgba(0,0,0,0.18)"
        : "0 10px 24px rgba(0,0,0,0.06)",
  };

  return (
    <Row gutter={[16, 16]} style={{ padding: "0 24px", alignItems: "stretch" }}>
      {/* Credit Balance */}
      <Col xs={24} sm={12} xl={6} style={{ display: "flex" }}>
        <Card
          bordered={false}
          style={cardStyle}
          styles={{
            body: {
              padding: isMobile ? 18 : 20,
              height: "100%",
            },
          }}
          className="credit-overview-card"
        >
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Text
              style={{
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: semantic.colorTextSecondary,
              }}
            >
              Credit Balance
            </Text>

            <Text
              style={{
                margin: 0,
                fontSize: isMobile ? 24 : 32,
                lineHeight: 1,
                color: semantic.colorPrimary ,
              }}
            >
              5,090
            </Text>

            <div>
              <Progress
                percent={170}
                success={{ percent: 0 }}
                showInfo={false}
                strokeColor={semantic.colorPrimary}
                trailColor={semantic.colorPrimaryBg }
                strokeWidth={8}
              />

              <Text
                style={{
                  display: "block",
                  marginTop: 8,
                  fontSize: 12,
                  color: semantic.colorTextSecondary,
                }}
              >
                170% of 3,000 total
              </Text>
            </div>
          </Space>
        </Card>
      </Col>

      {/* Total Earned */}
      <Col xs={24} sm={12} xl={6} style={{ display: "flex" }}>
        <Card
          bordered={false}
          style={cardStyle}
          styles={{
            body: {
              padding: isMobile ? 18 : 20,
              height: "100%",
            },
          }}
          className="credit-overview-card"
        >
          <Space direction="vertical" size={8}>
            <Text
              style={{
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: semantic.colorTextSecondary,
              }}
            >
              Total Earned
            </Text>

            <Text
              style={{
                margin: 0,
                fontSize: isMobile ? 24 : 32,
                lineHeight: 1,
                color: semantic.colorSuccess,
              }}
            >
              3,000
            </Text>

            <Space size={6}>
              <RiseOutlined
                style={{
                  color: semantic.colorSuccess,
                  fontSize: 12,
                }}
              />
              <Text
                style={{
                  color: semantic.colorSuccess,
                  fontSize: 13,
                }}
              >
                +4 transactions
              </Text>
            </Space>
          </Space>
        </Card>
      </Col>

      {/* Total Spent */}
      <Col xs={24} sm={12} xl={6} style={{ display: "flex" }}>
        <Card
          bordered={false}
          style={cardStyle}
          styles={{
            body: {
              padding: isMobile ? 18 : 20,
              height: "100%",
            },
          }}
          className="credit-overview-card"
        >
          <Space direction="vertical" size={8}>
            <Text
              style={{
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: semantic.colorTextSecondary,
              }}
            >
              Total Spent
            </Text>

            <Text
              style={{
                margin: 0,
                fontSize: isMobile ? 24 : 32,
                lineHeight: 1,
                color: semantic.colorTextBase,
              }}
            >
              635
            </Text>

            <Space size={6}>
              <FallOutlined
                style={{
                  color: semantic.colorTextSecondary,
                  fontSize: 12,
                }}
              />
              <Text
                style={{
                  color: semantic.colorTextSecondary,
                  fontSize: 13,
                }}
              >
                13 generations
              </Text>
            </Space>
          </Space>
        </Card>
      </Col>

      {/* Credit Cost / Gen */}
      <Col xs={24} sm={12} xl={6} style={{ display: "flex" }}>
        <Card
          bordered={false}
          style={cardStyle}
          styles={{
            body: {
              padding: isMobile ? 18 : 20,
              height: "100%",
            },
          }}
          className="credit-overview-card"
        >
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Text
              style={{
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: semantic.colorTextSecondary,
              }}
            >
              Credit Cost / Gen
            </Text>

            <Space
              direction="vertical"
              size={4}
              style={{ width: "100%" }}
            >
              {[
                {
                  icon: "🖼️",
                  label: "Image",
                  value: "5 cr",
                },
                {
                  icon: "🎬",
                  label: "Video",
                  value: "40 cr",
                },
                {
                  icon: "🧑‍🎤",
                  label: "OmniHuman",
                  value: "120 cr",
                },
                {
                  icon: "🎭",
                  label: "DreamActor",
                  value: "150 cr",
                },
              ].map((item) => (
                <Row
                  key={item.label}
                  justify="space-between"
                  align="middle"
                >
                  <Space size={8}>
                    <span
                      style={{
                        color: semantic.colorTextSecondary,
                        fontSize: 14,
                        width: 16,
                        display: "inline-flex",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </span>

                    <Text
                      style={{
                        color: semantic.colorTextSecondary,
                        fontSize: 13,
                      }}
                    >
                      {item.label}
                    </Text>
                  </Space>

                  <Text
                    style={{
                      color:semantic.colorPrimary,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {item.value}
                  </Text>
                </Row>
              ))}
            </Space>
          </Space>
        </Card>
      </Col>

    
    </Row>
  );
}