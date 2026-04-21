import { TPlan } from "@/app/common/plan.type";
import { Button, Popconfirm, Space, Tag, Typography } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { FC } from "react";
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

interface PlanListViewProps {
  loading: boolean;
  filteredData: TPlan[];
  handleDeletePlan: (planId: string) => void;
}

const { Text } = Typography;

const PlanListView: FC<PlanListViewProps> = ({ loading, filteredData, handleDeletePlan }) => {
    const router = useRouter();
    const columns: ColumnsType<TPlan> = [
        {
          title: "Plan Name",
          dataIndex: "name",
          key: "name",
          width: 320,
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
              {record.isPopular && (
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
    )
}
export default PlanListView;