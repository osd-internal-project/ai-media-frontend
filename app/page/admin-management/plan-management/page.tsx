"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Input,
  Space,
  message,
  Typography,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { TPlan } from "@/app/common/plan.type";
import PlanServices from "@/app/services/plan.service";
import { axiosCore } from "@/app/lib/axios/axios";
import { useRouter } from "next/navigation";
import { PlanFormModal } from "./components/PlanFormModal";

const { Text } = Typography;

export default function PlanManagementPage() {
  const router = useRouter();
  const [data, setData] = useState<TPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const planServices = PlanServices(axiosCore);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await planServices.findAllFormatted();
      setData(response || []);
    } catch (error: any) {
      console.error(error);
      messageApi.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  }, [messageApi, planServices]);

  useEffect(() => {
    if (loading) fetchData();
  }, [loading, fetchData]);

  const handleCreatePlan = async (values: TPlan) => {
    setModalLoading(true);
    try {
      const newPlan = await planServices.create(values);
      if (newPlan) {
        messageApi.success("Plan created successfully");
        setIsModalOpen(false);
        // Redirect to detail page to add features
        router.push(`/page/admin-management/plan-management/${newPlan.id}`);
      }
    } catch (error: any) {
      console.error(error);
      messageApi.error("Failed to create plan");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      const success = await planServices.delete(id);
      if (success) {
        messageApi.success("Plan deleted successfully");
        fetchData();
      } else {
        messageApi.error("Failed to delete plan");
      }
    } catch (error: any) {
      console.error(error);
      messageApi.error("Error deleting plan");
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns: ColumnsType<TPlan> = [
    {
      title: "Plan Name",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <div className="flex items-center gap-2">
            <Text className="text-white font-medium">{text}</Text>
          </div>
          <Text type="secondary" className="text-xs">
            {record.id}
          </Text>
        </Space>
      ),
    },
    {
      title: "Monthly Price",
      dataIndex: ["price", "monthly"],
      key: "monthlyPrice",
      width: 150,
      render: (price) => (
        <Text className="text-white">${price?.toLocaleString() || "0.00"}</Text>
      ),
    },
    {
      title: "Annual Price",
      dataIndex: ["price", "annually"],
      key: "annualPrice",
      width: 150,
      render: (price) => (
        <Text className="text-white">${price?.toLocaleString() || "0.00"}</Text>
      ),
    },
    {
      title: "Features",
      key: "features",
      width: 120,
      render: (_, record) => (
        <Tag color="cyan">{record.features?.length || 0} Features</Tag>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (tags, record) => (
        <Space size={"small"}>
          {record.popular && (
            <Tag color="gold" icon={<TrophyOutlined />}>
              Popular
            </Tag>
          )}
          {record.badge && <Tag color="blue">{record.badge}</Tag>}
          {record.isDefault && <Tag color="green">Default</Tag>}
        </Space>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() =>
              router.push(`/page/admin-management/plan-management/${record.id}`)
            }
            className="text-blue-400! hover:text-blue-300!"
          />
          <Popconfirm
            title="Delete Plan"
            description="Are you sure you want to delete this plan?"
            onConfirm={() => handleDeletePlan(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-400! hover:text-red-300!"
              danger
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full h-full ">
      {contextHolder}

      <PlanFormModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={handleCreatePlan}
        loading={modalLoading}
      />

      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Pricing Plan Management
          </h1>
          <p className="text-gray-400">
            Manage subscription plans and features
          </p>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            className=" border-gray-700! hover:bg-gray-700!"
            onClick={fetchData}
            loading={loading}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Plan
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <div className=" p-4 rounded-lg mb-4">
        <Input
          placeholder="Search plans by name or description..."
          prefix={<SearchOutlined className="text-gray-500" />}
          className="w-full "
     
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className=" rounded-lg overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} plans`,
          }}
          size="small"
          className="custom-table"
          locale={{ emptyText: "No plans found" }}
        />
      </div>
    </div>
  );
}
