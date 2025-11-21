import { DatePicker, Form, FormInstance } from "antd";
import { FC, ReactElement } from "react";

interface props {
  searchForm: FormInstance;
  onSearch: (value: Date) => void;
}

const SummaryFilterComponent: FC<props> = ({ searchForm, onSearch }): ReactElement => {
  return (
    <Form>
      <Form.Item name={"billingCycle"} label={"Billing Cycle"}>
        <DatePicker format={"YYYY-MM"} onChange={onSearch} />
      </Form.Item>
    </Form>
  );
};
export default SummaryFilterComponent;
