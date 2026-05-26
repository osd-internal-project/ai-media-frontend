import React from "react";
import { Button, Card, Image, List, Space, Tag, Typography, theme } from "antd";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { DashboardUserRow } from "../types";

type ResourceAlertProps = {
  alertUsers: DashboardUserRow[];
  openQuotaModal: (user: DashboardUserRow) => void;
};

export default function RecentGenerations({
  alertUsers,
  openQuotaModal,
}: ResourceAlertProps) {
  const { token } = theme.useToken();
  const data = [
    {
      count: 1,
      type: "image",
      projectName: "Project A",
      generatedAt: new Date(),
      creditUsed: 100,
    },
    {
      count: 2,
      type: "video",
      projectName: "Project B",
      generatedAt: new Date(),
      creditUsed: 100,
    },
  ];
  return (
    <Card
      bodyStyle={{ padding: 16 }}
      style={{ height: "100%", width: "100%" }}
      title={
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} color={token.colorWarning} />
          <span>Recent Generations</span>
          <Tag color="warning" style={{ marginInlineEnd: 0 }}>
            {alertUsers.length}
          </Tag>
        </div>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }} size={8}>
        <List
          //   header={<div>Header</div>}
          //   footer={<div>Footer</div>}
          bordered
          dataSource={data}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Image
                    src={`https://api.dicebear.com/7.x/miniavs/svg?seed=1`}
                  />
                }
                title={<a href="https://ant.design">{item.projectName}</a>}
                description={`${item.type} - ${item.creditUsed}`}
              />
              <div>
                <div>{item.creditUsed}</div>
                <div>{item.generatedAt.toDateString()}</div>
              </div>
            </List.Item>
          )}
        />
      </Space>
    </Card>
  );
}
