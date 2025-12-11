import { Table } from "antd";
import { FC, ReactElement } from "react";
import type { ITDashboardOwner } from "@/app/common/dashbaord";

interface props {
  data: ITDashboardOwner[];
}

const TableOwnerComponent: FC<props> = ({ data }): ReactElement => {
  const ownersTableData = data.map((owner) => ({
    owner: owner.owner,
    key: owner.owner,
    products: owner.products,
  }));
  const ownerColumns: any = [
    { title: "Owner", dataIndex: "owner" },
    {
      title: "Post-tax amount (payment currency)",
      align: "right",
      dataIndex: "owner",
      render(e: string, records: ITDashboardOwner, index: number) {
        const total = records.products.reduce((sum, p) => {
          const used = p.type === "image" ? p.totalImageUsed : p.totalTokenUsed / 1000;
          const cost = used * p.unitPrice;
          return sum + cost;
        }, 0);
        return <div>{`$ ${total.toFixed(2)}`}</div>;
      },
    },
  ];

  const productColumns: any = [
    {
      title: "Product",
      dataIndex: "type",
      render: (e: string) => {
        return <>{e === "image" ? <>{`Seedream`}</> : <>{`Seedance`}</>}</>;
      },
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      render: (v: number, record: any) => `$ ${v} ${record.type === "image" ? `USD/piece` : `USD/K Token`}`,
    },
    {
      title: "Usage",
      dataIndex: "totalUsed",
      render: (_: any, record: any) => {
        const used = record.type === "image" ? record.totalImageUsed : record.totalTokenUsed;
        const unit = record.type === "image" ? "piece" : "Token";
        return `${used.toLocaleString()} ${unit}`;
      },
    },
    {
      title: "",
      align: "right",
      dataIndex: "owner",
      render(e: string, records: any, index: number) {
        const used = records.type === "image" ? records.totalImageUsed : records.totalTokenUsed / 1000;
        const cost = used * records.unitPrice;
        return <div>{`$ ${cost.toFixed(2)}`}</div>;
      },
    },
  ];

  return (
    <div className="w-full">
      <Table
        bordered
        columns={ownerColumns}
        dataSource={ownersTableData}
        expandable={{
          expandedRowRender: (record) => {
            return <Table columns={productColumns} bordered dataSource={record.products} rowKey="key" pagination={false} size="small" />;
          },
        }}
        size="small"
      />
    </div>
  );
};
export default TableOwnerComponent;
