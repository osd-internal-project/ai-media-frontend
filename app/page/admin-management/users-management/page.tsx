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
  Pagination,
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
import { aiCaveColors } from "@/app/theme/themeConfig";

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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
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
    setCurrentPage(1);
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

  const renderRoleTag = (role?: string) => {
    if (!role) {
      return "-";
    }

    if (role === "SUPER_ADMIN") {
      return (
        <Tag className="rounded-full px-3" color="orange">
          Super Admin
        </Tag>
      );
    }

    if (role === "USER") {
      return (
        <Tag className="rounded-full px-3" color="blue">
          User
        </Tag>
      );
    }

    return role;
  };

  const openEditUser = (record: TUser) => {
    handleManage("edit");
    const groups = record.groups?.map((g: any) => g.group.groupId) || [];
    formmanage.setFieldsValue({ ...record, groups });
  };

  const paginatedData = getdata.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const columns: ColumnsType<TUser> = [
    {
      title: "Username/ID",
      dataIndex: "username",
      key: "username",
      ellipsis: true,
      width: 200,
      render: (text, record) => (
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${aiCaveColors.primary} 0%, ${aiCaveColors.primary} 50%, ${aiCaveColors.secondary} 100%)`, }}>
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
      render: (role: string) => renderRoleTag(role),
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
          <Space wrap>
            <Button
              type="link"
              className="text-indigo-400 hover:text-indigo-300"
              onClick={() => openEditUser(record)}
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
        <div className="hidden md:block">
          <Table
            columns={columns}
            dataSource={getdata}
            rowKey="userId"
            pagination={{
              current: currentPage,
              pageSize,
              total: getdata.length,
              showSizeChanger: false,
              onChange: (page) => setCurrentPage(page),
            }}
            scroll={{ x: "max-content" }}
            size="small"
          />
        </div>
        <div className="space-y-3 md:hidden">
          {paginatedData.map((user) => (
            <div
              key={user.userId}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${aiCaveColors.primary} 0%, ${aiCaveColors.primary} 50%, ${aiCaveColors.secondary} 100%)`,
                  }}
                >
                  <span className="text-sm font-bold text-white">
                    {user.username.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-medium text-white">
                    {user.username}
                  </div>
                  <div className="truncate text-sm text-gray-400">
                    {user.fullname || "-"}
                  </div>
                </div>
                <Tag
                  color={user.status === "active" ? "green" : "red"}
                  className="rounded-full px-3"
                >
                  {user.status === "active" ? "Enabled" : "Unabled"}
                </Tag>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <div className="text-gray-400">Role</div>
                  <div className="mt-1">{renderRoleTag(user.role)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Created</div>
                  <div className="mt-1 text-white">{user.createdAt || "-"}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-gray-400">Description</div>
                  <div className="mt-1 break-words text-white">
                    {user.description || "-"}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="link" className="px-0 text-indigo-400" onClick={() => openEditUser(user)}>
                  Edit
                </Button>
                <Popconfirm
                  title="Delete Role"
                  description="Are you sure you want to delete this role?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => handleDelete(user.userId)}
                >
                  <Button danger type="link" className="px-0">
                    Delete
                  </Button>
                </Popconfirm>
              </div>
            </div>
          ))}
          {getdata.length > pageSize ? (
            <div className="flex justify-center pt-2">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={getdata.length}
                showSizeChanger={false}
                size="small"
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
          ) : null}
        </div>
      </Spin>
    </div>
  );
};

export default AdminUsersManagementPage;
