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

  const ChildColumns: any = [
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      render: (v: number, record: any) =>
        `$ ${v} ${record.type === "image" ? "USD/piece" : "USD/K Token"}`,
    },
    {
      title: "Usage",
      dataIndex: "totalUsed",
      render: (_: any, record: any) => {
        const used =
          record.type === "image"
            ? record.totalImageUsed
            : record.totalTokenUsed;
        const unit = record.type === "image" ? "piece" : "Token";
        return `${used.toLocaleString()} ${unit}`;
      },
    },
    {
      title: "Post-tax amount (payment currency)",
      align: "right",
      dataIndex: "id",
      render(e: string, records: any, index: number) {
        const used =
          records.type === "image"
            ? records.totalImageUsed
            : records.totalTokenUsed / 1000;
        const cost = used * records.unitPrice;
        return <div>{`$ ${cost.toFixed(2)}`}</div>;
      },
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
            <Table
              bordered
              rowKey="type"
              columns={ChildColumns}
              dataSource={[record]}
              pagination={false}
              size="small"
            />
          ),
        }}
        size="large"
      />
    </div>
  );
};
export default TableProductComponent;
