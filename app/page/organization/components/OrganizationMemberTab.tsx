import React, { useState } from "react";
import {
  Button,
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
import { PlusCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { TUser } from "@/app/common/user.type";
import { IOrganization } from "@/app/common/organization.type";
import OrganizationMembersServices from "@/app/services/organization-members.service";
import OrganizationService from "@/app/services/organization.service";
import CreditBalanceServices from "@/app/services/credit-balance.service";
import { axiosUser } from "@/app/lib/axios/axios";
import { canManageMembers } from "@/app/utils/permissions";
import { useOrganization } from "@/app/context/OrganizationContext";
import SectionEmptyState from "./SectionEmptyState";

interface OrganizationMemberTabProps {
  organizationId: string;
  organization: IOrganization | undefined;
  members: any[];
  availableUsers: TUser[];
  loading: boolean;
  onRefresh: () => void;
}

const OrganizationMemberTab: React.FC<OrganizationMemberTabProps> = ({
  organizationId,
  organization,
  members,
  availableUsers,
  loading,
  onRefresh,
}) => {
  const { organizationRole } = useOrganization();
  const [messageApi, contextHolder] = message.useMessage();
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isExtraCoinModalOpen, setIsExtraCoinModalOpen] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState<number | null>(null);

  const [editMemberForm] = Form.useForm();
  const [inviteForm] = Form.useForm();
  const [extraCoinForm] = Form.useForm();

  const organizationMemberService = OrganizationMembersServices(axiosUser);
  const organizationService = OrganizationService(axiosUser);
  const creditBalanceService = CreditBalanceServices(axiosUser);

  const canManage = canManageMembers(organizationRole);

  const showMessage = (
    type: "error" | "success" | "warning" | "loading",
    content: string,
  ) => {
    messageApi.open({
      type: type,
      content: content,
    });
  };

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
      onRefresh();
    } catch (error) {
      console.error(error);
    }
  };

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
    try {
      await organizationService.invite({
        ...values,
        organizationId: organizationId,
      });
      setIsInviteModalOpen(false);
      showMessage("success", "Invitation sent successfully");
      onRefresh();
    } catch (error: any) {
      let msg = error?.response?.data?.message || "Failed to invite user";
      if (Array.isArray(msg)) msg = msg.join(", ");
      showMessage("error", msg);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      await organizationMemberService.delete(memberId);
      onRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleExtraCoin = () => {
    extraCoinForm.resetFields();
    setIsExtraCoinModalOpen(true);
  };

  const onExtraCoinFinish = async (values: any) => {
    try {
      await creditBalanceService.updateExtraCoin(organizationId, values);
      setIsExtraCoinModalOpen(false);
      showMessage("success", "Extra added successfully");
      onRefresh();
    } catch (error) {
      console.error(error);
      showMessage("error", "Failed to add extra");
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "User",
      dataIndex: "userId",
      key: "userId",
      render: (userId) => {
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
      key: "email",
    },
    {
      title: "Status",
      dataIndex: ["users", "status"],
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"} className="rounded-full px-3">
          {status === "active" ? "Enabled" : "Disabled"}
        </Tag>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color={role === "OWNER" ? "gold" : "blue"}>{role}</Tag>,
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
      render: (_, record) =>
        canManage ? (
          <Space>
            <Button type="link" onClick={() => handleEditMember(record)}>
              Edit
            </Button>
            <Popconfirm title="Remove Member?" onConfirm={() => handleRemoveMember(record.id)}>
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

  const getUserById = (userId: string) =>
    availableUsers.find((user) => user.userId === userId);

  return (
    <div className="space-y-4">
      {contextHolder}
      {canManage && (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:justify-end sm:space-x-2 sm:gap-0">
          {/* <Button
            type="primary"
            icon={<PlusCircleOutlined className="text-orange-500" />}
            onClick={handleExtraCoin}
          >
            Add Extra
          </Button> */}
          <Button type="primary" onClick={handleInvite} className="w-full sm:w-auto">
            Invite User
          </Button>
        </div>
      )}

      <div className="hidden md:block">
        <Table
          dataSource={members}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <SectionEmptyState
                title="No members found"
                description="Invite users to start collaborating in this organization."
                className="border-0 bg-transparent px-0 py-6"
              />
            ),
          }}
        />
      </div>

      <div className="space-y-3 md:hidden">
        {members.length === 0 ? (
          <SectionEmptyState
            title="No members found"
            description="Invite users to start collaborating in this organization."
          />
        ) : (
          members.map((member) => {
            const user = getUserById(member.userId);

            return (
              <div
                key={member.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="shrink-0">{user?.fullname?.[0] || "U"}</Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-white">
                      {user?.fullname || member.userId}
                    </div>
                    <div className="truncate text-sm text-gray-400">
                      {member?.users?.email || "-"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <div className="text-gray-400">Status</div>
                    <div className="mt-1">
                      <Tag
                        color={member?.users?.status === "active" ? "green" : "red"}
                        className="rounded-full px-3"
                      >
                        {member?.users?.status === "active" ? "Enabled" : "Disabled"}
                      </Tag>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Role</div>
                    <div className="mt-1">
                      <Tag color={member.role === "OWNER" ? "gold" : "blue"}>
                        {member.role}
                      </Tag>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-gray-400">Joined At</div>
                    <div className="mt-1 text-white">
                      {member.joinedAt
                        ? new Date(member.joinedAt).toLocaleDateString()
                        : "-"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {canManage ? (
                    <>
                      <Button type="link" className="px-0" onClick={() => handleEditMember(member)}>
                        Edit
                      </Button>
                      <Popconfirm
                        title="Remove Member?"
                        onConfirm={() => handleRemoveMember(member.id)}
                      >
                        <Button type="link" danger className="px-0">
                          Remove
                        </Button>
                      </Popconfirm>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">View only</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Member Modal */}
      <Modal
        title="Edit Member"
        open={isEditMemberModalOpen}
        onCancel={() => setIsEditMemberModalOpen(false)}
        onOk={() => editMemberForm.submit()}
        width={600}
      >
        <Form form={editMemberForm} onFinish={onEditMemberFinish} layout="vertical">
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="OWNER">OWNER</Select.Option>
              <Select.Option value="ADMIN">ADMIN</Select.Option>
              <Select.Option value="MEMBER">MEMBER</Select.Option>
              <Select.Option value="VIEWER">VIEWER</Select.Option>
            </Select>
          </Form.Item>
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
        styles={{
          body: {
            maxHeight: "calc(100vh - 180px)",
            overflowY: "auto",
          },
        }}
      >
        <div className="pt-4">
          <Form form={inviteForm} onFinish={onInviteFinish} layout="vertical">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please input email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input placeholder="name@company.com" />
              </Form.Item>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Please select a role!" }]}
                initialValue="MEMBER"
              >
                <Select>
                  <Select.Option value="ADMIN">ADMIN</Select.Option>
                  <Select.Option value="MEMBER">MEMBER</Select.Option>
                  <Select.Option value="VIEWER">VIEWER</Select.Option>
                </Select>
              </Form.Item>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end sm:space-x-2 sm:gap-0">
              <Button onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Confirm
              </Button>
            </div>
          </Form>
        </div>
      </Modal>

      {/* Extra Coin Modal */}
      <Modal
        title="Add Extra"
        open={isExtraCoinModalOpen}
        onCancel={() => setIsExtraCoinModalOpen(false)}
        onOk={() => extraCoinForm.submit()}
        width={600}
      >
        <Form form={extraCoinForm} onFinish={onExtraCoinFinish} layout="vertical" className="pt-4">
          <Form.Item name="onTopBalance" label="On Top Balance">
            <InputNumber style={{ width: "100%" }} placeholder="Enter balance" />
          </Form.Item>
          <Form.Item name="onTopImage" label="On Top Image">
            <InputNumber style={{ width: "100%" }} placeholder="Enter images" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrganizationMemberTab;
