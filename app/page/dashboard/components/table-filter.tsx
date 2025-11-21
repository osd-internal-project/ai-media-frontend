import { Button, DatePicker, Form, FormInstance, Select } from "antd";
import { FC, ReactElement } from "react";
import { SettingOutlined } from "@ant-design/icons";

interface props {
  agentSearchForm: FormInstance;
  onSearchAgent: (value: any) => void;
}

const TableFilterComponent: FC<props> = ({
  agentSearchForm,
  onSearchAgent,
}): ReactElement => {
  function onClickFilterSubmit(): void {
    agentSearchForm.submit();
  }

  return (
    <div className=" flex justify-between">
      <Form layout="inline" form={agentSearchForm} onFinish={onSearchAgent}>
        <Form.Item name={"owner"}>
          <Select placeholder="Owner" style={{ width: "150px" }} />
        </Form.Item>
        <Form.Item name={"product"}>
          <Select placeholder="Product" style={{ width: "150px" }} />
        </Form.Item>
        <Form.Item name={"region"}>
          <Select placeholder="Region" style={{ width: "150px" }} />
        </Form.Item>
        <Form.Item name={"billingUnit"}>
          <Select placeholder="Billing Unit" style={{ width: "150px" }} />
        </Form.Item>
      </Form>
      <div className=" flex space-x-2">
        <Button>
          <SettingOutlined />
        </Button>{" "}
        <Button
          type="primary"
          ghost
          className=" ml-2"
          onClick={onClickFilterSubmit}
        >
          Export
        </Button>
      </div>
    </div>
  );
};
export default TableFilterComponent;
