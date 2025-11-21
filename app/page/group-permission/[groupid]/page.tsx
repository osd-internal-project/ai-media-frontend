"use client";
import type { TGroup, TGroupWithUsersAndRoles } from "@/app/common/groups.type";
import GroupsServices from "@/app/services/groups.service";
import { axiosUser } from "@/app/lib/axios/axios";
import {
  Button,
  Card,
  Checkbox,
  Col,
  ConfigProvider,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import { FileOutlined, FolderOutlined, UserOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PlusCircleIcon } from "lucide-react";
import { TUser } from "@/app/common/user.type";
import UserServices from "@/app/services/users.service";
import { ColumnsType } from "antd/es/table";
import { TRoles } from "@/app/common/roles.type";
import RoleServices from "@/app/services/roles.service";

const UpdateGroupPage = () => {
  const { groupid } = useParams();
  const groupsServices = GroupsServices(axiosUser);
  const usersServices = UserServices(axiosUser);
  const rolesServices = RoleServices(axiosUser);
  const [messageApi, contextHolder] = message.useMessage();

  const [formmanage] = Form.useForm();
  const [formuser] = Form.useForm();
  const [formrole] = Form.useForm();
  const [loadGroup, setLoadingGroup] = useState<boolean>(false);
  const [groupDetail, setGroupDetail] = useState<
    TGroupWithUsersAndRoles | undefined
  >(undefined);
  const [userList, setUserList] = useState<TUser[]>([]);
  const [userOptionList, setUserOptionList] = useState<TUser[]>([]);
  const [selectedUserList, setSelectedUserList] = useState<TUser[]>([]);
  const [roles, setRoles] = useState<Record<string, TRoles[]>>();
  const userColumns: ColumnsType<TUser> = [
    {
      title: "Name",
      dataIndex: "fullname",
      render: (value, record) => (
        <div>
          <div className=" font-bold">{record.fullname}</div>
          {/* {record.actionstatus && <Tag>{record.actionstatus}</Tag>}{" "} */}
          <div className=" text-gray-400">{record.phoneNumber || "-"}</div>
        </div>
      ),
    },
    {
      title: "User Name",
      dataIndex: "username",
    },
    {
      title: "description",
      dataIndex: "description",
    },
    {
      title: "action",
      dataIndex: "userId",
      render: (value: string) => (
        <Button danger type="link" onClick={() => onDeleteSelectedUser(value)}>
          Delete
        </Button>
      ),
    },
  ];

  useEffect(() => {
    fecthdata();
  }, []);
  const fecthdata = async () => {
    await fecthdataRoles();
    await fecthdataGroup();
  };
  const fecthdataRoles = async () => {
    const response = await rolesServices.findAll();
    if (response) {
      const data = response.reduce((acc, item) => {
        if (!acc[item.type]) {
          acc[item.type] = [];
        }
        acc[item.type].push(item);
        return acc;
      }, {} as Record<string, TRoles[]>);
      setRoles(data);
    }
  };
  const fecthdataGroup = async () => {
    const response = await groupsServices.findUsersAndRolesByGroup(
      String(groupid)
    );

    if (response) {
      formmanage.setFieldsValue(response);

      if (response?.roles) {
        console.log(response?.roles);
        const roleIds = response?.roles.map((r) => r.role.roleId);
        console.log(roleIds);
        formrole.setFieldValue("roleIds", roleIds);
      }
      setGroupDetail(response);
      const users = await usersServices.findAll();

      if (response?.users) {
        const groupusers = response?.users.map((user) => user.users);

        setSelectedUserList(groupusers);
        if (users) {
          setUserList(users);
          const groupUserIds = new Set(groupusers.map((u) => u.userId));

          const optionUsers = users.filter((u) => !groupUserIds.has(u.userId));
          setUserOptionList(optionUsers);
        }
      }
    }

    setLoadingGroup(false);
  };
  async function reloadPage() {
    setLoadingGroup(true);
    await fecthdataGroup();
  }
  const onFinish = async (value: TGroup) => {
    const userids = selectedUserList.map((u) => u.userId);
    const roleIds = formrole.getFieldValue("roleIds");
    const formValues = { ...value, users: userids, roles: roleIds };
    const updated = await groupsServices.update(String(groupid), formValues);

    if (updated) {
      messageApi.open({
        type: "error",
        content: "Updat Success",
      });
      reloadPage();
    } else { messageApi.open({
        type: "success",
        content: "Update Fail ,Please try again.",
      });
      alert("Update Fail ,Please try again.");
    }
  };
  function onAddSelectedUsers(values: { newUserIds: string[] }): void {
    const newSelectedUsers = userOptionList.filter((u) =>
      values.newUserIds.includes(u.userId)
    );
    setSelectedUserList([...selectedUserList, ...newSelectedUsers]);
    const newOptionUser = userOptionList.filter(
      (u) => !values.newUserIds.includes(u.userId)
    );
    setUserOptionList(newOptionUser);
    formuser.resetFields();
  }
  function onDeleteSelectedUser(userId: string): void {
    const newOptionUsers = selectedUserList.filter((u) => u.userId === userId);
    setUserOptionList([...userOptionList, ...newOptionUsers]);
    const newSelectedUsers = selectedUserList.filter(
      (u) => u.userId !== userId
    );
    setSelectedUserList(newSelectedUsers);

    formuser.resetFields();
  }

  function onSubmitEditGroup(): void {
    formmanage.submit();
  }

  return (
    <Spin spinning={loadGroup}>
      {contextHolder}
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
                  <div>{groupDetail?.roles?.length || 0}</div>
                </div>
                <div className=" ">
                  <Button
                    type="primary"
                    size="large"
                    onClick={onSubmitEditGroup}
                  >
                    Save Change
                  </Button>
                </div>
              </Space>
            </div>
          </Card>
        </div>
        <div className="grid grid-cols-2 w-full gap-3">
          <div>
            <Form<TGroup>
              name={`manage-group`}
              form={formmanage}
              layout="vertical"
              autoComplete="off"
              className="dark-form"
              onFinish={onFinish}
            >
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
            </Form>
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
                <Form form={formuser} onFinish={onAddSelectedUsers}>
                  <div className="flex gap-2">
                    <Form.Item className="flex-1" name={"newUserIds"}>
                      <Select
                        mode="multiple"
                        placeholder="Select users"
                        className="w-full custom-select"
                        optionLabelProp="label"
                        id="selectUsersSelect"
                        options={userOptionList.map((data) => ({
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
                      htmlType="submit"
                      icon={<PlusCircleIcon size={"16px"} />}
                      type="primary"
                    >
                      Add
                    </Button>
                  </div>
                </Form>
                <Table
                  rowKey={"userId"}
                  showHeader={false}
                  columns={userColumns}
                  dataSource={selectedUserList}
                />
              </Card>
            </ConfigProvider>
          </div>
        </div>
        <Card className=" w-full">
          <Form form={formrole} onFinish={(val) => console.log(val)}>
            <Form.Item name="roleIds" initialValue={[]}>
              <Checkbox.Group className="w-full">
                <Row gutter={[16, 16]}>
                  {/* Content */}
                  <Col sm={24} md={8}>
                    <div className="text-[16px]">
                      <FileOutlined /> Content
                    </div>
                    <div>
                      {roles?.content?.map((role) => (
                        <div key={role.roleId}>
                          <Checkbox value={role.roleId}>
                            {role.description}
                          </Checkbox>
                        </div>
                      ))}
                    </div>
                  </Col>

                  {/* User */}
                  <Col sm={24} md={8}>
                    <div className="text-[16px]">
                      <UserOutlined /> User
                    </div>
                    <div>
                      {roles?.user?.map((role) => (
                        <div key={role.roleId}>
                          <Checkbox value={role.roleId}>
                            {role.description}
                          </Checkbox>
                        </div>
                      ))}
                    </div>
                  </Col>

                  {/* Resources */}
                  <Col sm={24} md={8}>
                    <div className="text-[16px]">
                      <FolderOutlined /> Resources
                    </div>
                    <div>
                      {roles?.resources?.map((role) => (
                        <div key={role.roleId}>
                          <Checkbox value={role.roleId}>
                            {role.description}
                          </Checkbox>
                        </div>
                      ))}
                    </div>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Spin>
  );
};

export default UpdateGroupPage;
