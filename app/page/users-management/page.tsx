"use client";
import React, { useEffect, useState } from "react";
import { UsersSummaryPage } from "./components/users-summary";
import UserServices from "@/app/services/users.service";
import { axiosUser } from "@/app/lib/axios/axios";
import UserFiltersPage from "./components/user-filters";
import { Button, Form, message, Popconfirm, Space, Table, Tag } from "antd";
import type { TUser } from "@/app/common/user.type";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { TGroup } from "@/app/common/groups.type";

const UserManagementPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const userServices = UserServices(axiosUser);
  const [formmanage] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
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
  const [open, setOpen] = useState<{ status: boolean; type: string }>({
    status: false,
    type: "create",
  });

  useEffect(() => {
    FecthSummaryData();
    if (loading) {
      fecthData();
    }
  }, [loading]);

  const FecthSummaryData = async () => {
    const response = await userServices.summary();
    setSummary(response);
  };

  const fecthData = async () => {
    try {
      const response = await userServices.findAll();
      setData(response);
      setOpen({ status: false, type: "create" });
      setLoading(false);
    } catch (err) {
      messageApi.error(`${err}`);
    }
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

  const onFinish = async (type: string, values: TUser) => {
    let response;
    try {
      if (type === "create") {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...otherValues } = values as any;
        response = await userServices.create({
          ...otherValues,
          status: values.status ? "active" : "unabled",
        });
      } else {
        const { userId, ...rest } = values;
        response = await userServices.update(
          formmanage.getFieldValue("userId"),
          {
            ...values,
            status: rest.status ? "active" : "unabled",
          }
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
      render: (text, record) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mr-3 flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {text.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-white font-medium">{text}</div>
            <div className="text-gray-400 text-xs">{record.userId}</div>
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
      title: "User group",
      dataIndex: ["groups"],
      key: "groups",
      render: (group: { group: TGroup }[]) => (
        <div>
          {group?.map((g) => (
            <Tag
              key={g.group.groupId}
              className="bg-gray-700 border-gray-600 text-gray-300 rounded-full px-3"
            >
              {g.group.name}
            </Tag>
          )) || "-"}
        </div>
      ),
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
      title: "Create time",
      dataIndex: "createTime",
      key: "createTime",
      sorter: true,
    },
    {
      title: "Max Token",
      dataIndex: "maxToken",
      key: "maxToken",
      sorter: true,
      render: (value) => value.toLocaleString(),
    },
    {
      title: "Max Image",
      dataIndex: "maxImages",
      key: "maxImages",
      sorter: true,
      render: (value) => (value > 0 ? value.toLocaleString() : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        return (
          <Space>
            <Button
              type="link"
              className="text-indigo-400 hover:text-indigo-300"
              onClick={() => {
                handleManage("edit");
                formmanage.setFieldsValue(record);
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
    <div>
      {contextHolder}
      <UsersSummaryPage getSummary={getSummary} />
      <UserFiltersPage
        onSearch={(value) => console.log("Search:", value)}
        onRefresh={() => setLoading(true)}
        handleManage={handleManage}
        formmanage={formmanage}
        open={open}
        onFinish={onFinish}
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
    </div>
  );
};

export default UserManagementPage;
