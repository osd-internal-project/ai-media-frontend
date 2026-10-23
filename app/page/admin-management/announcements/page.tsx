"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Dropdown,
  Empty,
  Image,
  Modal,
  Switch,
  Table,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { MoreHorizontal, Plus } from "lucide-react";
import { axiosCore } from "@/app/lib/axios/axios";
import AnnouncementService from "@/app/services/announcement.service";
import { getPhotoEventErrorMessage as getErrorMessage } from "@/app/services/photo-event.service";
import {
  IAnnouncement,
  IAnnouncementInput,
} from "@/app/common/announcement.type";
import { CATEGORY_META } from "@/app/home/components/AnnouncementModal";
import AnnouncementFormDrawer from "./components/AnnouncementFormDrawer";

export default function AnnouncementsPage() {
  const service = useMemo(() => AnnouncementService(axiosCore), []);
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalHolder] = Modal.useModal();
  const [data, setData] = useState<IAnnouncement[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<IAnnouncement | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await service.findAll());
    } catch (error) {
      messageApi.error(`Could not load announcements: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  }, [service, messageApi]);

  useEffect(() => {
    load();
  }, [load]);

  const openDrawer = (record: IAnnouncement | null) => {
    setEditing(record);
    setDrawerOpen(true);
  };

  const save = async (input: IAnnouncementInput) => {
    setSaving(true);
    try {
      if (editing) await service.update(editing.id, input);
      else await service.create(input);
      messageApi.success("Announcement saved");
      setDrawerOpen(false);
      await load();
    } catch (error) {
      messageApi.error(`Could not save: ${getErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (record: IAnnouncement, isActive: boolean) => {
    setTogglingId(record.id);
    try {
      const updated = await service.setActive(record.id, isActive);
      setData((rows) => rows.map((r) => (r.id === updated.id ? updated : r)));
    } catch (error) {
      messageApi.error(`Could not change status: ${getErrorMessage(error)}`);
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = (record: IAnnouncement) =>
    modal.confirm({
      title: "Delete this announcement?",
      content: `"${record.title}" and its image will be removed for good.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await service.remove(record.id);
          messageApi.success("Announcement deleted");
          await load();
        } catch (error) {
          messageApi.error(`Could not delete: ${getErrorMessage(error)}`);
        }
      },
    });

  const columns: ColumnsType<IAnnouncement> = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      width: 88,
      render: (url: string | null, r) =>
        url ? (
          <Image
            src={url}
            alt={r.title}
            width={56}
            height={74}
            style={{ objectFit: "cover", borderRadius: 8 }}
          />
        ) : (
          <span className="text-xs text-[var(--legacy-gray-500)]">Text only</span>
        ),
    },
    {
      title: "Announcement",
      dataIndex: "title",
      render: (title: string, r) => (
        <div className="max-w-[420px]">
          <div className="font-medium text-[var(--legacy-ink)]">{title}</div>
          <span className="mt-1 inline-flex items-center gap-2 text-xs text-[var(--legacy-gray-500)]">
            <span
              aria-hidden
              className="h-2 w-2 rounded-full"
              style={{ background: CATEGORY_META[r.category].color }}
            />
            {CATEGORY_META[r.category].label}
          </span>
        </div>
      ),
    },
    { title: "Order", dataIndex: "sortOrder", width: 80 },
    {
      title: "Active",
      dataIndex: "isActive",
      width: 90,
      render: (isActive: boolean, r) => (
        <Switch
          checked={isActive}
          loading={togglingId === r.id}
          onChange={(checked) => toggleActive(r, checked)}
          aria-label={`Show "${r.title}" on public pages`}
        />
      ),
    },
    {
      key: "actions",
      width: 56,
      render: (_, r) => (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              { key: "edit", label: "Edit" },
              { key: "delete", label: "Delete", danger: true },
            ],
            onClick: ({ key }) =>
              key === "edit" ? openDrawer(r) : confirmDelete(r),
          }}
        >
          <Button
            type="text"
            icon={<MoreHorizontal size={16} />}
            aria-label="More actions"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {contextHolder}
      {modalHolder}
      <h2 className="text-xl font-semibold text-[var(--legacy-ink)]">
        Announcements
      </h2>
      <Card size="small">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-sm text-[var(--legacy-gray-500)]">
            Active announcements pop up once per visitor on Home, Features and
            Pricing. Editing one shows it again.
          </span>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => openDrawer(null)}
          >
            New announcement
          </Button>
        </div>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={false}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <Empty description="No announcements yet. Create one to show a poster or a system update on the public pages." />
            ),
          }}
        />
      </Card>
      <AnnouncementFormDrawer
        open={drawerOpen}
        editing={editing}
        saving={saving}
        onClose={() => setDrawerOpen(false)}
        onSave={save}
        onFileRejected={(reason) => messageApi.error(reason)}
      />
    </div>
  );
}
