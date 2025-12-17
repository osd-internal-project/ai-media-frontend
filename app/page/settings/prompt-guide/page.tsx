"use client";
import { TPromptType } from "@/app/common/prompt-guide.type";
import { axiosCore } from "@/app/lib/axios/axios";
import PromptGuideServices from "@/app/services/prompt-guide.service";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import React, { useEffect, useState, type FC, type ReactElement } from "react";

import {
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  FileImageOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";

const PromptGuidePage: FC = (): ReactElement => {
  const [formcreate] = Form.useForm();
  const promptguideServices = PromptGuideServices(axiosCore);
  const [loading, setLoading] = useState<boolean>(true);
  const [getdata, setData] = useState<TPromptType[]>([]);
  const [open, setOpen] = useState<{ status: string; type: boolean }>({
    status: "create",
    type: false,
  });
  useEffect(() => {
    if (loading) {
      fecthData();
    }
  }, [loading]);

  const fecthData = async () => {
    const response = await promptguideServices.findAll();
    setData(response);
    setLoading(false);
  };

  const columns: ColumnsType<TPromptType> = [
    {
      key: "id",
      title: "ID",
      dataIndex: "id",
      width: 80,
      align: "center",
      sorter: (a, b) => (a.id || 0) - (b.id || 0),
      render: (id: number) => <span>#{id}</span>,
    },
    {
      key: "title",
      title: "Title",
      dataIndex: "title",
      width: 200,
      ellipsis: true,
      sorter: (a, b) => (a.title || "").localeCompare(b.title || ""),
      render: (title: string) => (
        <Tooltip title={title}>
          <span>{title || "-"}</span>
        </Tooltip>
      ),
    },
    {
      key: "textPrompt",
      title: "Text Prompt",
      dataIndex: "textPrompt",
      width: 300,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip title={text} placement="topLeft">
          <span>{text || "-"}</span>
        </Tooltip>
      ),
    },
    {
      key: "type",
      title: "Type",
      dataIndex: "type",
      width: 120,
      align: "center",
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          image: "blue",
          vdo: "purple",
          video: "purple",
          text: "green",
        };
        return (
          <Tag color={colorMap[type] || "default"}>
            {type?.toUpperCase() || "-"}
          </Tag>
        );
      },
    },
    {
      key: "typeName",
      title: "Type Name",
      dataIndex: "typeName",
      width: 150,
      ellipsis: true,
      render: (typeName: string) => <span>{typeName || "-"}</span>,
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      width: 100,
      align: "center",
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: boolean, record: TPromptType) => (
        <Switch
          checked={status}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      key: "createdAt",
      title: "Created At",
      dataIndex: "createdAt",
      width: 180,
      sorter: (a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateA - dateB;
      },
      render: (date: string | Date) => {
        if (!date) return "-";
        return (
          <Tooltip title={dayjs(date).format("DD/MM/YYYY HH:mm:ss")}>
            <span>{dayjs(date).format("DD/MM/YYYY")}</span>
          </Tooltip>
        );
      },
    },
    {
      key: "updatedAt",
      title: "Updated At",
      dataIndex: "updatedAt",
      sorter: (a, b) => {
        const dateA = new Date(a.updatedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || 0).getTime();
        return dateA - dateB;
      },
      render: (date: string | Date) => {
        if (!date) return "-";
        return (
          <Tooltip title={dayjs(date).format("DD/MM/YYYY HH:mm:ss")}>
            <span>{dayjs(date).format("DD/MM/YYYY")}</span>
          </Tooltip>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      fixed: "right",
      width: 150,
      align: "center",
      render: (_, record: TPromptType) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                handleModal("edit"), formcreate.setFieldsValue(record);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Prompt Guide"
            description="Are you sure you want to delete this prompt guide?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(record.id as number)}
          >
            <Button className="w-20" danger size="large">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleModal = (status: string) => {
    if (status === "create") {
      setOpen({ status: "create", type: true });
    } else if (status === "edit") {
      setOpen({ status: "edit", type: true });
    } else {
      setOpen({ status: "close", type: false });
    }
  };

  const onFinish = async (values: TPromptType, status: string) => {
    let response;
    if (status === "create") {
      response = await promptguideServices.create(values);
    } else if (status === "edit") {
      const { id, ...value } = values;
      response = await promptguideServices.update(id as number, {
        ...value,
        typeName:
          values.type === "scene"
            ? "Scene & Objects"
            : values.type === "art"
            ? "Art Direction"
            : "Branding & Visuals",
      });
    }
    if (response) {
      message.success(`${status} success`);
      formcreate.resetFields();
      setLoading(true);
      setOpen({ status: "create", type: false });
    }
  };
  const handleDelete = async (id: number) => {
    try {
      await promptguideServices.del(id);
      message.success("Deleted successfully");
    } catch (error) {
      message.error("Delete failed");
    }
    setLoading(true);
  };

  return (
    <div className="min-h-screen  relative overflow-hidden ">
      <div className="w-full !text-white flex justify-end my-2">
        <Button
          onClick={() => {
            handleModal("create");
          }}
        >{`Create`}</Button>
      </div>
      <div>
        <Table
          columns={columns}
          dataSource={getdata}
          rowKey={"id"}
          scroll={{ x: "max-content" }}
        />
      </div>
      {open.type ? (
        <>
          <Modal
            title={`${open.status} `}
            open={open.type}
            footer={false}
            onCancel={() => handleModal("close")}
          >
            <Form<TPromptType>
              name="manage-prompt-guide"
              form={formcreate}
              layout="vertical"
              autoComplete="off"
              onFinish={(e) => onFinish(e, open.status)}
            >
              {/* ใช้เฉพาะตอนแก้ไข */}
              {open.status === "edit" && (
                <Form.Item label="ID" name="id" hidden>
                  <Input />
                </Form.Item>
              )}

              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: "Please input title" }]}
              >
                <Input placeholder="Input title" />
              </Form.Item>

              <Form.Item
                label="Text Prompt"
                name="textPrompt"
                rules={[
                  { required: true, message: "Please input prompt text" },
                ]}
              >
                <Input.TextArea rows={4} placeholder="Write your prompt" />
              </Form.Item>

              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true, message: "Please select type" }]}
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Please Select"
                  options={[
                    { value: "scene", label: "Scene & Objects" },
                    { value: "art", label: "Art Direction" },
                    { value: "brand", label: "Branding & Visuals" },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label="Status"
                name="status"
                valuePropName="checked" // เพราะใช้ Switch
                initialValue={true}
              >
                <Switch />
              </Form.Item>

              <div className="flex justify-end">
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </div>
            </Form>
          </Modal>
        </>
      ) : null}
    </div>
  );
};

export default PromptGuidePage;
