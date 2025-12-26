"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Tabs,
  Badge,
  Avatar,
  Space,
} from "antd";
import { useOrganization } from "@/app/context/OrganizationContext";
import OrganizationService from "@/app/services/organization.service";
import OrganizationMembersServices from "@/app/services/organization-members.service";
import { axiosUser } from "@/app/lib/axios/axios";
import { IOrganization } from "@/app/common/organization.type";
import UserServices from "@/app/services/users.service";
import { TUser } from "@/app/common/user.type";
import type { ColumnsType } from "antd/es/table";

export default function OrganizationDetailPage() {
  const { organizationId } = useOrganization();
  const [organization, setOrganization] = useState<IOrganization>();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  // Forms
  const [editForm] = Form.useForm();
  const [addMemberForm] = Form.useForm();
  const [editMemberForm] = Form.useForm();

  // Services
  const organizationService = OrganizationService(axiosUser);
  const organizationMemberService = OrganizationMembersServices(axiosUser);
  const userServices = UserServices(axiosUser);

  // Data
  const [availableUsers, setAvailableUsers] = useState<TUser[]>([]);
  const [currentMemberId, setCurrentMemberId] = useState<number | null>(null);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationData();
      fetchAvailableUsers();
    }
  }, [organizationId]);

  const fetchOrganizationData = async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const orgData = await organizationService.findById(organizationId);
      setOrganization(orgData);

      const membersData = await organizationMemberService.findByOrganization(
        organizationId
      );
      setMembers(membersData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const users = await userServices.findAll();
      setAvailableUsers(users || []);
    } catch (error) {
      console.error(error);
    }
  };

  // Edit Organization
  const handleEdit = () => {
    editForm.setFieldsValue({
      name: organization?.name,
      description: organization?.description,
    });
    setIsEditModalOpen(true);
  };

  const onEditFinish = async (values: any) => {
    if (!organizationId) return;
    try {
      await organizationService.update(organizationId, values);
      setIsEditModalOpen(false);
      fetchOrganizationData();
    } catch (error) {
      console.error(error);
    }
  };

  // Add Member
  const handleAddMember = () => {
    addMemberForm.resetFields();
    setIsAddMemberModalOpen(true);
  };

  const onAddMemberFinish = async (values: any) => {
    if (!organizationId) return;
    try {
      await organizationMemberService.create({
        ...values,
        organizationId: organizationId,
      });
      setIsAddMemberModalOpen(false);
      fetchOrganizationData();
    } catch (error) {
      console.error(error);
    }
  };

  // Edit Member
  const handleEditMember = (member: any) => {
    setCurrentMemberId(member.id);
    editMemberForm.setFieldsValue({
      role: member.role,
    });
    setIsEditMemberModalOpen(true);
  };

  const onEditMemberFinish = async (values: any) => {
    if (!currentMemberId) return;
    try {
      await organizationMemberService.update(currentMemberId, values);
      setIsEditMemberModalOpen(false);
      fetchOrganizationData();
    } catch (error) {
      console.error(error);
    }
  };

  // Remove Member
  const handleRemoveMember = async (memberId: number) => {
    try {
      await organizationMemberService.del(memberId);
      fetchOrganizationData();
    } catch (error) {
      console.error(error);
    }
  };

  // Table Columns
  const columns: ColumnsType<any> = [
    {
      title: "User",
      dataIndex: "userId", // Should probably populate user details in backend or fetch here
      key: "userId",
      render: (userId) => {
        // Find user in availableUsers for display name
        const user = availableUsers.find((u) => u.userId === userId);
        return (
          <Space>
            <Avatar>{user?.fullname?.[0] || "U"}</Avatar>
            {user?.fullname || userId}
          </Space>
        );
      },
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "OWNER" ? "gold" : "blue"}>{role}</Tag>
      ),
    },
    {
      title: "Joined At",
      dataIndex: "joinedAt",
      key: "joinedAt",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEditMember(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Remove member?"
            onConfirm={() => handleRemoveMember(record.id)}
          >
            <Button type="link" danger>
              Remove
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!organizationId) {
    return <div className="p-4">Please select an organization.</div>;
  }

  return (
    <div className="p-4">
      <Card
        title="Organization Details"
        extra={<Button onClick={handleEdit}>Edit</Button>}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Name">
            {organization?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Type">
            <Tag color="cyan">{organization?.type}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {organization?.description || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {organization?.createdAt
              ? new Date(organization.createdAt).toLocaleDateString()
              : "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="Members"
        className="mt-4"
        extra={
          <Button type="primary" onClick={handleAddMember}>
            Add Member
          </Button>
        }
      >
        <Table
          dataSource={members}
          columns={columns}
          rowKey="id"
          loading={loading}
        />
      </Card>

      {/* Edit Organization Modal */}
      <Modal
        title="Edit Organization"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => editForm.submit()}
      >
        <Form form={editForm} onFinish={onEditFinish} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        title="Add Member"
        open={isAddMemberModalOpen}
        onCancel={() => setIsAddMemberModalOpen(false)}
        onOk={() => addMemberForm.submit()}
      >
        <Form
          form={addMemberForm}
          onFinish={onAddMemberFinish}
          layout="vertical"
        >
          <Form.Item name="userId" label="User" rules={[{ required: true }]}>
            <Select
              placeholder="Select User"
              showSearch
              optionFilterProp="label"
            >
              {availableUsers.map((user) => (
                <Select.Option
                  key={user.userId}
                  value={user.userId}
                  label={user.fullname}
                >
                  {user.fullname} ({user.email})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true }]}
            // initialValue="MEMBER"
          >
            <Select>
              <Select.Option value="OWNER">OWNER</Select.Option>
              <Select.Option value="ADMIN">ADMIN</Select.Option>
              <Select.Option value="MEMBER">MEMBER</Select.Option>
              <Select.Option value="VIEWER">VIEWER</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        title="Edit Member Role"
        open={isEditMemberModalOpen}
        onCancel={() => setIsEditMemberModalOpen(false)}
        onOk={() => editMemberForm.submit()}
      >
        <Form
          form={editMemberForm}
          onFinish={onEditMemberFinish}
          layout="vertical"
        >
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="OWNER">OWNER</Select.Option>
              <Select.Option value="ADMIN">ADMIN</Select.Option>
              <Select.Option value="MEMBER">MEMBER</Select.Option>
              <Select.Option value="VIEWER">VIEWER</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
