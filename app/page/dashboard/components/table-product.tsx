import { Table } from "antd";
import { FC, ReactElement } from "react";
import type { ITDashboardOwner, ProductSummary } from "@/app/common/dashbaord";

interface props {
  data: ProductSummary[];
}

const TableProductComponent: FC<props> = ({ data }): ReactElement => {
  const ParentColumns = [
    {
      title: "Product",
      dataIndex: "type",
      render: (e: string) => (e === "image" ? "Seedream" : "Seedance"),
    },
  ];

  const ChildColumns = [
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      render: (v: number, record: any) => `$ ${v} ${record.type === "image" ? "USD/piece" : "USD/Token"}`,
    },
    {
      title: "Total Image Used",
      dataIndex: "totalImageUsed",
      render: (v: number, record: any) => `${v} ${record.type === "image" ? "piece" : "Token"}`,
    },
    {
      title: "Total Token Used",
      dataIndex: "totalTokenUsed",
      render: (v: number, record: any) => `${v} ${record.type === "image" ? "piece" : "Token"}`,
    },
  ];

  return (
    <div className="w-full">
      <Table
        bordered
        columns={ParentColumns}
        dataSource={data}
        rowKey="type"
        expandable={{
          expandedRowRender: (record) => (
            <Table bordered rowKey="type" columns={ChildColumns} dataSource={[record]} pagination={false} size="small" />
          ),
        }}
        size="large"
      />
    </div>
  );
};
export default TableProductComponent;
