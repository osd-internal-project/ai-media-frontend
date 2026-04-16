import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Input,
  Select,
  Flex,
  Typography,
  ConfigProvider,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { ICouponCode } from "@/app/common/coupon.type";
import dayjs from "dayjs";
import { formatNumber } from "@/app/utils/format";

interface Props {
  data: ICouponCode[];
  loading: boolean;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onSearch: (values: any) => void;
  onAdd: () => void;
  onAddGroup: () => void;
  onEdit: (record: ICouponCode) => void;
  onViewUsage: (record: ICouponCode) => void;
  onExport: (values: any) => void;
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
  onAddGroup,
  onExport,
}) => {
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [fixOrganizationId, setFixOrganizationId] = useState("");
  const [referenceTag, setReferenceTag] = useState("");

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 150,
      render: (text: string) => (
        <Typography.Paragraph
          ellipsis={{
            rows: 1,
            symbol: ">",
            // expandable: "collapsible",
          }}
          copyable
        >
          {text}
        </Typography.Paragraph>
      ),
    },
    // {
    //   title: "Credit",
    //   dataIndex: "onTopCredit",
    //   key: "onTopCredit",
    //   width: 100,
    //   render: (val: number) => formatNumber(val),
    // },
    {
      title: " Limit",
      dataIndex: "usageLimit",
      key: "usageLimit",
      width: 100,
    },
    {
      title: "Tag",
      dataIndex: "referenceTag",
      key: "referenceTag",
      width: 100,
      render: (val: number) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: "Expires At",
      dataIndex: "expiresAt",
      key: "expiresAt",
      width: 130,

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
          <Button size="small" onClick={() => onEdit(record)}>
            <EditOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{  borderRadius: 8 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Space size="middle">
          <Input
            placeholder="Search coupon code"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            onPressEnter={() =>
              onSearch({ code: searchText, status, fixOrganizationId,referenceTag })
            }
          />
          {/* <Input
              placeholder="Search fix organization ID"
              value={fixOrganizationId}
              onChange={(e) => setFixOrganizationId(e.target.value)}
              style={{ width: 200 }}
              onPressEnter={() =>
                onSearch({ code: searchText, status, fixOrganizationId })
              }
            /> */}
          <Input
            placeholder="Search Tag"
            value={referenceTag}
            onChange={(e) => setReferenceTag(e.target.value)}
            style={{ width: 200 }}
            onPressEnter={() =>
              onSearch({ code: searchText, status, fixOrganizationId,referenceTag })
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
              onSearch({ code: searchText, status, fixOrganizationId, referenceTag })
            }
          >
            Search
          </Button>
          <Button
            type="primary"
            onClick={() =>
              onExport({ code: searchText, status, fixOrganizationId, referenceTag })
            }
          >
            Export
          </Button>
        </Space>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAddGroup}>
            Add Group
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            Add
          </Button>
        </Space>
      </Flex>

      <Table
        size="small"
        style={{ fontSize: 12 }}
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
