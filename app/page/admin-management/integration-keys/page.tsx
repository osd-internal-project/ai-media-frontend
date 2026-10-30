"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Checkbox, Form, Input, Modal, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import dayjs from "dayjs";
import { axiosCore } from "@/app/lib/axios/axios";
import CommunityPublicationServices from "@/app/services/community-publication.service";
import { getPhotoEventErrorMessage as getErrorMessage } from "@/app/services/photo-event.service";
import type { IntegrationApiKey, IntegrationApiKeyScope } from "@/app/common/org-gallery.type";

const SCOPE_OPTIONS: { label: string; value: IntegrationApiKeyScope }[] = [
  { label: "แจ้งผลตรวจ / ถอดงาน (webhook)", value: "webhook" },
  { label: "ขอลิงก์ไฟล์ต้นฉบับ (original, ยังไม่เปิดใช้)", value: "original" },
];

const formatDate = (value: string | null) => (value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-");

export default function IntegrationKeysPage() {
  const service = useMemo(() => CommunityPublicationServices(axiosCore), []);
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalHolder] = Modal.useModal();
  const [form] = Form.useForm<{ name: string; scopes: IntegrationApiKeyScope[] }>();
  const [data, setData] = useState<IntegrationApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await service.listApiKeys());
    } catch (error) {
      messageApi.error(`Could not load API keys: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  }, [service, messageApi]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const created = await service.createApiKey(values);
      setCreateOpen(false);
      form.resetFields();
      setNewKey(created.key);
      await load();
    } catch (error) {
      messageApi.error(`Could not create key: ${getErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmRevoke = (record: IntegrationApiKey) =>
    modal.confirm({
      title: "Revoke this key?",
      content: `"${record.name}" (${record.prefix}…) stops working immediately. Systems using it must get a new key.`,
      okText: "Revoke",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await service.revokeApiKey(record.id);
          messageApi.success("Key revoked");
          await load();
        } catch (error) {
          messageApi.error(`Could not revoke: ${getErrorMessage(error)}`);
        }
      },
    });

  const columns: ColumnsType<IntegrationApiKey> = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Key",
      dataIndex: "prefix",
      key: "prefix",
      render: (prefix: string) => <Typography.Text code>{prefix}…</Typography.Text>,
    },
    {
      title: "Scopes",
      dataIndex: "scopes",
      key: "scopes",
      render: (scopes: string[]) => scopes.map((s) => <Tag key={s}>{s}</Tag>),
    },
    { title: "Created", dataIndex: "createdAt", key: "createdAt", render: formatDate },
    { title: "Last used", dataIndex: "lastUsedAt", key: "lastUsedAt", render: formatDate },
    {
      title: "Status",
      key: "status",
      render: (_, record) =>
        record.revokedAt ? <Tag>Revoked {formatDate(record.revokedAt)}</Tag> : <Tag color="green">Active</Tag>,
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, record) =>
        !record.revokedAt && (
          <Button size="small" danger onClick={() => confirmRevoke(record)}>
            Revoke
          </Button>
        ),
    },
  ];

  return (
    <div className="p-6">
      {contextHolder}
      {modalHolder}
      <Card
        title="Integration API keys"
        extra={
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
            New key
          </Button>
        }
      >
        <Typography.Paragraph type="secondary">
          Keys for external systems (Community) calling AI Cave. Only the prefix is stored in a readable form.
        </Typography.Paragraph>
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={false} />
      </Card>

      <Modal
        open={createOpen}
        title="New integration key"
        okText="Create key"
        confirmLoading={saving}
        onOk={create}
        onCancel={() => setCreateOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ scopes: ["webhook"] }} preserve={false}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Name the system that will use it" }]}>
            <Input placeholder="Foundise Community (production)" maxLength={100} />
          </Form.Item>
          <Form.Item name="scopes" label="Scopes" rules={[{ required: true, message: "Pick at least one scope" }]}>
            <Checkbox.Group options={SCOPE_OPTIONS} style={{ display: "grid", gap: 8 }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={newKey !== null}
        title="Copy this key now"
        okText="I copied it"
        cancelButtonProps={{ style: { display: "none" } }}
        onOk={() => setNewKey(null)}
        onCancel={() => setNewKey(null)}
      >
        <Alert type="warning" showIcon message="This key is shown once. Closing this window hides it for good." />
        <Typography.Paragraph copyable={{ text: newKey ?? "" }} code style={{ marginTop: 16, wordBreak: "break-all" }}>
          {newKey}
        </Typography.Paragraph>
      </Modal>
    </div>
  );
}
