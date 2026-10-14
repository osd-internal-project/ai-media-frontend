"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { PlusOutlined, DeleteOutlined, NodeIndexOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { axiosCore } from "@/app/lib/axios/axios";
import WorkflowServices, {
  type WorkflowConversation,
} from "@/app/services/workflow.service";

interface WorkflowFormRendererProps {
  activeKey: string;
  projectId: string;
}

/**
 * เนื้อหาแท็บ Workflow — แสดงรายการ conversation ของโปรเจกต์
 * และให้สร้าง/ลบ/เปิดแคนวาส (ไม่ยุ่งกับแท็บ Gen Image/Video เดิม)
 */
const WorkflowFormRenderer: React.FC<WorkflowFormRendererProps> = ({
  activeKey,
  projectId,
}) => {
  const router = useRouter();
  const workflowService = useMemo(() => WorkflowServices(axiosCore), []);

  const [conversations, setConversations] = useState<WorkflowConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm<{ name: string; description?: string }>();

  /** โหลดรายการ conversation ของโปรเจกต์ */
  const fetchConversations = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await workflowService.listConversations(projectId);
      setConversations(data);
    } catch (error) {
      console.error("Failed to load workflow conversations:", error);
      message.error("ไม่สามารถโหลดรายการ workflow ได้");
    } finally {
      setLoading(false);
    }
  }, [projectId, workflowService]);

  // โหลดเมื่อแท็บ workflow ถูกเลือก
  useEffect(() => {
    if (activeKey === "workflow") {
      fetchConversations();
    }
  }, [activeKey, fetchConversations]);

  /** ยืนยันสร้าง conversation ใหม่ */
  const handleCreate = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setCreating(true);
      const created = await workflowService.createConversation(projectId, {
        name: values.name,
        description: values.description,
      });
      message.success("สร้าง workflow สำเร็จ");
      setModalOpen(false);
      form.resetFields();
      // เปิดแคนวาสของ conversation ที่เพิ่งสร้างทันที
      router.push(`/page/project/${projectId}/workflow/${created.id}`);
    } catch (error) {
      if ((error as { errorFields?: unknown }).errorFields) return; // validation error
      console.error("Failed to create conversation:", error);
      message.error("สร้าง workflow ไม่สำเร็จ");
    } finally {
      setCreating(false);
    }
  }, [form, projectId, router, workflowService]);

  /** ลบ conversation */
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await workflowService.deleteConversation(projectId, id);
        message.success("ลบ workflow สำเร็จ");
        fetchConversations();
      } catch (error) {
        console.error("Failed to delete conversation:", error);
        message.error("ลบ workflow ไม่สำเร็จ");
      }
    },
    [fetchConversations, projectId, workflowService],
  );

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description?: string) =>
        description || <Typography.Text type="secondary">-</Typography.Text>,
    },
    {
      title: "Blocks",
      key: "blocks",
      width: 100,
      render: (_: unknown, record: WorkflowConversation) => (
        <Tag color="blue">{record._count?.blocks ?? 0}</Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200,
      render: (createdAt: string) => new Date(createdAt).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_: unknown, record: WorkflowConversation) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<NodeIndexOutlined />}
            onClick={() =>
              router.push(
                `/page/project/${projectId}/workflow/${record.id}`,
              )
            }
          >
            Open
          </Button>
          <Popconfirm
            title="ลบ workflow นี้?"
            description="บล็อกทั้งหมดในแคนวาสจะถูกลบด้วย"
            okText="ลบ"
            cancelText="ยกเลิก"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="h-full w-full p-4 overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <Typography.Title level={4} style={{ margin: 0 }}>
          Workflows
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          New Conversation
        </Button>
      </div>

      <Table<WorkflowConversation>
        rowKey="id"
        loading={loading}
        dataSource={conversations}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="New Workflow Conversation"
        open={modalOpen}
        onOk={handleCreate}
        confirmLoading={creating}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        okText="Create"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" requiredMark>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "กรุณาใส่ชื่อ workflow" }]}
          >
            <Input placeholder="เช่น Hero scene pipeline" maxLength={200} />
          </Form.Item>
          <Form.Item name="description" label="Description (optional)">
            <Input.TextArea rows={3} maxLength={1000} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkflowFormRenderer;
