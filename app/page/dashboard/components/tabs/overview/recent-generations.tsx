"use client";

import React from "react";
import { Card, List, Space, Tag, Tooltip, Typography, theme } from "antd";
import { Sparkles } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { IRecentGeneration } from "@/app/common/dashbaord";
import {
  generationTypeColors,
  generationTypeLabel,
  isGenerationTypeKey,
} from "@/app/common/generation-type";
import { formatNumber } from "@/app/utils/format";
import OverviewEmptyState from "./overview-empty-state";

dayjs.extend(relativeTime);

type RecentGenerationsProps = {
  items: IRecentGeneration[];
  loading: boolean;
  /** Invoked by the empty-state CTA when there is nothing to show. */
  onStartGenerating?: () => void;
};

/**
 * The most recent successful generations in the selected filter range.
 *
 * Reads the same filtered query as the stat cards and the trend chart, so anything listed
 * here is guaranteed to be counted there too.
 */
export default function RecentGenerations({
  items,
  loading,
  onStartGenerating,
}: RecentGenerationsProps) {
  const { token } = theme.useToken();
  const typeColors = generationTypeColors(token);

  return (
    <Card
      styles={{ body: { padding: 16 } }}
      style={{ height: "100%", width: "100%" }}
      loading={loading}
      title={
        <div className="flex items-center gap-2">
          <Sparkles size={16} color={token.colorPrimary} />
          <span>Recent Generations</span>
          {/* Derived from the list itself so the badge can never drift from the rows. */}
          <Tag style={{ marginInlineEnd: 0 }}>{items.length}</Tag>
        </div>
      }
    >
      {items.length === 0 && !loading ? (
        <OverviewEmptyState
          icon={<Sparkles size={22} />}
          title="No generations yet"
          description="Nothing was generated in the selected range. Try a wider date range, or start a new generation."
          action={
            onStartGenerating
              ? { label: "Start generating", onClick: onStartGenerating }
              : undefined
          }
          size="compact"
        />
      ) : (
        <List
          dataSource={items}
          renderItem={(item) => {
            const color = isGenerationTypeKey(item.type)
              ? typeColors[item.type]
              : token.colorTextQuaternary;

            return (
              <List.Item key={item.id}>
                <List.Item.Meta
                  avatar={
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: `${color}1F`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Sparkles size={16} color={color} />
                    </div>
                  }
                  title={
                    <Space size={8} wrap>
                      <Typography.Text>
                        {item.projectName || "Unknown project"}
                      </Typography.Text>
                      <Tag color={color} style={{ marginInlineEnd: 0 }}>
                        {generationTypeLabel(item.type)}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: 12 }}
                      ellipsis
                    >
                      {item.userFullname || "Unknown user"}
                      {item.prompt ? ` · ${item.prompt}` : ""}
                    </Typography.Text>
                  }
                />
                <div className="text-right shrink-0">
                  <Typography.Text style={{ fontSize: 13 }}>
                    {formatNumber(item.usedCredit)} credits
                  </Typography.Text>
                  <br />
                  <Tooltip
                    title={dayjs(item.createdAt).format("D MMM YYYY, HH:mm")}
                  >
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      {dayjs(item.createdAt).fromNow()}
                    </Typography.Text>
                  </Tooltip>
                </div>
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
}
