import React from "react";
import { Card, Input, Space, Table, theme } from "antd";
import { Search } from "lucide-react";
import type { UsersTabProps } from "../types";

export default function UsersTab({
  loading,
  userSearch,
  setUserSearch,
  userColumns,
  filteredUsers,
}: UsersTabProps) {
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
          placeholder="Search users"
          value={userSearch}
          onChange={(event) => setUserSearch(event.target.value)}
          className="max-w-[320px]"
        />
        <Table
          rowKey="userId"
          loading={loading}
          columns={userColumns}
          dataSource={filteredUsers}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 980 }}
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
