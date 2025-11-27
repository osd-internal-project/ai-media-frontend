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
  const ownerColumns = [{ title: "Owner", dataIndex: "owner" }];

  const productColumns = [
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
      render: (v: number, record: any) => `$ ${v} ${record.type === "image" ? `USD/piece` : `USD/Token`}`,
    },
    {
      title: "Total Image Used",
      dataIndex: "totalImageUsed",
      render: (v: number, record: any) => `${v} ${record.type === "image" ? `piece` : `Token`}`,
    },
    {
      title: "Total Token Used",
      dataIndex: "totalTokenUsed",
      render: (v: number, record: any) => `${v} ${record.type === "image" ? `piece` : `Token`}`,
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
        size="large"
      />
    </div>
  );
};
export default TableOwnerComponent;
