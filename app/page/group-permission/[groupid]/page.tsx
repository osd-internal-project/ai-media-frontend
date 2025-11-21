"use client";
import type { TGroup } from "@/app/common/groups.type";
import GroupsServices from "@/app/services/groups.service";
import { axiosUser } from "@/app/lib/axios/axios";
import {
  Button,
  Card,
  ConfigProvider,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PlusCircleIcon } from "lucide-react";
import { TUser } from "@/app/common/user.type";
import UserServices from "@/app/services/users.service";
import { ColumnsType } from "antd/es/table";
const userColumns: ColumnsType<TUser & { actionstatus?: string }> = [
  {
    title: "Name",
    dataIndex: "fullname",
    render: (value, record) => (
      <Space>
        {record.fullname}
        {record.actionstatus && <Tag>{record.actionstatus}</Tag>}
      </Space>
    ),
  },
];
const UpdateGroupPage = () => {
  const { groupid } = useParams();
  const groupsServices = GroupsServices(axiosUser);
  const usersServices = UserServices(axiosUser);
  const [joadingGroup, setLoadingGroup] = useState<boolean>(false);
  const [groupDetail, setGroupDetail] = useState<TGroup | undefined>(undefined);
  const [userList, setUserList] = useState<TUser[]>([]);
  const [formmanage] = Form.useForm();

  useEffect(() => {
    fecthdata();
  }, []);
  const fecthdata = async () => {
    fecthdataGroup();
    fecthdataUser();
  };
  const fecthdataGroup = async () => {
    const response = await groupsServices.findById(String(groupid));

    if (response) {
      formmanage.setFieldsValue(response);
      setGroupDetail(response);
    }
    setLoadingGroup(false);
  };
  const fecthdataUser = async () => {
    const response = await usersServices.findAll();
    if (response) {
      setUserList(response);
    }
    setLoadingGroup(false);
  };
  const onFinish = async (value: TGroup) => {};
  return (
    <Spin spinning={joadingGroup}>
      <Form<TGroup>
        name={`manage-group`}
        form={formmanage}
        layout="vertical"
        autoComplete="off"
        className="dark-form"
        onFinish={onFinish}
      >
        <div className="  space-y-3">
          <div>
            <Card
              className="col col-span-1 
    !border
    ![border-image-source:linear-gradient(180deg,#87DDDE_0%,#6366F1_100%)]
    ![border-image-slice:1]
    ![box-shadow:0px_4px_4px_0px_hsla(239,59%,95%,0.24)]"
            >
              <div className=" flex justify-between">
                <div>
                  <div className=" text-[14px] inline">{groupDetail?.name}</div>{" "}
                  <div className=" text-[18px] font-bold inline">
                    {groupDetail?.displayName}
                  </div>
                  <div className=" text-[12px] text-gray-400">
                    {groupDetail?.description}
                  </div>
                </div>
                <Space>
                  <div className=" ">
                    <div className=" text-gray-400">Total Users</div>
                    <div>{groupDetail?.users?.length || 0}</div>
                  </div>
                  <div className=" ">
                    <div className="  text-gray-400">Permissions</div>
                    <div>{groupDetail?.roles?.length|| 0}</div>
                  </div>
                  <div className=" ">
                    <Button
                      type="primary"
                      size="large"
                    >
                      Add Group
                    </Button>
                  </div>
                </Space>
              </div>
            </Card>
          </div>
          <div className="grid grid-cols-2 w-full gap-3">
            <div>
              <Card className="col col-span-1 !bg-transparent !border-gray-800">
                <div className="text-xl mb-2">{`Edit group details`}</div>
                <Form.Item
                  label={<span className="text-gray-300">User group name</span>}
                  name={"name"}
                  rules={[
                    {
                      required: true,
                      message: "Please input user group name!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Text"
                    className="!bg-[#2a2a2a] !border-[#3a3a3a] !text-white placeholder:!text-gray-500 hover:!border-[#4a4a4a] focus:!border-[#6366F1]"
                  />
                </Form.Item>
                <div className="text-xs text-gray-500 -mt-4 mb-4 flex items-center gap-1">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-700 text-gray-400 text-[10px]">
                    i
                  </span>
                  {`Support letters, numbers, and the following special characters: ".", "_", "-", up to 64 characters`}
                </div>

                <Form.Item
                  label={<span className="text-gray-300">Display name</span>}
                  name={"displayName"}
                >
                  <Input
                    placeholder="Text"
                    className="!bg-[#2a2a2a] !border-[#3a3a3a] !text-white placeholder:!text-gray-500 hover:!border-[#4a4a4a] focus:!border-[#6366F1]"
                  />
                </Form.Item>
                <div className="text-xs text-gray-500 -mt-4 mb-4 flex items-center gap-1">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-700 text-gray-400 text-[10px]">
                    i
                  </span>
                  up to 64 characters
                </div>

                <Form.Item
                  label={<span className="text-gray-300">Description</span>}
                  name={"description"}
                >
                  <Input.TextArea
                    placeholder="up to 128 characters"
                    rows={4}
                    className="!bg-[#2a2a2a] !border-[#3a3a3a] !text-white placeholder:!text-gray-500 hover:!border-[#4a4a4a] focus:!border-[#6366F1]"
                  />
                </Form.Item>
              </Card>
              <Card className="col col-span-1 "></Card>
            </div>

            <div>
              <ConfigProvider
                theme={{ components: { Form: { itemMarginBottom: 0 } } }}
              >
                <Card className="col col-span-1 !bg-transparent !border-gray-800">
                  <div className="text-xl mb-2">{`Add User`}</div>
                  <div className="text-gray-400">
                    Total {groupDetail?.users?.length || 0} users
                  </div>
                  <div className="flex gap-2">
                    <Form.Item name={"users"} className="flex-1">
                      <Select
                        mode="multiple"
                        placeholder="Select users"
                        className="w-full custom-select"
                        optionLabelProp="label"
                        options={userList.map((data) => ({
                          value: data.userId,
                          label: (
                            <div className="flex items-center gap-2">
                              <span>{data.fullname}</span>
                            </div>
                          ),
                        }))}
                      />
                    </Form.Item>
                    <Button
                      icon={<PlusCircleIcon size={"16px"} />}
                      type="primary"
                    >
                      Add
                    </Button>
                  </div>
                  <Table columns={userColumns} />
                </Card>
              </ConfigProvider>
            </div>
          </div>
        </div>{" "}
      </Form>
    </Spin>
  );
};

export default UpdateGroupPage;
