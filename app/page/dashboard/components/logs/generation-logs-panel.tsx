"use client";

import React, { useState } from "react";
import { Alert, Button, Card, Select, Space, Table, Tag, Tooltip, Typography, theme } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ChevronRight, Sparkles } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { GenerationLogStatus, IGenerationLog } from "@/app/common/dashbaord";
import {
  GENERATION_TYPE_OPTIONS,
  generationSeriesColors,
  generationTypeLabel,
  isGenerationTypeKey,
} from "@/app/common/generation-type";
import { formatNumber } from "@/app/utils/format";
import OverviewEmptyState from "../tabs/overview/overview-empty-state";
import LogDetailDrawer from "./log-detail-drawer";
import LogStatusTag from "./log-status-tag";
import useGenerationLogs, { type GenerationLogScope } from "./use-generation-logs";

dayjs.extend(relativeTime);

const STATUS_OPTIONS: { value: GenerationLogStatus; label: string }[] = [
  { value: "success", label: "Success" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "all", label: "All statuses" },
];

const TYPE_OPTIONS = [
  ...GENERATION_TYPE_OPTIONS,
  { value: "other", label: "Other" },
];

type GenerationLogsPanelProps = {
  organizationId: string | undefined;
  scope: GenerationLogScope;
  title?: React.ReactNode;
  /** Hide a column that is constant for the scope (e.g. Project inside a project's logs). */
  hideProject?: boolean;
  hideUser?: boolean;
  /** Drop the card chrome when the panel already sits in a drawer. */
  bare?: boolean;
};

/**
 * Paginated generation logs for a scope (whole org, one project or one user). Rows open the
 * detail drawer, which shows the result the way its creator saw it.
 */
export default function GenerationLogsPanel({
  organizationId,
  scope,
  title = "Generation logs",
  hideProject,
  hideUser,
  bare,
}: GenerationLogsPanelProps) {
  const { token } = theme.useToken();
  const typeColors = generationSeriesColors(token);
  const logs = useGenerationLogs(organizationId, scope);
  const [openLogId, setOpenLogId] = useState<string | null>(null);

  const columns: ColumnsType<IGenerationLog> = [
    {
      title: "Generation",
      key: "generation",
      render: (_, item) => {
        const color = isGenerationTypeKey(item.type)
          ? typeColors[item.type]
          : typeColors.other;
        return (
          <div className="flex items-start gap-3 min-w-0">
            <div
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: 10,
                background: `${color}1F`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={16} color={color} />
            </div>
            <div className="min-w-0">
              <Space size={6} wrap>
                <Tag color={color} style={{ marginInlineEnd: 0 }}>
                  {item.type ? generationTypeLabel(item.type) : "Other"}
                </Tag>
                {logs.status === "all" && <LogStatusTag status={item.status} />}
                {!hideProject && (
                  <Typography.Text style={{ fontSize: 13 }}>
                    {item.projectName || "Unknown project"}
                  </Typography.Text>
                )}
              </Space>
              <Typography.Paragraph
                type="secondary"
                ellipsis={{ rows: 1 }}
                style={{ fontSize: 12, margin: "2px 0 0", maxWidth: 640 }}
              >
                {item.prompt || "No prompt"}
              </Typography.Paragraph>
            </div>
          </div>
        );
      },
    },
    ...(hideUser
      ? []
      : [
          {
            title: "User",
            key: "user",
            width: 180,
            responsive: ["md" as const],
            render: (_: unknown, item: IGenerationLog) => (
              <Typography.Text style={{ fontSize: 13 }}>
                {item.userFullname || "Unknown user"}
              </Typography.Text>
            ),
          },
        ]),
    {
      title: "Credits",
      key: "credits",
      width: 120,
      align: "right",
      render: (_, item) => formatNumber(item.usedCredit),
    },
    {
      title: "Created",
      key: "createdAt",
      width: 130,
      align: "right",
      render: (_, item) => (
        <Tooltip title={dayjs(item.createdAt).format("D MMM YYYY, HH:mm")}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(item.createdAt).fromNow()}
          </Typography.Text>
        </Tooltip>
      ),
    },
    {
      key: "open",
      width: 32,
      render: () => <ChevronRight size={16} color={token.colorTextTertiary} />,
    },
  ];

  const filtered = logs.status !== "success" || Boolean(logs.type);

  const body = (
    <Space direction="vertical" style={{ width: "100%" }} size={12}>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={logs.status}
          onChange={logs.setStatus}
          options={STATUS_OPTIONS}
          style={{ width: 150 }}
          aria-label="Filter by status"
        />
        <Select
          value={logs.type}
          onChange={logs.setType}
          options={TYPE_OPTIONS}
          allowClear
          placeholder="All types"
          style={{ width: 150 }}
          aria-label="Filter by type"
        />
      </div>

      {logs.error && (
        <Alert
          type="error"
          showIcon
          message={logs.error}
          action={
            <Button size="small" onClick={logs.reload}>
              Retry
            </Button>
          }
        />
      )}

      <Table<IGenerationLog>
        rowKey="id"
        size="middle"
        loading={logs.loading}
        columns={columns}
        dataSource={logs.result.data}
        onRow={(item) => ({
          onClick: () => setOpenLogId(item.id),
          style: { cursor: "pointer" },
        })}
        locale={{
          emptyText: (
            <OverviewEmptyState
              icon={<Sparkles size={22} />}
              title="No generations match"
              description={
                filtered
                  ? "Clear the status or type filter, or widen the date range."
                  : "Nothing was generated in this range. Widen the date range to see older work."
              }
              size="compact"
            />
          ),
        }}
        pagination={{
          current: logs.page,
          pageSize: logs.pageSize,
          total: logs.result.total,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          showTotal: (total, [start, end]) => `${start}–${end} of ${formatNumber(total)}`,
          onChange: logs.setPagination,
        }}
        scroll={{ x: 640 }}
      />
    </Space>
  );

  return (
    <>
      {bare ? (
        body
      ) : (
        <Card
          style={{ width: "100%" }}
          styles={{ body: { padding: 16 } }}
          title={
            <div className="flex items-center gap-2">
              <Sparkles size={16} color={token.colorPrimary} />
              <span>{title}</span>
              <Tag style={{ marginInlineEnd: 0 }}>{formatNumber(logs.result.total)}</Tag>
            </div>
          }
        >
          {body}
        </Card>
      )}

      <LogDetailDrawer
        organizationId={organizationId}
        logId={openLogId}
        onClose={() => setOpenLogId(null)}
      />
    </>
  );
}
