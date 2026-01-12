import { DatePicker, Form, FormInstance, Select } from "antd";
import { FC, ReactElement } from "react";

interface props {
  searchForm: FormInstance;
  onSearch: (value: any) => void;
  projectOptions: { value: string; label: string }[];
}

const SummaryFilterComponent: FC<props> = ({
  searchForm,
  onSearch,
  projectOptions,
}): ReactElement => {
  return (
    <Form
      className="flex justify-start gap-4"
      form={searchForm}
      onFinish={onSearch}
    >
      <div className="grid grid-cols-4 gap-5">
        <div className="col col-span-1">
          <Form.Item name={"createdAt"} label={"Billing Cycle"}>
            <DatePicker
              picker="month"
              format="YYYY-MM"
              onChange={() => searchForm.submit()}
            />
          </Form.Item>
        </div>
        <div className="col col-span-1">
          <Form.Item name={"projectId"} label={"Project"} className="w-full">
            <Select
              options={projectOptions}
              placeholder={`Project`}
              allowClear
              optionFilterProp="label"
              showSearch
              onChange={() => searchForm.submit()}
              className="w-full"
            />
          </Form.Item>
        </div>
      </div>
    </Form>
  );
};
export default SummaryFilterComponent;
