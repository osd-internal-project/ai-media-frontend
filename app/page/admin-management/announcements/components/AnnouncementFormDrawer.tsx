"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Radio,
  Space,
  Switch,
  Upload,
} from "antd";
import { ImagePlus, Trash2 } from "lucide-react";
import {
  AnnouncementCategory,
  IAnnouncement,
  IAnnouncementInput,
} from "@/app/common/announcement.type";
import {
  AnnouncementSlide,
  CATEGORY_META,
} from "@/app/home/components/AnnouncementModal";

// ต้องเท่ากับ ANNOUNCEMENT_MAX_FILE_BYTES ของ core
const MAX_FILE_BYTES = 10 * 1024 * 1024;

interface FormValues {
  category: AnnouncementCategory;
  title: string;
  body?: string;
  sortOrder: number;
  isActive: boolean;
}

interface Props {
  open: boolean;
  editing: IAnnouncement | null;
  saving: boolean;
  onClose: () => void;
  onSave: (input: IAnnouncementInput) => void;
  onFileRejected: (reason: string) => void;
}

/** ฟอร์มเดียวสำหรับสร้างและแก้ไข พร้อม preview แบบเดียวกับที่หน้า public แสดง */
export default function AnnouncementFormDrawer({
  open,
  editing,
  saving,
  onClose,
  onSave,
  onFileRejected,
}: Props) {
  const [form] = Form.useForm<FormValues>();
  const [file, setFile] = useState<File | undefined>();
  const [removeImage, setRemoveImage] = useState(false);
  const values = Form.useWatch([], form);

  useEffect(() => {
    if (!open) return;
    setFile(undefined);
    setRemoveImage(false);
    form.setFieldsValue({
      category: editing?.category ?? "PROMOTION",
      title: editing?.title ?? "",
      body: editing?.body ?? "",
      sortOrder: editing?.sortOrder ?? 0,
      isActive: editing?.isActive ?? false,
    });
  }, [open, editing, form]);

  const fileUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const imageUrl = fileUrl ?? (removeImage ? null : editing?.imageUrl ?? null);

  const submit = (v: FormValues) =>
    onSave({
      category: v.category,
      title: v.title.trim(),
      body: v.body?.trim() || undefined,
      sortOrder: v.sortOrder,
      isActive: v.isActive,
      removeImage: Boolean(editing?.imageUrl) && removeImage && !file,
      file,
    });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      title={editing ? "Edit announcement" : "New announcement"}
      extra={
        <Button type="primary" loading={saving} onClick={() => form.submit()}>
          Save announcement
        </Button>
      }
    >
      <Form form={form} layout="vertical" onFinish={submit} requiredMark={false}>
        <Form.Item label="Image (optional)">
          {imageUrl ? (
            <Space>
              <Upload
                accept="image/png,image/jpeg,image/webp"
                showUploadList={false}
                beforeUpload={(f) => pickFile(f)}
              >
                <Button icon={<ImagePlus size={16} />}>Replace image</Button>
              </Upload>
              <Button
                danger
                icon={<Trash2 size={16} />}
                onClick={() => {
                  setFile(undefined);
                  setRemoveImage(true);
                }}
              >
                Remove image
              </Button>
            </Space>
          ) : (
            <Upload.Dragger
              accept="image/png,image/jpeg,image/webp"
              showUploadList={false}
              beforeUpload={(f) => pickFile(f)}
            >
              <p className="flex justify-center">
                <ImagePlus size={28} />
              </p>
              <p>Drop a poster here or click to choose one</p>
              <p className="text-xs opacity-70">
                PNG, JPEG or WebP up to 10 MB. Portrait 3:4 fits best.
              </p>
            </Upload.Dragger>
          )}
        </Form.Item>

        <Form.Item name="category" label="Category">
          <Radio.Group
            optionType="button"
            options={(
              Object.keys(CATEGORY_META) as AnnouncementCategory[]
            ).map((key) => ({ value: key, label: CATEGORY_META[key].label }))}
          />
        </Form.Item>

        <Form.Item
          name="title"
          label="Title"
          extra="Also read aloud by screen readers when the poster has no text below it."
          rules={[
            { required: true, whitespace: true, message: "Enter a title" },
            { max: 150 },
          ]}
        >
          <Input showCount maxLength={150} />
        </Form.Item>

        <Form.Item name="body" label="Details (optional)">
          <Input.TextArea rows={4} showCount maxLength={5000} />
        </Form.Item>

        <Space size="large">
          <Form.Item
            name="sortOrder"
            label="Order"
            tooltip="Lower numbers show first"
          >
            <InputNumber min={0} precision={0} />
          </Form.Item>
          <Form.Item name="isActive" label="Show on public pages" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Space>
      </Form>

      <div className="mt-2">
        <div className="mb-2 text-sm font-medium text-[var(--legacy-ink)]">
          Preview
        </div>
        <div className="rounded-[14px] bg-[#020308] p-4">
          <AnnouncementSlide
            item={{
              category: values?.category ?? "PROMOTION",
              title: values?.title || "Announcement title",
              body: values?.body || null,
              imageUrl,
            }}
          />
        </div>
      </div>
    </Drawer>
  );

  function pickFile(f: File) {
    if (f.size > MAX_FILE_BYTES) {
      onFileRejected(`${f.name} is larger than 10 MB`);
      return Upload.LIST_IGNORE;
    }
    setFile(f);
    setRemoveImage(false);
    return false; // อัปโหลดตอนกด Save พร้อมฟอร์ม
  }
}
