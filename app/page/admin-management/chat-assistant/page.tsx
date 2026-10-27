"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Modal, Switch, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { axiosChatAssistant } from "@/app/lib/axios/axios";
import ChatAssistantService from "@/app/services/chat-assistant.service";
import type { ChatModelOption } from "@/app/services/chat-assistant.types";

const { Text } = Typography;

const columns: ColumnsType<ChatModelOption> = [
  { title: "Name", dataIndex: "displayName" },
  { title: "Model ID", dataIndex: "modelId" },
  {
    title: "Default",
    dataIndex: "isDefault",
    width: 100,
    render: (isDefault: boolean) => (isDefault ? <Tag color="processing">Default</Tag> : null),
  },
  {
    title: "Images",
    dataIndex: "supportsVision",
    width: 100,
    render: (supportsVision: boolean) => (supportsVision ? "Yes" : "No"),
  },
];

export default function ChatAssistantAdminPage() {
  const service = useMemo(() => ChatAssistantService(axiosChatAssistant), []);
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalHolder] = Modal.useModal();
  // null = ยังโหลดไม่ได้ — ปิดสวิตช์ไว้ ไม่เดาค่า
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [models, setModels] = useState<ChatModelOption[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);

  const load = useCallback(async () => {
    try {
      setEnabled((await service.getSetting()).enabled);
    } catch (error) {
      messageApi.error(
        `Could not load the setting: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    setModels(await service.listChatModels());
    setLoadingModels(false);
  }, [service, messageApi]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (next: boolean) => {
    setSaving(true);
    try {
      setEnabled((await service.setSetting(next)).enabled);
      messageApi.success(next ? "Chat assistant turned on" : "Chat assistant turned off");
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  // ปิดกระทบผู้ใช้ทุกคนทันที — ถามก่อน; เปิดไม่ต้องถาม
  const toggle = (next: boolean) => {
    if (next) {
      save(true);
      return;
    }
    modal.confirm({
      title: "Turn off the chat assistant?",
      content: "Everyone loses the AI Assist button right away, and chats in progress stop.",
      okText: "Turn off",
      okButtonProps: { danger: true },
      onOk: () => save(false),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {contextHolder}
      {modalHolder}
      <Card size="small">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Text style={{ fontSize: 14, fontWeight: 500 }}>Chat assistant for all users</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              When off, the AI Assist button is hidden and chat requests are refused.
            </Text>
          </div>
          <Switch
            checked={enabled === true}
            disabled={enabled === null}
            loading={saving}
            onChange={toggle}
            aria-label="Chat assistant for all users"
          />
        </div>
      </Card>

      <Card size="small" title="Models in use">
        <Table
          rowKey="modelId"
          size="small"
          columns={columns}
          dataSource={models}
          loading={loadingModels}
          pagination={false}
          locale={{ emptyText: "No chat model is turned on." }}
        />
      </Card>
    </div>
  );
}
