import React, { useState } from "react";
import { Table, Button, Space, Tag, Tooltip, Input, Select, Flex } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { ICouponCode } from "@/app/common/coupon.type";
import dayjs from "dayjs";

interface Props {
  data: ICouponCode[];
  loading: boolean;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onSearch: (values: any) => void;
  onAdd: () => void;
  onEdit: (record: ICouponCode) => void;
  onViewUsage: (record: ICouponCode) => void;
}

const CouponTable: React.FC<Props> = ({
  data,
  loading,
  total,
  onPageChange,
  onSearch,
  onAdd,
  onEdit,
  onViewUsage,
}) => {
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [fixOrganizationId, setFixOrganizationId] = useState("");

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "OnTop Credit",
      dataIndex: "onTopCredit",
      key: "onTopCredit",
      render: (val: number) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: "Usage Limit",
      dataIndex: "usageLimit",
      key: "usageLimit",
    },
    {
      title: "Expires At",
      dataIndex: "expiresAt",
      key: "expiresAt",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "green";
        if (status === "INACTIVE") color = "orange";
        if (status === "EXPIRED") color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Fixed Org",
      dataIndex: "fixOrganizationId",
      key: "fixOrganizationId",
      render: (val: string) => val || "None",
    },
    {
      title: "Usage",
      key: "usage",
      render: (_: any, record: ICouponCode) => (
        <Tooltip title="View Usage">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => onViewUsage(record)}
          />
        </Tooltip>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: ICouponCode) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)}>
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, borderRadius: 8 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Space size="middle">
          <Input
            placeholder="Search coupon code"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            onPressEnter={() =>
              onSearch({ code: searchText, status, fixOrganizationId })
            }
          />
          <Input
            placeholder="Search fix organization ID"
            value={fixOrganizationId}
            onChange={(e) => setFixOrganizationId(e.target.value)}
            style={{ width: 200 }}
            onPressEnter={() =>
              onSearch({ code: searchText, status, fixOrganizationId })
            }
          />
          <Select
            placeholder="Status"
            style={{ width: 120 }}
            allowClear
            value={status}
            onChange={(val) => setStatus(val)}
          >
            <Select.Option value="ACTIVE">ACTIVE</Select.Option>
            <Select.Option value="INACTIVE">INACTIVE</Select.Option>
            <Select.Option value="EXPIRED">EXPIRED</Select.Option>
          </Select>
          <Button
            type="primary"
            onClick={() =>
              onSearch({ code: searchText, status, fixOrganizationId })
            }
          >
            Search
          </Button>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          Add Coupon
        </Button>
      </Flex>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          total: total,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
      />
    </div>
  );
};

export default CouponTable;
