import React from "react";
import { Row, Col, Card, Typography, Progress, Space, Empty } from "antd";
import {
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { useThemeMode } from "@/app/components/ThemeProvider";
import useResponsive from "@/app/hooks/useResponsive";

const { Text } = Typography;

type CreditStaticProps = {
  balance?: number;
  totalAllowance?: number;
  totalSpent?: number;
  couponUsageCount?: number;
  couponTopUpTotal?: number;
};

const formatMetric = (value?: number) => {
  if (typeof value !== "number") {
    return "-";
  }

  return value.toLocaleString();
};

export default function CreditStatic({
  balance,
  totalAllowance,
  totalSpent,
  couponUsageCount,
  couponTopUpTotal,
}: CreditStaticProps) {
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};
  const { isMobile } = useResponsive();
  const hasAllowance = typeof totalAllowance === "number" && totalAllowance > 0;
  const hasBalance = typeof balance === "number";
  const hasSpent = typeof totalSpent === "number";
  const balancePercent =
    hasAllowance && hasBalance ? (balance / totalAllowance) * 100 : 0;

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
              {formatMetric(balance)}
            </Text>

            <div>
              <Progress
                percent={balancePercent}
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
                {hasAllowance
                  ? `${Math.round(balancePercent)}% of ${formatMetric(totalAllowance)} total`
                  : "No plan allowance data"}
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
              {formatMetric(totalAllowance)}
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
                {typeof couponTopUpTotal === "number" && couponTopUpTotal > 0
                  ? `+${formatMetric(couponTopUpTotal)} coupon credits`
                  : "Current cycle allocation"}
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
              {formatMetric(totalSpent)}
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
                {hasSpent
                  ? `${couponUsageCount || 0} coupon transactions`
                  : "No usage data"}
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
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No cost data"
              />
            </Space>
          </Space>
        </Card>
      </Col>

    
    </Row>
  );
}