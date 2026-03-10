import React from "react";
import { Card, Col, Row, Space, Typography } from "antd";
import { Film, Image as ImageIcon, TrendingUp, UserCircle, Video } from "lucide-react";
import type { AnalyticsTabProps } from "../types";
import MontlyGenVolChart from "./montly-gen-vol-chart";
import ProjectImgQoutaUsageChart from "./project-img-qouta-usage-chart";
import TopGenThisMonth from "./top-gen-this-month";
import {
  buildAnalyticsMetricCards,
  buildMonthlyGenerationData,
  buildProjectUsageData,
  buildTopGeneratorsData,
  mockAnalyticsMetricCards,
  mockAnalyticsUsers,
  mockMonthlyGenerationData,
  mockProjectUsageData,
} from "./static";

export default function AnalyticsTab({
  loading,
  userRows,
  summaryByProject,
  projects,
  token,
}: AnalyticsTabProps) {
  const shouldUseMock =
    !loading &&
    userRows.length === 0 &&
    projects.length === 0 &&
    summaryByProject.length === 0;

  const usersSource = shouldUseMock ? mockAnalyticsUsers : userRows;
  const analyticsCards = shouldUseMock
    ? mockAnalyticsMetricCards
    : buildAnalyticsMetricCards(usersSource, summaryByProject);
  const monthlyData = shouldUseMock
    ? mockMonthlyGenerationData
    : buildMonthlyGenerationData(usersSource);
  const projectUsageData = shouldUseMock
    ? mockProjectUsageData
    : buildProjectUsageData(projects);
  const topGenerators = buildTopGeneratorsData(usersSource);

  const metricIcon = {
    image: ImageIcon,
    video: Video,
    human: UserCircle,
    dream: Film,
  } as const;

  const metricColor = {
    image: token.colorPrimary,
    video: token.colorInfo,
    human: token.colorWarning,
    dream: token.colorSuccess,
  } as const;

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={16}>
      <Row gutter={[12, 12]}>
        {analyticsCards.map((item) => {
          const Icon = metricIcon[item.key];
          const color = metricColor[item.key];
          return (
            <Col xs={12} lg={6} key={item.label}>
              <Card loading={loading}>
                <div className="flex items-center justify-between mb-2">
                  <Icon size={16} color={color} />
                  <span style={{ fontSize: 10, color: token.colorSuccess }} className="flex items-center gap-1">
                    <TrendingUp size={12} /> {item.change}
                  </span>
                </div>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {item.value}
                </Typography.Title>
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                  {item.label}
                </Typography.Text>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Monthly Generation Volume" loading={loading}>
            <MontlyGenVolChart
              data={monthlyData}
              colors={{
                image: token.colorPrimary,
                video: token.colorInfo,
                human: token.colorWarning,
                axis: token.colorTextSecondary,
                grid: token.colorBorder,
                tooltipBg: token.colorBgContainer,
                tooltipBorder: token.colorBorder,
                tooltipText: token.colorTextBase,
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Project Image Quota Usage" loading={loading}>
            <ProjectImgQoutaUsageChart
              data={projectUsageData}
              colors={{
                used: token.colorPrimary,
                limit: token.colorBgTextActive,
                axis: token.colorTextSecondary,
                grid: token.colorBorder,
                tooltipBg: token.colorBgContainer,
                tooltipBorder: token.colorBorder,
                tooltipText: token.colorTextBase,
              }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Top Generators This Month" loading={loading}>
        <TopGenThisMonth
          users={topGenerators}
          colors={{
            primary: token.colorPrimary,
            primaryBg: token.colorPrimaryBg,
            progress: token.colorPrimary,
          }}
        />
      </Card>
    </Space>
  );
}
