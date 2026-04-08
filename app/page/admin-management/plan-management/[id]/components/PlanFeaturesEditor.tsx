"use client";
import React from "react";
import {
  Table,
  Button,
  Input,
  Switch,
  InputNumber,
  Space,
  Card,
  Typography,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  DragOutlined,
} from "@ant-design/icons";
import { TPlanFeature } from "@/app/common/plan.type";

const { Text } = Typography;

interface PlanFeaturesEditorProps {
  features: TPlanFeature[];
  onChange: (features: TPlanFeature[]) => void;
}

export const PlanFeaturesEditor: React.FC<PlanFeaturesEditorProps> = ({
  features,
  onChange,
}) => {
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);

  const handleAddFeature = () => {
    const newFeature: TPlanFeature = {
      key: `feature_${Date.now()}`,
      label: "",
      text: "",
      icon: "✓",
      isHighlight: false,
      category: "General",
      orderIndex: features.length,
    };
    onChange([...features, newFeature]);
  };

  const handleUpdateFeature = (
    index: number,
    field: keyof TPlanFeature,
    value: any,
  ) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onChange(newFeatures);
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    // Re-index
    const reindexed = newFeatures.map((f, i) => ({ ...f, orderIndex: i }));
    onChange(reindexed);
  };

  const moveRow = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newFeatures = [...features];
    const item = newFeatures.splice(fromIndex, 1)[0];
    newFeatures.splice(toIndex, 0, item);
    // Re-index
    const reindexed = newFeatures.map((f, i) => ({ ...f, orderIndex: i }));
    onChange(reindexed);
  };

  const columns = [
    {
      title: "",
      key: "sort",
      width: 40,
      render: () => (
        <DragOutlined style={{ cursor: "grab", color: "#666" }} />
      ),
    },
    {
      title: "#",
      dataIndex: "orderIndex",
      key: "orderIndex",
      width: 60,
      render: (val: number) => <Text type="secondary">{val}</Text>,
    },
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      width: 150,
      render: (text: string, record: TPlanFeature, index: number) => (
        <Input
          value={text}
          onChange={(e) => handleUpdateFeature(index, "key", e.target.value)}
          placeholder="unique_key"
        />
      ),
    },
    {
      title: "Label (Internal)",
      dataIndex: "label",
      key: "label",
      width: 150,
      render: (text: string, record: TPlanFeature, index: number) => (
        <Input
          value={text}
          onChange={(e) => handleUpdateFeature(index, "label", e.target.value)}
          placeholder="Display Label"
        />
      ),
    },
    {
      title: "Display Value (Text)",
      dataIndex: "text",
      key: "text",
      render: (text: string, record: TPlanFeature, index: number) => (
        <Input
          value={text}
          onChange={(e) => handleUpdateFeature(index, "text", e.target.value)}
          placeholder="e.g. 10GB Storage, Priority Support"
        />
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (text: string, record: TPlanFeature, index: number) => (
        <Input
          value={text}
          onChange={(e) =>
            handleUpdateFeature(index, "category", e.target.value)
          }
          placeholder="General"
        />
      ),
    },
    {
      title: "Highlight",
      dataIndex: "isHighlight",
      key: "isHighlight",
      width: 80,
      align: "center" as const,
      render: (val: boolean, record: TPlanFeature, index: number) => (
        <Switch
          checked={val}
          onChange={(checked) =>
            handleUpdateFeature(index, "isHighlight", checked)
          }
          size="small"
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 60,
      align: "center" as const,
      render: (_: any, record: any, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveFeature(index)}
        />
      ),
    },
  ];

  return (
    <Card
      title="Plan Features"
      extra={
        <Button
          type="dashed"
          onClick={handleAddFeature}
          icon={<PlusOutlined />}
        >
          Add Feature
        </Button>
      }
      className="mt-6 bg-[#1a1a1a] border-[#303030]"
    >
      <Table
        dataSource={features}
        columns={columns}
        rowKey={(record, index) => record.id || index?.toString() || record.key}
        pagination={false}
        size="small"
        className="custom-table"
        onRow={(record, index) => ({
          draggable: true,
          style: { cursor: "move" },
          onDragStart: (e) => {
            setDragIndex(index ?? null);
            e.dataTransfer.effectAllowed = "move";
          },
          onDragOver: (_e) => {
            _e.preventDefault();
            _e.dataTransfer.dropEffect = "move";
          },
          onDrop: () => {
            if (dragIndex !== null && index !== undefined) {
              moveRow(dragIndex, index);
            }
            setDragIndex(null);
          },
        })}
      />
    </Card>
  );
};
