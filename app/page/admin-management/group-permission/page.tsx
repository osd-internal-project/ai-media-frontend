"use client";
import React, { useEffect, useState } from "react";
import AdminManageGroups from "./components/manage-groups";
import { axiosUser } from "@/app/lib/axios/axios";
import GroupsServices from "@/app/services/groups.service";
import { Button, Form, message, Popconfirm, Space, Table, Tag } from "antd";
import type { TGroup } from "@/app/common/groups.type";
import UserFiltersPage from "../../group-permission/components/user-filters";
import { ColumnsType } from "antd/es/table";
import UserServices from "@/app/services/users.service";
import { TUser } from "@/app/common/user.type";

const AdminGroupPermissionPage = () => {
  const groupsServices = GroupsServices(axiosUser);
  const userServices = UserServices(axiosUser);
  const [formmanage] = Form.useForm();
  const [open, setOpen] = useState<boolean>(false);
  const [loadingGroup, setLoadingGroup] = useState<boolean>(true);
  const [dataGroups, setDataGroups] = useState<TGroup[]>([]);

  const [formuser] = Form.useForm();
  const [users, setUsers] = useState<TUser[]>([]);

  const [openUser, setOpenUser] = useState<{ status: boolean; type: string }>({
    status: false,
    type: "create",
  });

  useEffect(() => {
    if (loadingGroup) {
      fecthDataUser();
      fecthdataGroup();
    }
  }, [loadingGroup]);

  //GROUP
  const fecthdataGroup = async () => {
    const response = await groupsServices.findAll();
    setDataGroups(response);
    setLoadingGroup(false);
  };
  const onFinish = async (values: TGroup) => {
    const response = await groupsServices.create(values);
    if (response) {
      formmanage.resetFields();
      setLoadingGroup(true);
      setOpen(false);
    }
  };

  //USER

  const userColumns: ColumnsType<TUser> = [
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
    // Commented out Max Token and Max Images columns to match user management
    // {
    //   title: "Max Token",
    //   dataIndex: "maxToken",
    //   key: "maxToken",
    //   sorter: true,
    //   render: (value) => value.toLocaleString(),
    // },
    // {
    //   title: "Max Image",
    //   dataIndex: "maxImages",
    //   key: "maxImages",
    //   sorter: true,
    //   render: (value) => (value > 0 ? value.toLocaleString() : "-"),
    // },
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
              onConfirm={() => handleDeleteUser(record.userId)}
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
  const fecthDataUser = async () => {
    try {
      const response = await userServices.findAll();
      setUsers(response);
      setOpenUser({ status: false, type: "create" });
    } catch (err) {
      message.error(`${err}`);
    }
  };
  const handleManage = (type: string) => {
    if (type === "create") {
      setOpenUser({ status: true, type: "create" });
    } else if (type === "edit") {
      setOpenUser({ status: true, type: "edit" });
    } else {
      setOpenUser({ status: false, type: "close" });
    }
  };
  const onFinishUser = async (type: string, values: TUser) => {
    let response;
    if (type === "create") {
      response = await userServices.create({
        ...values,
        status: values.status ? "active" : "unabled",
      });
    } else {
      const { userId, ...rest } = values;
      response = await userServices.update(formuser.getFieldValue("userId"), {
        ...values,
        status: rest.status ? "active" : "unabled",
      });
    }
    if (response) {
      message.success(`${type} success`);
      setLoadingGroup(true);
      formuser.resetFields();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await userServices.del(userId);
      message.success("Deleted successfully");
    } catch (error) {
      message.error("Delete failed");
    }
    setLoadingGroup(true);
  };
  return (
    <div>
      <div>{`Group List`}</div>
      <div>{`A group provided access to predefined menus and features so that depending on assigned role an administrator can have access to what he need`}</div>
      <AdminManageGroups
        setOpen={setOpen}
        open={open}
        formmanage={formmanage}
        onFinish={onFinish}
        dataGroups={dataGroups}
      />

      {/* <div>
        <div>
          <UserFiltersPage
            onSearch={(value) => console.log("Search:", value)}
            onRefresh={() => setLoadingGroup(true)}
            handleManage={handleManage}
            formmanage={formuser}
            open={openUser}
            onFinish={onFinishUser}
          />
          <Table
            columns={userColumns}
            dataSource={users}
            rowKey="userId"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
            }}
            scroll={{ x: "max-content" }}
          />
        </div>
      </div> */}
    </div>
  );
};

export default AdminGroupPermissionPage;
