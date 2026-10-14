import React from "react";
import { Button, Card, Col, Progress, Row, Space, Typography, theme } from "antd";
import { BarChart3, FolderOpen, PieChart, TrendingUp } from "lucide-react";
import type { OverviewTabProps } from "../types";
import GenerationTrendChart from "./generation-trend-chart";
import ByTypeChart from "./by-type-chart";
import RecentGenerations from "./recent-generations";
import OverviewEmptyState from "./overview-empty-state";
import OverviewFilters from "./overview-filters";
import {
  GENERATION_TYPE_KEYS,
  GENERATION_TYPE_LABEL,
  generationTypeColors,
} from "@/app/common/generation-type";
import { formatNumber } from "@/app/utils/format";

export default function OverviewTab({
  loading,
  statCards,
  filters,
  onFiltersChange,
  projectOptions,
  visibleTypes,
  hasProjects,
  hasGenerations,
  generationCount,
  generationSeries,
  generationByType,
  recentGenerations,
  onCreateProject,
  onStartGenerating,
}: OverviewTabProps) {
  const { token } = theme.useToken();
  const typeColors = generationTypeColors(token);
  const metricLabel = filters.metric === "credit" ? "credits" : "generations";

  // Distinguish "nothing happened" from "things happened but cost nothing", so the charts
  // never look like they disagree with the Generations card or the Recent Generations list.
  const emptyChartDescription =
    generationCount > 0
      ? `${generationCount} generation${generationCount === 1 ? "" : "s"} in this range used no credits. Switch the metric to Generations to see them.`
      : "Nothing was generated for the selected filters. Widen the date range or clear the project filter.";

  // An organization with no projects cannot have any of the other panels populated, so it
  // gets a single actionable empty state instead of a grid of zeroes.
  if (!loading && !hasProjects) {
    return (
      <Card>
        <OverviewEmptyState
          icon={<FolderOpen size={22} />}
          title="No projects yet"
          description="Create your first project to start generating and to see usage across your organization."
          action={
            onCreateProject
              ? { label: "Create project", onClick: onCreateProject }
              : undefined
          }
        />
      </Card>
    );
  }

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={16}>
      <OverviewFilters
        filters={filters}
        onChange={onFiltersChange}
        projectOptions={projectOptions}
        disabled={loading}
      />

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
                    strokeColor={card.progressColor}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    {card.sub} · {card.progress.toFixed(0)}% used
                  </Typography.Text>
                  {card.footer}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    {card.sub}
                  </Typography.Text>
                  {card.trend && (
                    <span
                      className="ml-auto flex items-center gap-1"
                      style={{ fontSize: 11, color: token.colorTextSecondary }}
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
            {hasGenerations ? (
              <Space direction="vertical" style={{ width: "100%" }} size={12}>
                <GenerationTrendChart
                  data={generationSeries}
                  visibleTypes={visibleTypes}
                  colors={{
                    types: typeColors,
                    axis: token.colorTextSecondary,
                    grid: token.colorBorder,
                    tooltipBg: token.colorBgContainer,
                    tooltipBorder: token.colorBorder,
                    tooltipText: token.colorTextBase,
                  }}
                />
                <Space size={14} wrap>
                  {GENERATION_TYPE_KEYS.map((key) => {
                    const isVisible = visibleTypes.includes(key);
                    return (
                      <Space size={6} key={key}>
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            background: typeColors[key],
                            display: "inline-block",
                            opacity: isVisible ? 1 : 0.3,
                          }}
                        />
                        <Typography.Text
                          type="secondary"
                          delete={!isVisible}
                          style={{ fontSize: 12 }}
                        >
                          {GENERATION_TYPE_LABEL[key]}
                        </Typography.Text>
                      </Space>
                    );
                  })}
                </Space>
              </Space>
            ) : (
              <OverviewEmptyState
                icon={<BarChart3 size={22} />}
                title={`No ${metricLabel} in this range`}
                description={emptyChartDescription}
                size="compact"
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8} className="flex">
          <Card
            title="By Type"
            loading={loading}
            style={{ height: "100%", width: "100%" }}
          >
            {hasGenerations ? (
              <Space direction="vertical" style={{ width: "100%" }} size={8}>
                <ByTypeChart
                  data={generationByType}
                  colors={{
                    tooltipBg: token.colorBgContainer,
                    tooltipBorder: token.colorBorder,
                    tooltipText: token.colorTextBase,
                  }}
                />
                {generationByType.map((item) => (
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
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        {item.name}
                      </Typography.Text>
                    </Space>
                    <Typography.Text>
                      {formatNumber(item.value || 0)}
                    </Typography.Text>
                  </div>
                ))}
              </Space>
            ) : (
              <OverviewEmptyState
                icon={<PieChart size={22} />}
                title="Nothing to break down"
                description={emptyChartDescription}
                size="compact"
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={24} className="flex">
          <RecentGenerations
            items={recentGenerations}
            loading={loading}
            onStartGenerating={onStartGenerating}
          />
        </Col>
      </Row>
    </Space>
  );
}
