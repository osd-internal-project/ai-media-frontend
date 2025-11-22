import { Button, DatePicker, Form, FormInstance, Select, Table } from "antd";
import { FC, ReactElement } from "react";
import { SettingOutlined } from "@ant-design/icons";

interface props {
  data: any[];
}

const TableComponent: FC<props> = ({ data }): ReactElement => {
  const columns = [
    { title: "Owner", key: "owner", dataIndex: "owner", width: "200px" },
    { title: "Product", key: "product", dataIndex: "product", width: "200px" },
    { title: "Usage", key: "usage", dataIndex: "usage", width: "200px" },
    {
      title: "Post-tax amount (payment currency)",
      key: "amount",
      dataIndex: "amount",
      width: "200px",
    },
  ];
  return (
    <div className="w-full">
      <Table
        size="small"
        dataSource={data}
        columns={columns}
        rowClassName="bg-black"
        // style={{ backgroundColor: "#000" ,}}
      />
    </div>
  );
};
export default TableComponent;
