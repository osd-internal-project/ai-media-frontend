"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Avatar,
  Space,
  InputNumber,
  message,
} from "antd";
import { useCallback } from "react";
import { useOrganization } from "@/app/context/OrganizationContext";
import OrganizationService from "@/app/services/organization.service";
import OrganizationMembersServices from "@/app/services/organization-members.service";
import CreditBalanceServices from "@/app/services/credit-balance.service";
import { axiosUser } from "@/app/lib/axios/axios";
import { PlusCircleOutlined } from "@ant-design/icons";
import { IOrganization } from "@/app/common/organization.type";
import UserServices from "@/app/services/users.service";
import { TUser } from "@/app/common/user.type";
import type { ColumnsType } from "antd/es/table";
import { formatNumber } from "@/app/utils/format";
import { canEditOrganization, canManageMembers } from "@/app/utils/permissions";
import { useSession } from "next-auth/react";

export default function OrganizationDetailPage() {
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();
  const { organizationRole } = useOrganization();
  const [organization, setOrganization] = useState<IOrganization>();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isExtraCoinModalOpen, setIsExtraCoinModalOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  // Forms
  const [editForm] = Form.useForm();
  const [editMemberForm] = Form.useForm();
  const [inviteForm] = Form.useForm();
  const [extraCoinForm] = Form.useForm();

  // Services
  const organizationService = OrganizationService(axiosUser);
  const organizationMemberService = OrganizationMembersServices(axiosUser);
  const userServices = UserServices(axiosUser);
  const creditBalanceService = CreditBalanceServices(axiosUser);

  // Data
  const [availableUsers, setAvailableUsers] = useState<TUser[]>([]);
  const [currentMemberId, setCurrentMemberId] = useState<number | null>(null);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);

  const showMessage = (
    type: "error" | "success" | "warning" | "loading",
    content: string,
  ) => {
    messageApi.open({
      type: type,
      content: content,
    });
  };
  const fetchOrganizationData = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const orgData = await organizationService.findById(organizationId);
      setOrganization(orgData);

      const membersData =
        await organizationMemberService.findByOrganization(organizationId);
      setMembers(membersData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [organizationId, organizationService, organizationMemberService]);

  const fetchAvailableUsers = useCallback(async () => {
    try {
      const users = await userServices.findAll();
      setAvailableUsers(users || []);
    } catch (error) {
      console.error(error);
    }
  }, [userServices]);

  useEffect(() => {
    if (session?.user?.organizationId) {
      setOrganizationId(session?.user?.organizationId);
    }
  }, [session]);

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationData();
      fetchAvailableUsers();
    }
  }, [organizationId]);

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

  // Edit Member
  const handleEditMember = (member: any) => {
    setCurrentMemberId(member.id);
    editMemberForm.setFieldsValue({
      role: member.role,
      apiKeys: member.apiKeys,
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

  // Invite User
  const handleInvite = () => {
    if (!organization) {
      showMessage("error", "Fail to load data");
      return;
    }
    if (members.length >= (organization?.maxUserAccess || 0)) {
      showMessage("error", "Max user access reached");
      return;
    }
    inviteForm.resetFields();
    setIsInviteModalOpen(true);
  };

  const onInviteFinish = async (values: any) => {
    if (!organizationId) return;
    try {
      await organizationService.invite({
        ...values,
        organizationId: organizationId,
      });
      setIsInviteModalOpen(false);
      showMessage("success", "Invitation sent successfully");
    } catch (error: any) {
      console.error("Debug Error:", error);
      // 1. ดึง message จากหลายๆ แหล่งที่เป็นไปได้
      let msg =
        error?.response?.data?.message || // กรณี Standard Axios
        error?.response?.data?.error || // บางที error text อยู่ใน field error
        error?.message || // กรณี Axios General Error หรือถูก Unwrapped แล้ว
        "Failed to invite user";

      // 2. แก้ปัญหาถ้า message เป็น Array (เช่น NestJS Class Validator)
      if (Array.isArray(msg)) {
        msg = msg.join(", ");
      }

      // 3. ถ้า msg เป็น Object (กันเหนียว) ให้แปลงเป็น String
      if (typeof msg === "object") {
        msg = JSON.stringify(msg);
      }
      showMessage("error", msg);
    }
  };

  // Remove Member
  const handleRemoveMember = async (memberId: number) => {
    try {
      await organizationMemberService.delete(memberId);
      fetchOrganizationData();
    } catch (error) {
      console.error(error);
    }
  };

  // Extra Coin
  const handleExtraCoin = () => {
    extraCoinForm.resetFields();
    setIsExtraCoinModalOpen(true);
  };

  const onExtraCoinFinish = async (values: any) => {
    if (!organizationId) return;
    try {
      await creditBalanceService.updateExtraCoin(organizationId, values);
      setIsExtraCoinModalOpen(false);
      showMessage("success", "Extra added successfully");
      fetchOrganizationData();
    } catch (error) {
      console.error(error);
      showMessage("error", "Failed to add extra");
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
      title: "Name",
      dataIndex: ["users", "fullname"],
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: ["users", "email"],
      key: "description",
    },
    {
      title: "Description",
      dataIndex: ["users", "description"],
      key: "description",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: ["users", "status"],
      key: "status",
      filters: [
        { text: "Enabled", value: "active" },
        { text: "Disabled", value: "inactive" },
      ],
      render: (status) => (
        <Tag
          color={status === "active" ? "green" : "red"}
          className="rounded-full px-3"
        >
          {status === "active" ? "Enabled" : "Unabled"}
        </Tag>
      ),
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
    // {
    //   title: "Max Token",
    //   dataIndex: "maxToken",
    //   key: "maxToken",
    //   render: (val) => val?.toLocaleString() || 0,
    // },
    // {
    //   title: "Max Images",
    //   dataIndex: "maxImages",
    //   key: "maxImages",
    //   render: (val) => val?.toLocaleString() || 0,
    // },
    {
      title: "Action",
      key: "action",
      render: (_, record) =>
        canManageMembers(organizationRole) ? (
          <Space>
            <Button type="link" onClick={() => handleEditMember(record)}>
              Edit
            </Button>
            <Popconfirm
              title="Remove Member?"
              onConfirm={() => handleRemoveMember(record.id)}
            >
              <Button type="link" danger>
                Remove
              </Button>
            </Popconfirm>
          </Space>
        ) : (
          <span className="text-gray-400">View only</span>
        ),
    },
  ];

  if (!organizationId) {
    return <div className="p-4">Please select an organization.</div>;
  }

  return (
    <div className="p-4 space-y-4 ">
      {contextHolder}
      <div>
        <Card>
          <div className=" flex justify-between">
            <div className=" flex space-x-2">
              <div className=" font-bold text-xl"> {organization?.name}</div>
              <div>
                {organization?.type === "team" ? (
                  <Tag color="orange">TEAM</Tag>
                ) : (
                  <Tag color="blue">PERSONAL</Tag>
                )}
              </div>
            </div>
            {canEditOrganization(organizationRole) && (
              <Button type="link" onClick={handleEdit}>
                Edit
              </Button>
            )}
          </div>
          <div>Created At: {organization?.createdAt}</div>

          <div className=" text-sm text-gray-500 min-h-4">
            {organization?.description}
          </div>
          {/* <Descriptions bordered column={1}>
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
        </Descriptions> */}
        </Card>
      </div>
      <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card size="small" styles={{ body: { backgroundColor: "#18181b" } }}>
          <div className=" text-[#99a1af]"> Used Total Credit : </div>
          <div className=" text-xl">
            {formatNumber(
              (organization?.subscription?.creditAllowance || 0) -
                (organization?.creditBalance?.currentCycleBalance || 0),
            )}
            : {formatNumber(organization?.subscription?.creditAllowance || 0)}
          </div>
        </Card>
        <Card size="small" styles={{ body: { backgroundColor: "#18181b" } }}>
          <div className=" text-[#99a1af]">Used Total Image : </div>
          <div className=" text-xl">
            {formatNumber(
              (organization?.subscription?.imageAllowance || 0) -
                (organization?.creditBalance?.currentCycleImage || 0),
            )}
            : {formatNumber(organization?.subscription?.imageAllowance || 0)}
          </div>
        </Card>
        <Card size="small" styles={{ body: { backgroundColor: "#18181b" } }}>
          <div className=" text-[#99a1af]">Extra Credit : </div>
          <div className=" text-xl">
            {formatNumber(organization?.creditBalance?.onTopBalance || 0)}
          </div>
        </Card>
        <Card size="small" styles={{ body: { backgroundColor: "#18181b" } }}>
          <div className=" text-[#99a1af]">Extra Image : </div>
          <div className=" text-xl">
            {formatNumber(organization?.creditBalance?.onTopImage || 0)}
          </div>
        </Card>
        <Card size="small" styles={{ body: { backgroundColor: "#18181b" } }}>
          <div className=" text-[#99a1af]">Total Users : </div>
          <div className=" text-xl">
            {members.length || 0}/{organization?.maxUserAccess || 0}
          </div>
        </Card>
      </div>
      <Card
        title="Members"
        className="mt-4"
        extra={
          canManageMembers(organizationRole) && (
            <Space>
              <Button
                type="primary"
                icon={<PlusCircleOutlined className="text-orange-500" />}
                onClick={handleExtraCoin}
              >
                Add Extra
              </Button>
              <Button type="primary" onClick={handleInvite}>
                Invite User
              </Button>
            </Space>
          )
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

      {/* Edit Member Modal */}
      <Modal
        title="Edit Member"
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
          {/* <Form.Item name="maxToken" label="Max Token">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="maxImages" label="Max Images">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item> */}
          <Form.Item name="apiKeys" label="API Keys">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Invite User Modal */}
      <Modal
        title={<div className="text-lg font-bold">Invite User</div>}
        open={isInviteModalOpen}
        onCancel={() => setIsInviteModalOpen(false)}
        footer={null}
        width={600}
      >
        <div className="pt-4">
          <div className="mb-4 font-bold text-base">User Information</div>
          <Form form={inviteForm} onFinish={onInviteFinish} layout="vertical">
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please input email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
                className="col-span-1"
              >
                <Input placeholder="name@company.com" />
              </Form.Item>
              <Form.Item
                name="role"
                label={
                  <span>
                    Role <span className="text-red-500">*</span>
                  </span>
                }
                rules={[{ required: true, message: "Please select a role!" }]}
                initialValue="MEMBER"
                className="col-span-1"
              >
                <Select placeholder="Select role">
                  <Select.Option value="ADMIN">ADMIN</Select.Option>
                  <Select.Option value="MEMBER">MEMBER</Select.Option>
                  <Select.Option value="VIEWER">VIEWER</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <div className="text-gray-400 text-sm mb-6">
              {`We will send an invitation link to the user's email address.`}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <Button
                onClick={() => setIsInviteModalOpen(false)}
                className="h-10 px-6"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={() => inviteForm.submit()}
                className="h-10 px-6 bg-[#1f2937] hover:bg-[#374151] text-white border-none"
              >
                Confirm
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
      {/* Extra Coin Modal */}
      <Modal
        title={<div className="text-lg font-bold">Add Extra</div>}
        open={isExtraCoinModalOpen}
        onCancel={() => setIsExtraCoinModalOpen(false)}
        onOk={() => extraCoinForm.submit()}
      >
        <Form
          form={extraCoinForm}
          onFinish={onExtraCoinFinish}
          layout="vertical"
          className="pt-4"
        >
          <Form.Item name="onTopBalance" label="On Top Balance">
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter balance"
            />
          </Form.Item>
          <Form.Item name="onTopImage" label="On Top Image">
            <InputNumber style={{ width: "100%" }} placeholder="Enter images" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
