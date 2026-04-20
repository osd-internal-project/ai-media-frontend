"use client";
import React from "react";
import {
  Table,
  Button,
  Input,
  Select,
  InputNumber,
  Switch,
  Space,
  Card,
  Typography,
} from "antd";
import { PlusOutlined, DeleteOutlined, DragOutlined } from "@ant-design/icons";
import { TPlanPrice } from "@/app/common/plan.type";

const { Text } = Typography;
const { Option } = Select;

interface PlanPricesEditorProps {
  prices: TPlanPrice[];
  onChange: (prices: TPlanPrice[]) => void;
}

export const PlanPricesEditor: React.FC<PlanPricesEditorProps> = ({
  prices,
  onChange,
}) => {
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);

  const handleAddPrice = () => {
    const newPrice: TPlanPrice = {
      interval: "MONTH",
      price: 0,
      duration: 30,
      creditAllowance: 0,
      imageAllowance: 0,
      currency: "THB",
      isDefault: false,
      orderIndex: prices.length,
      periodCount: 0,
      // periodUnit: "month",

      //   period: prices.length === 0 ? "monthly" : "custom_" + Date.now(),
    };
    onChange([...prices, newPrice]);
  };

  const handleUpdatePrice = (
    index: number,
    field: keyof TPlanPrice,
    value: any,
  ) => {
    const newPrices = [...prices];
    newPrices[index] = { ...newPrices[index], [field]: value };

    // If setting a price as default, unset others
    if (field === "isDefault" && value === true) {
      newPrices.forEach((p, i) => {
        if (i !== index) p.isDefault = false;
      });
    }

    onChange(newPrices);
  };

  const handleRemovePrice = (index: number) => {
    const newPrices = prices.filter((_, i) => i !== index);
    onChange(newPrices);
  };

  const moveRow = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newPrices = [...prices];
    const item = newPrices.splice(fromIndex, 1)[0];
    newPrices.splice(toIndex, 0, item);
    // Re-index if needed, or just let the backend handle it via array order
    onChange(newPrices);
  };

  const columns = [
    {
      title: "",
      key: "sort",
      width: 40,
      render: () => <DragOutlined style={{ cursor: "grab", color: "#666" }} />,
    },
    // {
    //   title: "Period Key",
    //   dataIndex: "period",
    //   key: "period",
    //   width: 140,
    //   render: (text: string, record: TPlanPrice, index: number) => (
    //     <Input
    //       value={text}
    //       onChange={(e) => handleUpdatePrice(index, "period", e.target.value)}
    //       placeholder="e.g. monthly, annually"
    //     />
    //   ),
    // },
    {
      title: "Interval",
      dataIndex: "interval",
      key: "interval",
      width: 120,
      render: (text: string, record: TPlanPrice, index: number) => (
        <Select
          value={text}
          onChange={(val) =>
            handleUpdatePrice(index, "interval", val)
          }
          options={[
            { value: "MONTH", label: "MONTH" },
            { value: "YEAR", label: "YEAR" },
            { value: "DAY", label: "DAY" },
          ]}
          className="w-full"
        />
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (val: number, record: TPlanPrice, index: number) => (
        <InputNumber
          value={val}
          onChange={(val) => handleUpdatePrice(index, "price", val)}
          className="w-full"
          min={0}
          precision={2}
        />
      ),
    },
    // {
    //   title: "Period",
    //   dataIndex: "periodUnit",
    //   key: "periodUnit",
    //   width: 120,
    //   render: (val: string, record: TPlanPrice, index: number) => (
    //     <Select
    //       value={val}
    //       onChange={(val) => handleUpdatePrice(index, "periodUnit", val)}
    //       className="w-full"
    //     >
    //       <Option value="day">Day</Option>
    //       <Option value="month">Month</Option>
    //       <Option value="year">Year</Option>
    //     </Select>
    //   ),
    // },
    {
      title: "Total Period",
      dataIndex: "periodCount",
      key: "periodCount",
      width: 110,
      render: (val: number, record: TPlanPrice, index: number) => (
        <InputNumber
          value={val}
          onChange={(val) => handleUpdatePrice(index, "periodCount", val)}
          className="w-full"
          min={0}
        />
      ),
    },
    // {
    //   title: "Credit Allowance",
    //   dataIndex: "creditAllowance",
    //   key: "creditAllowance",
    //   width: 130,
    //   render: (val: number, record: TPlanPrice, index: number) => (
    //     <InputNumber
    //       value={val}
    //       onChange={(val) => handleUpdatePrice(index, "creditAllowance", val)}
    //       className="w-full"
    //       min={0}
    //     />
    //   ),
    // },
    {
      title: "Default",
      dataIndex: "isDefault",
      key: "isDefault",
      width: 80,
      align: "center" as const,
      render: (val: boolean, record: TPlanPrice, index: number) => (
        <Switch
          checked={val}
          onChange={(checked) => handleUpdatePrice(index, "isDefault", checked)}
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
          onClick={() => handleRemovePrice(index)}
        />
      ),
    },
  ];

  return (
    <Card
      title="Pricing & Quotas"
      extra={
        <Button type="dashed" onClick={handleAddPrice} icon={<PlusOutlined />}>
          Add Pricing Option
        </Button>
      }
      className="mt-6 bg-[#1a1a1a] border-[#303030]"
    >
      <Table
        dataSource={prices}
        columns={columns}
        rowKey={(record, index) => record.id || index?.toString() || ""}
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
