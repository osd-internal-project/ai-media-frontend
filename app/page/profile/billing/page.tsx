"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Segmented,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { axiosUser } from "@/app/lib/axios/axios";
import BillingProfileServices from "@/app/services/billing-profile.service";
import {
  BillingProfileType,
  IBillingProfile,
  ICreateBillingProfile,
} from "@/app/common/billing-profile.type";

type ModalState = { open: boolean; mode: "create" | "edit"; id?: string };

const BillingProfilePage: React.FC = () => {
  const { data: session } = useSession();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [profiles, setProfiles] = useState<IBillingProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    mode: "create",
  });
  const [type, setType] = useState<BillingProfileType>("INDIVIDUAL");

  const service = useMemo(() => BillingProfileServices(axiosUser), []);
  const userId = session?.user?.id;
  const organizationId = session?.user?.organizationId;

  const fetchProfiles = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await service.findByUserId(userId);
      setProfiles(data);
    } finally {
      setLoading(false);
    }
  }, [service, userId]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const openCreate = () => {
    form.resetFields();
    setType("INDIVIDUAL");
    setModal({ open: true, mode: "create" });
  };

  const openEdit = (record: IBillingProfile) => {
    setType(record.type);
    form.setFieldsValue(record);
    setModal({ open: true, mode: "edit", id: record.id });
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!userId || !organizationId) {
      messageApi.error("Missing user/organization context");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        type,
        userId,
        organizationId,
      } as ICreateBillingProfile;

      if (modal.mode === "create") {
        await service.create(payload);
        messageApi.success("Billing profile created");
      } else if (modal.id) {
        await service.update(modal.id, payload);
        messageApi.success("Billing profile updated");
      }
      setModal({ open: false, mode: "create" });
      fetchProfiles();
    } catch {
      messageApi.error("Failed to save billing profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await service.remove(id);
    if (ok) {
      messageApi.success("Deleted");
      fetchProfiles();
    } else {
      messageApi.error("Failed to delete");
    }
  };

  const handleSetDefault = async (id: string) => {
    await service.setDefault(id);
    fetchProfiles();
  };

  const columns: ColumnsType<IBillingProfile> = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (t: BillingProfileType) => (
        <Tag color={t === "JURISTIC" ? "geekblue" : "green"}>{t}</Tag>
      ),
    },
    {
      title: "Name",
      key: "name",
      render: (_, r) => r.companyName || r.fullName || "-",
    },
    {
      title: "Tax / National ID",
      key: "taxId",
      render: (_, r) => r.taxId || r.nationalId || "-",
    },
    {
      title: "Branch",
      key: "branch",
      render: (_, r) =>
        r.type === "JURISTIC" ? `${r.branchCode || "-"} ${r.branchName || ""}` : "-",
    },
    {
      title: "Default",
      dataIndex: "isDefault",
      key: "isDefault",
      render: (isDefault: boolean, r) =>
        isDefault ? (
          <Tag color="gold">Default</Tag>
        ) : (
          <Button type="link" size="small" onClick={() => handleSetDefault(r.id)}>
            Set default
          </Button>
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, r) => (
        <Space>
          <Button type="link" onClick={() => openEdit(r)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this billing profile?"
            onConfirm={() => handleDelete(r.id)}
          >
            <Button danger type="link">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing Profiles</h1>
          <p className="text-gray-400">
            Tax invoice information used when purchasing a package. You can add
            multiple profiles for multi-branch companies.
          </p>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={openCreate}>
          Add Profile
        </Button>
      </div>

      <Card size="small">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={profiles}
          columns={columns}
          pagination={{ pageSize: 8 }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      <Modal
        title={modal.mode === "create" ? "Add Billing Profile" : "Edit Billing Profile"}
        open={modal.open}
        onCancel={() => setModal({ open: false, mode: "create" })}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText="Save"
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item label="Profile Type">
            <Segmented
              value={type}
              onChange={(v) => setType(v as BillingProfileType)}
              options={[
                { label: "Individual", value: "INDIVIDUAL" },
                { label: "Juristic (Company)", value: "JURISTIC" },
              ]}
            />
          </Form.Item>

          {type === "INDIVIDUAL" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[{ required: true, message: "Full name is required" }]}
              >
                <Input placeholder="Full name" />
              </Form.Item>
              <Form.Item
                label="National ID"
                name="nationalId"
                rules={[
                  { required: true, message: "National ID is required" },
                  { len: 13, message: "National ID must be 13 digits" },
                ]}
              >
                <Input placeholder="13-digit national ID" maxLength={13} />
              </Form.Item>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item
                label="Company Name"
                name="companyName"
                rules={[{ required: true, message: "Company name is required" }]}
              >
                <Input placeholder="Company name" />
              </Form.Item>
              <Form.Item
                label="Tax ID"
                name="taxId"
                rules={[
                  { required: true, message: "Tax ID is required" },
                  { len: 13, message: "Tax ID must be 13 digits" },
                ]}
              >
                <Input placeholder="13-digit tax ID" maxLength={13} />
              </Form.Item>
              <Form.Item
                label="Branch Code"
                name="branchCode"
                rules={[{ required: true, message: "Branch code is required" }]}
                tooltip="Head office = 00000"
              >
                <Input placeholder="e.g. 00000 (head office)" />
              </Form.Item>
              <Form.Item label="Branch Name" name="branchName">
                <Input placeholder="Branch name" />
              </Form.Item>
              <Form.Item
                label="Contact Name"
                name="contactName"
                rules={[{ required: true, message: "Contact name is required" }]}
              >
                <Input placeholder="Contact person" />
              </Form.Item>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[{ required: true, message: "Phone is required" }]}
              >
                <Input placeholder="Phone number" />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Invalid email" },
                ]}
              >
                <Input placeholder="billing@company.com" />
              </Form.Item>
            </div>
          )}

          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: "Address is required" }]}
          >
            <Input.TextArea rows={3} placeholder="Full billing address" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BillingProfilePage;
