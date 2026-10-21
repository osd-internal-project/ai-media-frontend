import React, { type FC, type ReactElement } from "react";
import {
  Table,
  Button,
  Tag,
  Input,
  Select,
  Space,
  Modal,
  Form,
  Switch,
  type FormInstance,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SettingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { TUserForm } from "@/app/common/user.type";

import type { TGroup } from "@/app/common/groups.type";

const { Option } = Select;

export interface props {
  onSearch: (value: any) => void;
  onRefresh: () => void;
  handleManage: (type: string) => void;
  formmanage: FormInstance;
  open: { status: boolean; type: string };
  onFinish: (type: string, values: TUserForm) => void;
  groups: TGroup[];
  search: string | undefined;
}

const UserFiltersPage: FC<props> = ({
  onSearch,
  onRefresh,
  handleManage,
  formmanage,
  open,
  onFinish,
  groups,
  search,
}): ReactElement => {
  return (
    <div className="mb-4 rounded-lg p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input
          placeholder="Search"
          prefix={<SearchOutlined className="text-[var(--legacy-gray-500)]" />}
          className="w-full text-[var(--legacy-ink)] lg:max-w-sm"
          style={{
            color: "var(--legacy-ink)",
          }}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            icon={<ReloadOutlined />}
            className="!border-[var(--legacy-line-gray-700)] !hover:bg-[var(--legacy-hover-gray-700)]"
            onClick={onRefresh}
          />
          <Button
            icon={<DownloadOutlined />}
            className="!border-[var(--legacy-line-gray-700)] !hover:bg-gray-7000"
          />
          <Button
            icon={<SettingOutlined />}
            className="!border-[var(--legacy-line-gray-700)]  !hover:bg-[var(--legacy-hover-gray-700)]"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleManage("create")}
            className="w-full sm:w-auto"
          >
            Create New User
          </Button>
        </div>
      </div>
      {open.status === true ? (
        <Modal
          title={open.type === "create" ? "Create New User" : "Edit User"}
          open={open.status}
          onCancel={() => handleManage("close")}
          footer={false}
          width={1000}
          styles={{
            body: {
              maxHeight: "calc(100vh - 180px)",
              overflowY: "auto",
            },
          }}
          okText={open.type === "create" ? "Create" : "Update"}
        >
          <Form
            form={formmanage}
            layout="vertical"
            onFinish={(e) => {
              onFinish(open.type, e);
            }}
            autoComplete="off"
          >
            <Form.Item label="userId" name="userId" hidden>
              <Input placeholder="Enter username" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: "Please input username!" }]}
              >
                <Input
                  placeholder="Enter username"
                  readOnly={open.type === "edit"}
                />
              </Form.Item>

              <Form.Item
                label="Full Name"
                name="fullname"
                rules={[{ required: true, message: "Please input full name!" }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: "Please input full name!" }]}
              >
                <Input
                  type="email"
                  placeholder="Enter email"
                  readOnly={open.type === "edit"}
                />
              </Form.Item>

              <Form.Item
                label="Phone"
                name="phoneNumber"
                rules={[
                  { required: true, message: "Please input phone number!" },
                ]}
              >
                <Input placeholder="Enter Phone" />
              </Form.Item>
              <div className=" col-span-2 font-bold">
                {open.type === "create" ? "Create Password" : "Change Password"}
              </div>
              <>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    {
                      required: open.type === "create",
                      message: "Please input password!",
                    },
                  ]}
                >
                  <Input.Password placeholder="Enter Password" />
                </Form.Item>
                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  dependencies={["password"]}
                  rules={[
                    ({ getFieldValue }) => ({
                      required:
                        open.type === "create" || !!getFieldValue("password"),
                      message: "Please input confirm password!",
                    }),
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            "The two passwords that you entered do not match!",
                          ),
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Enter Confirm Password" />
                </Form.Item>
              </>
            </div>

            <Form.Item label="Description" name="description">
              <Input.TextArea rows={3} placeholder="Enter description" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Tier"
                name="tier"
                rules={[
                  { required: true, message: "Please select user Tier!" },
                ]}
              >
                <Select
                  placeholder="Select User Tier"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                >
                  <Option value="normal">Normal</Option>
                  <Option value="gold">Gold</Option>
                  <Option value="platinum">Platinum</Option>
                </Select>
              </Form.Item>
              <Form.Item label="System Role" name="role">
                <Select
                  // mode="multiple"
                  placeholder="Select User Group"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                >
                  <Option value="SUPER_ADMIN">Super Admin</Option>
                  <Option value="USER">User</Option>
                </Select>
              </Form.Item>
              {/* <Form.Item label="Group" name="groups">
                <Select
                  mode="multiple"
                  placeholder="Select User Group"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                >
                  {groups?.map((g) => (
                    <Option key={g.id} value={g.groupId}>
                      {g.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item> */}

              {/* <Form.Item label="API Keys" name="apiKeys">
                <Input placeholder="Enter API Keys" />
              </Form.Item>

              <Form.Item
                label="Max Token"
                name="maxToken"
                rules={[{ required: true, message: "Please input max token!" }]}
              >
                <InputNumber className="!w-full" min={0} />
              </Form.Item>

              <Form.Item
                label="Max Images"
                name="maxImages"
                rules={[
                  { required: true, message: "Please input max images!" },
                ]}
              >
                <InputNumber className="!w-full" min={0} />
              </Form.Item> */}

              <Form.Item label="Status" name="status" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </div>
            <div className="flex justify-end mt-4">
              <Button type="primary" htmlType="submit">
                {open.type === "create" ? "Create" : "Update"}
              </Button>
            </div>
          </Form>
        </Modal>
      ) : null}
    </div>
  );
};

export default UserFiltersPage;
