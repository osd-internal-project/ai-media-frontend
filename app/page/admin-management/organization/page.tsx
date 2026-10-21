"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Input,
  Space,
  Modal,
  Form,
  Switch,
  Select,
  message,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { IOrganization } from "@/app/common/organization.type";
import OrganizationServices from "@/app/services/organization.service";
import { axiosCore, axiosUser } from "@/app/lib/axios/axios";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

const { Option } = Select;

export default function OrganizationPage() {
  const router = useRouter();
  const [data, setData] = useState<IOrganization[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchObject, setSearchObject] = useState<{
    searchText?: string;
    type?: string;
  }>({
    searchText: "",
    type: undefined,
  });
  const [open, setOpen] = useState<{ status: boolean; type: string }>({
    status: false,
    type: "create",
  });
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const organizationService = OrganizationServices(axiosUser);

  useEffect(() => {
    fetchData();
  }, [searchObject]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await organizationService.findAll(searchObject);
      setData(response || []);
    } catch (error) {
      messageApi.error("Failed to fetch organizations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // const handleDelete = (organizationId: string) => {
  //   Modal.confirm({
  //     title: "Are you sure you want to delete this organization?",
  //     content: "This action cannot be undone.",
  //     okText: "Delete",
  //     okType: "danger",
  //     cancelText: "Cancel",
  //     onOk: async () => {
  //       try {
  //         await organizationService.del(organizationId);
  //         messageApi.success("Organization deleted successfully");
  //         fetchData();
  //       } catch (error) {
  //         messageApi.error("Failed to delete organization");
  //         console.error(error);
  //       }
  //     },
  //   });
  // };

  // const filteredData = data.filter(
  //   (item) =>
  //     item.name.toLowerCase().includes(searchText.toLowerCase()) ||
  //     item.organizationId.toLowerCase().includes(searchText.toLowerCase()) ||
  //     item.description?.toLowerCase().includes(searchText.toLowerCase()),
  // );

  const columns: ColumnsType<IOrganization> = [
    {
      title: "Organization Name",
      dataIndex: "name",
      key: "name",
      width: 250,
      ellipsis: true,
      render: (text, record) => (
        <div className="flex items-center">
          <div>
            <div className="text-[var(--legacy-ink)] font-medium">{text}</div>
            <div className="text-[var(--legacy-gray-400)] text-xs">{record.organizationId}</div>
          </div>
        </div>
      ),
    },
    // {
    //   title: "Description",
    //   dataIndex: "description",
    //   key: "description",
    //   ellipsis: true,
    //   render: (text) => text || "-",
    // },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: string) => (
        <Tag
          className="rounded-full px-3"
          color={type === "personal" ? "blue" : "green"}
        >
          {type === "personal" ? "Personal" : "Team"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: boolean) => (
        <Tag className="rounded-full px-3" color={status ? "success" : "error"}>
          {status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    // {
    //   title: "Tokens",
    //   dataIndex: "packageTokenAmount",
    //   key: "packageTokenAmount",
    //   width: 120,
    //   render: (value, record) => (
    //     <div>
    //       <div className="text-white text-sm">
    //         {record.remainTokenAmount?.toLocaleString() || 0} /{" "}
    //         {value?.toLocaleString() || 0}
    //       </div>
    //       <div className="text-gray-400 text-xs">Remaining / Total</div>
    //     </div>
    //   ),
    // },
    // {
    //   title: "Images",
    //   dataIndex: "packageImageAmount",
    //   key: "packageImageAmount",
    //   width: 120,
    //   render: (value, record) => (
    //     <div>
    //       <div className="text-white text-sm">
    //         {record.remainImageAmount?.toLocaleString() || 0} /{" "}
    //         {value?.toLocaleString() || 0}
    //       </div>
    //       <div className="text-gray-400 text-xs">Remaining / Total</div>
    //     </div>
    //   ),
    // },
    {
      title: "Max Users",
      dataIndex: "maxUserAccess",
      key: "maxUserAccess",
      width: 100,
      render: (value) => value || "-",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            // onClick={() => handleManage("edit", record)}
            onClick={() =>
              router.push(
                `/page/admin-management/organization/${record.organizationId}`,
              )
            }
            className="!text-blue-400 hover:!text-blue-300"
          />
          {/* <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.organizationId)}
            className="!text-red-400 hover:!text-red-300"
            danger
          /> */}
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full h-full ">
      {contextHolder}

      {/* Header */}
      <div className="">
        <h1 className="text-2xl font-bold mb-2">
          Organization Management
        </h1>
        <p className="text-[var(--legacy-gray-400)]">Manage all organizations in the system</p>
      </div>

      {/* Filters */}
      <div className=" p-4 rounded-lg mb-4">
        <div className="flex items-center justify-between gap-2">
          <Input
            placeholder="Search organizations..."
            prefix={<SearchOutlined className="" />}
            className="w-96"
         
            value={searchObject.searchText}
            onChange={(e) =>
              setSearchObject({ ...searchObject, searchText: e.target.value })
            }
          />
          <Select
            allowClear
            placeholder="Search organizations..."
            prefix={<SearchOutlined />}
            className="w-96 "
            value={searchObject.type}
            onChange={(value) =>
              setSearchObject({ ...searchObject, type: value })
            }
        
            options={[
              { value: "team", label: "Team" },
              { value: "personal", label: "Personal" },
            ]}
          />
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchData}
              loading={loading}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                router.push(
                  "/page/admin-management/organization/create/package",
                )
              }
            >
              Create
            </Button>
          </Space>
        </div>
      </div>

      {/* Table */}
      <div className=" rounded-lg overflow-hidden">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="organizationId"
          loading={loading}
          scroll={{ x: 1400 }}
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} organizations`,
          }}
          className="custom-table"
        />
      </div>
    </div>
  );
}
