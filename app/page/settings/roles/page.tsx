"use client";
import React, { useEffect, useState } from "react";
import { axiosUser } from "@/app/lib/axios/axios";
import RoleServices from "@/app/services/roles.service";
import { Button, Form, Input, message, Modal, Popconfirm, Select, Table } from "antd";
import type { TRoles } from "@/app/common/roles.type";
import type { ColumnsType } from "antd/es/table";

const RolesPage = () => {
  const [formcreate] = Form.useForm();
  const roleServices = RoleServices(axiosUser);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<TRoles[]>([]);
  const [open, setOpen] = useState<{ status: string; type: boolean }>({ status: "create", type: false });

  useEffect(() => {
    if (loading) {
      fecthdata();
    }
  }, [loading]);

  const fecthdata = async () => {
    const response = await roleServices.findAll();
    setData(response);
    setLoading(false);
  };

  const handleModal = (status: string) => {
    if (status === "create") {
      setOpen({ status: "create", type: true });
    } else if (status === "edit") {
      setOpen({ status: "edit", type: true });
    } else {
      setOpen({ status: "close", type: false });
    }
  };

  const onFinish = async (values: TRoles, status: string) => {
    let response;
    if (status === "create") {
      response = await roleServices.create(values);
    } else if (status === "edit") {
      const { roleId, ...value } = values;
      response = await roleServices.update(roleId, value);
    }
    if (response) {
      message.success(`${status} success`);
      formcreate.resetFields();
      setLoading(true);
      setOpen({ status: "create", type: false });
    }
  };
  const handleDelete = async (roleId: string) => {
    try {
      await roleServices.del(roleId);
      message.success("Deleted successfully");
    } catch (error) {
      message.error("Delete failed");
    }
    setLoading(true);
  };

  const columns: ColumnsType<TRoles> = [
    { key: "id", title: "No.", dataIndex: "id" },
    { key: "name", title: "Name", dataIndex: "name" },
    { key: "description", title: "Description", dataIndex: "description" },
    { key: "type", title: "Type", dataIndex: "type" },
    { key: "createdAt", title: "CreatedAt", dataIndex: "createdAt" },
    {
      key: "id",
      title: "...",
      dataIndex: "id",
      render: (event: number, record: TRoles) => {
        return (
          <div className="flex justify-center gap-3">
            <Button
              className="!border-amber-50 w-20"
              size="large"
              type="default"
              onClick={() => {
                handleModal("edit"), formcreate.setFieldsValue(record);
              }}
            >{`Edit`}</Button>
            <Popconfirm
              title="Delete Role"
              description="Are you sure you want to delete this role?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleDelete(record.roleId)}
            >
              <Button className="w-20" danger size="large">
                Delete
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen  relative overflow-hidden">
      <div>
        <div className="w-full !text-white flex justify-end">
          <Button
            className="!border-amber-50"
            size="large"
            type="default"
            onClick={() => {
              handleModal("create");
            }}
          >{`Add Roles`}</Button>
        </div>
        <div>
          <Table dataSource={data} columns={columns} rowKey={"roleId"} scroll={{ x: "max-content" }} />
        </div>
      </div>
      {open.type ? (
        <>
          <Modal title={`${open.status} Role`} open={open.type} footer={false} onCancel={() => handleModal("close")}>
            <Form<TRoles>
              name={`manage-roles`}
              form={formcreate}
              layout="vertical"
              autoComplete="off"
              onFinish={(e) => {
                onFinish(e, open.status);
              }}
            >
              {open.status === "edit" ? (
                <Form.Item label={`roleId :`} name={"roleId"} hidden>
                  <Input placeholder="Input" />
                </Form.Item>
              ) : null}
              <Form.Item label={`Name :`} name={"name"}>
                <Input placeholder="Input" />
              </Form.Item>
              <Form.Item label={`Type Role :`} name={"type"}>
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Please Select"
                  options={[
                    { value: "content", label: "Content" },
                    { value: "user", label: "User" },
                    { value: "resources", label: "Resources" },
                  ]}
                />
              </Form.Item>
              <Form.Item label={`Description`} name={"description"}>
                <Input.TextArea rows={3} placeholder="Input" />
              </Form.Item>
              <div className="flex justify-end">
                <Button type="primary" htmlType="submit">{`Submit`}</Button>
              </div>
            </Form>
          </Modal>
        </>
      ) : null}
    </div>
  );
};

export default RolesPage;
