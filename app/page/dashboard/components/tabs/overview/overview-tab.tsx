import React from "react";
import { Card, Col, Progress, Row, Space, Typography, theme } from "antd";
import { TrendingUp } from "lucide-react";
import { aiCaveColors } from "@/app/theme/themeConfig";
import type { OverviewTabProps } from "../types";
import GenerationTrendChart from "./generation-trend-chart";
import ByTypeChart from "./by-type-chart";
// import { typeDistributionBase } from "./static";
import ResourceAlert from "./resource-alert";
import PendingApprovalCard from "./pending-approval";
import dayjs from "dayjs";
import { formatNumber } from "@/app/utils/format";
import RecentGenerations from "./recent-generations";

export default function OverviewTab({
  loading,
  statCards,
  alertUsers,
  pendingApprovals,
  openQuotaModal,
  onApprove,
  onDeny,
  setActiveTab,
  usedCreditPerMonth,
  usedCreditByType,
}: OverviewTabProps) {
  const { token } = theme.useToken();

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={16}>
      <Row gutter={[16, 16]}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.label}>
            <Card loading={loading} style={{ height: "100%" }}>
              <div className="flex items-center justify-between mb-2">
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {card.label}
                </Typography.Text>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: card.iconBg,
                    color: card.iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {card.icon}
                </div>
              </div>

              <Typography.Title level={3} style={{ margin: 0 }}>
                {card.value}
              </Typography.Title>

              {typeof card.progress === "number" ? (
                <>
                  <Progress
                    percent={Math.min(card.progress, 100)}
                    showInfo={false}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    {card.sub} · {card.progress.toFixed(0)}% used
                  </Typography.Text>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    {card.sub}
                  </Typography.Text>
                  {card.trend && (
                    <span
                      className="ml-auto flex items-center gap-1"
                      style={{ fontSize: 11, color: token.colorSuccess }}
                    >
                      <TrendingUp size={12} />
                      {card.trend}
                    </span>
                  )}
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} lg={16} className="flex">
          <Card
            title="Generation Trends"
            loading={loading}
            style={{ height: "100%", width: "100%" }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size={12}>
              <GenerationTrendChart
                data={usedCreditPerMonth}
                colors={{
                  image: token.colorPrimary,
                  video: token.colorInfo,
                  human: token.colorWarning,
                  dreamactor: token.colorError,
                  axis: token.colorTextSecondary,
                  grid: token.colorBorder,
                  tooltipBg: token.colorBgContainer,
                  tooltipBorder: token.colorBorder,
                  tooltipText: token.colorTextBase,
                }}
              />
              <Space size={14} wrap>
                <Space size={6}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: token.colorPrimary,
                      display: "inline-block",
                    }}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Image
                  </Typography.Text>
                </Space>
                <Space size={6}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: token.colorInfo,
                      display: "inline-block",
                    }}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Video
                  </Typography.Text>
                </Space>
                <Space size={6}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: token.colorWarning,
                      display: "inline-block",
                    }}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Human
                  </Typography.Text>
                </Space>
                <Space size={6}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: aiCaveColors.dreamActor,
                      display: "inline-block",
                    }}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Dream
                  </Typography.Text>
                </Space>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8} className="flex">
          <Card
            title="By Type"
            loading={loading}
            style={{ height: "100%", width: "100%" }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size={8}>
              <ByTypeChart
                data={usedCreditByType}
                colors={{
                  tooltipBg: token.colorBgContainer,
                  tooltipBorder: token.colorBorder,
                  tooltipText: token.colorTextBase,
                }}
              />
              {usedCreditByType.map((item) => (
                <div
                  className="flex items-center justify-between"
                  key={item.name}
                >
                  <Space size={8}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: item.color,
                        display: "inline-block",
                      }}
                    />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {item.name}
                    </Typography.Text>
                  </Space>
                  <Typography.Text>
                    {formatNumber(item.value || 0)}
                  </Typography.Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={24} className="flex"> 
          <RecentGenerations
            alertUsers={alertUsers}
            openQuotaModal={openQuotaModal}
          />
        </Col>
      </Row>
      {/* Hide Tabs */}
      {/* <Row gutter={[16, 16]}>
        <Col xs={24} lg={24} className="flex">
          <ResourceAlert
            alertUsers={alertUsers}
            openQuotaModal={openQuotaModal}
          />
        </Col>

        <Col xs={24} lg={12} className="flex">
          <PendingApprovalCard
            pendingApprovals={pendingApprovals}
            onApprove={onApprove}
            onDeny={onDeny}
            setActiveTab={setActiveTab}
          />
        </Col>
      </Row> */}
    </Space>
  );
}
