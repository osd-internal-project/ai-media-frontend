import {
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  FormInstance,
  Select,
} from "antd";
import { FC, ReactElement } from "react";

interface props {
  searchForm: FormInstance;
  onSearch: (value: any) => void;
  projectOptions: { value: string; label: string }[];
  exportcsv: () => void;
}

const TableFilter: FC<props> = ({
  searchForm,
  onSearch,
  projectOptions,
  exportcsv,
}): ReactElement => {
  return (
    <ConfigProvider theme={{ components: { Form: { itemMarginBottom: 0 } } }}>
      <Form className="flex justify-end" form={searchForm} onFinish={onSearch}>
        <div className=" flex flex-row gap-5 items-center">
          <div className="col col-span-1">
            <Form.Item name={"createdAt"} label={"Billing Cycle"}>
              <DatePicker
                picker="month"
                format="YYYY-MM"
                onChange={() => searchForm.submit()}
              />
            </Form.Item>
          </div>
          <div className="col col-span-1 ">
            <Form.Item name={"projectId"} label={"Project"} className="w-full">
              <Select
                options={projectOptions}
                placeholder={`Project`}
                allowClear
                optionFilterProp="label"
                showSearch
                onChange={() => searchForm.submit()}
                className="w-full min-w-[200px]"
              />
            </Form.Item>
          </div>
          {/* <div>
            <Button
              // size={"small"}
              className="!border-[#6366F1] !text-[#6366F1]"
              onClick={exportcsv}
            >
              Export CSV
            </Button>
          </div> */}
        </div>
      </Form>
    </ConfigProvider>
  );
};
export default TableFilter;
