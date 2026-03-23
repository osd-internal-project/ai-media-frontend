import React from "react";
import { Card, Input, Space, Table, theme } from "antd";
import { Search } from "lucide-react";
import type { ProjectsTabProps } from "../types";

export default function ProjectsTab({
  loading,
  projectSearch,
  setProjectSearch,
  projectColumns,
  filteredProjects,
}: ProjectsTabProps) {
  const { token } = theme.useToken();

  return (
    <Card
      bordered={false}
      style={{ background: "transparent", boxShadow: "none" }}
      bodyStyle={{ padding: 0 }}
    >
      <Space direction="vertical" style={{ width: "100%" }} size={12}>
        <Input
          prefix={<Search size={14} />}
          placeholder="Search projects"
          value={projectSearch}
          onChange={(event) => setProjectSearch(event.target.value)}
          className="max-w-[320px]"
        />
        <Table
          rowKey="id"
          loading={loading}
          columns={projectColumns}
          dataSource={filteredProjects}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 920 }}
          components={{
            header: {
              cell: (props: any) => (
                <th
                  {...props}
                  style={{
                    ...props.style,
                    borderBottom: `1px solid ${token.colorBorder}`,
                    background: token.colorBgTextActive,
                    color: token.colorTextBase,
                  }}
                />
              ),
            },
            body: {
              cell: (props: any) => (
                <td
                  {...props}
                  style={{
                    ...props.style,
                    borderBottom: `1px solid ${token.colorBorder}`,
                    background: token.colorBgContainer,
                  }}
                />
              ),
            },
          }}
          style={{
            width: "100%",
            borderRadius: 12,
            overflow: "hidden",
            border: `1px solid ${token.colorBorder}`,
            background: token.colorBgContainer,
          }}
        />
      </Space>
    </Card>
  );
}
