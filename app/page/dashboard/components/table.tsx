import { Button, DatePicker, Form, FormInstance, Select, Table } from "antd";
import { FC, ReactElement } from "react";
import { SettingOutlined } from "@ant-design/icons";

interface props {
  data: any[];
}

const TableComponent: FC<props> = ({ data }): ReactElement => {
  const columns = [
    { title: "Owner", key: "owner", dataIndex: "owner" },
    { title: "Product", key: "product", dataIndex: "product" },
    { title: "Usage", key: "usage", dataIndex: "usage" },
    {
      title: "Post-tax amount (payment currency)",
      key: "amount",
      dataIndex: "amount",
    },
  ];
  return (
    <div className="w-full">
      <Table
        size="small"
        dataSource={data}
        columns={columns}
        // style={{ backgroundColor: "#000" ,}}
      />
    </div>
  );
};
export default TableComponent;
