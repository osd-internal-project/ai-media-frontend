"use client";
import React, { useEffect, useState } from "react";
import { UsersSummaryPage } from "./components/users-summary";
import UserServices from "@/app/services/users.service";
import { axiosUser } from "@/app/lib/axios/axios";
import UserFiltersPage from "./components/user-filters";
import {
  Button,
  Form,
  message,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import type { TUser, TUserForm } from "@/app/common/user.type";
import type { ColumnsType } from "antd/es/table";
import { TGroup } from "@/app/common/groups.type";
import GroupsServices from "@/app/services/groups.service";

const AdminUsersManagementPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const userServices = UserServices(axiosUser);
  const groupsService = GroupsServices(axiosUser);
  const [formmanage] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [getSummary, setSummary] = useState<{
    total: number;
    active: number;
    unabled: number;
    userGroup: number;
  }>({
    total: 0,
    active: 0,
    unabled: 0,
    userGroup: 0,
  });
  const [getdata, setData] = useState<TUser[]>([]);
  const [getGroups, setGroups] = useState<TGroup[]>([]);
  const [open, setOpen] = useState<{ status: boolean; type: string }>({
    status: false,
    type: "create",
  });

  useEffect(() => {
    if (loading) {
      FecthSummaryData();
      FecthGroupsData();
      fecthData();
    }
  }, [loading]);

  const FecthSummaryData = async () => {
    const response = await userServices.summary();
    setSummary(response);
  };

  const FecthGroupsData = async () => {
    try {
      const response = await groupsService.findAll();
      setGroups(response);
    } catch (error) {
      console.log(error);
    }
  };

  const fecthData = async () => {
    try {
      const response = await userServices.findBySearch(
        searchText && searchText.trim(),
      );
      setData(response);
      setOpen({ status: false, type: "create" });
      setLoading(false);
    } catch (err) {
      messageApi.error(`${err}`);
    }
  };

  const onSearch = (value: string) => {
    setSearchText(value);
    setLoading(true);
  };

  const handleManage = (type: string) => {
    if (type === "create") {
      setOpen({ status: true, type: "create" });
      formmanage.resetFields();
    } else if (type === "edit") {
      setOpen({ status: true, type: "edit" });
    } else {
      setOpen({ status: false, type: "close" });
    }
  };

  const onFinish = async (type: string, values: TUserForm) => {
    let response;
    const groups = values.groups || [];
    try {
      if (type === "create") {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...otherValues } = values as any;
        response = await userServices.create({
          ...otherValues,
          status: values.status ? "active" : "unabled",
          groups,
        });
      } else {
        const { userId, ...rest } = values;
        response = await userServices.update(
          formmanage.getFieldValue("userId"),
          {
            ...values,
            status: rest.status ? "active" : "unabled",
            groups,
          },
        );
      }
      if (response) {
        messageApi.success(`${type} success`);
        setLoading(true);
        formmanage.resetFields();
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        messageApi.error(`${error.response.data.message}`);
      } else {
        messageApi.error(`${error.message}`);
      }
    }
  };
  const handleDelete = async (userId: string) => {
    try {
      await userServices.del(userId);
      messageApi.success("Deleted successfully");
    } catch (error) {
      messageApi.error("Delete failed");
    }
    setLoading(true);
  };

  const columns: ColumnsType<TUser> = [
    {
      title: "Username/ID",
      dataIndex: "username",
      key: "username",
      ellipsis: true,
      width: 200,
      render: (text, record) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mr-3 flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {text.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-white font-medium">{text}</div>
            {/* <div className="text-gray-400 text-xs">{record.userId}</div> */}
          </div>
        </div>
      ),
    },
    {
      title: "Display Name",
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Role",
      dataIndex: ["role"],
      key: "role",
      render: (role: string) => {
        if (!role) {
          return "-";
        } else if (role === "SUPER_ADMIN") {
          return (
            <Tag className={`rounded-full px-3  `} color="orange">
              Super Admin
            </Tag>
          );
        } else if (role === "USER") {
          return (
            <Tag className={`rounded-full px-3  `} color="blue">
              User
            </Tag>
          );
        }
      },
    },

    {
      title: "Create time",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Enabled", value: "active" },
        { text: "Disabled", value: "inactive" },
      ],
      render: (status) => (
        <Tag
          color={status === "active" ? "green" : "red"}
          className="rounded-full px-3"
        >
          {status === "active" ? "Enabled" : "Unabled"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "id",
      render: (_, record) => {
        return (
          <Space>
            <Button
              type="link"
              className="text-indigo-400 hover:text-indigo-300"
              onClick={() => {
                handleManage("edit");
                const groups =
                  record.groups?.map((g: any) => g.group.groupId) || [];
                formmanage.setFieldsValue({ ...record, groups });
              }}
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete Role"
              description="Are you sure you want to delete this role?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleDelete(record.userId)}
            >
              <Button className="w-20" danger size="large" type="link">
                Delete
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen">
      <Spin spinning={loading}>
        {contextHolder}
        <UsersSummaryPage getSummary={getSummary} />
        <UserFiltersPage
          onSearch={onSearch}
          onRefresh={() => setLoading(true)}
          handleManage={handleManage}
          formmanage={formmanage}
          open={open}
          onFinish={onFinish}
          groups={getGroups}
          search={searchText}
        />
        <Table
          columns={columns}
          dataSource={getdata}
          rowKey="userId"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          scroll={{ x: "max-content" }}
        />
      </Spin>
    </div>
  );
};

export default AdminUsersManagementPage;
