"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Switch,
  Tabs,
  Checkbox,
} from "antd";
import OrganizationService from "@/app/services/organization.service";
import OrganizationMembersServices from "@/app/services/organization-members.service";
import UserServices from "@/app/services/users.service";
import { axiosUser } from "@/app/lib/axios/axios";
import { IOrganization } from "@/app/common/organization.type";
import { TUser } from "@/app/common/user.type";
import { formatNumber } from "@/app/utils/format";
import { useParams } from "next/navigation";
import OrganizationMemberTab from "./components/OrganizationMemberTab";
import OrganizationPackageTab from "./components/OrganizationPackageTab";
import OrganizationInvitationTab from "./components/OrganizationInvitationTab";

export default function OrganizationDetailPage() {
  const [, contextHolder] = message.useMessage();
  const { id } = useParams();
  const organizationId = String(id);
  const ACCESS_CODE: { label: string; value: string; className: string }[] = [
    { label: "Image", value: "image", className: "label-1" },
    { label: "Video", value: "video", className: "label-2" },
    { label: "Omnihuman", value: "omni", className: "label-3" },
    { label: "Dream Actor", value: "dream", className: "label-4" },
    { label: "Workflow", value: "workflow", className: "label-5" },
    { label: "Editor", value: "editor", className: "label-6" },
    { label: "Social Media", value: "social", className: "label-7" },
    { label: "Photo Event", value: "photo_event", className: "label-8" },
    { label: "Audio", value: "audio", className: "label-9" },
  ];
  const [organization, setOrganization] = useState<IOrganization>();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Forms
  const [editForm] = Form.useForm();

  // Services
  const organizationService = OrganizationService(axiosUser);
  const organizationMemberService = OrganizationMembersServices(axiosUser);
  const userServices = UserServices(axiosUser);

  // Data
  const [availableUsers, setAvailableUsers] = useState<TUser[]>([]);

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

      const membersData =
        await organizationMemberService.findByOrganization(organizationId);
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
      status: organization?.status,
      accessCodes: organization?.accessCodes,
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

  if (!organizationId) {
    return <div className="p-4">Please select an organization.</div>;
  }

  const items = [
    {
      key: "members",
      label: "Member",
      children: (
        <OrganizationMemberTab
          organizationId={organizationId}
          organization={organization}
          members={members}
          availableUsers={availableUsers}
          loading={loading}
          onRefresh={fetchOrganizationData}
        />
      ),
    },
    {
      key: "package",
      label: "Package",
      children: <OrganizationPackageTab organizationId={organizationId} />,
    },
    {
      key: "invitations",
      label: "Invitations",
      children: (
        <OrganizationInvitationTab organizationId={organizationId} canManage />
      ),
    },
  ];

  const creditAllowance = organization?.subscription?.creditAllowance || 0;
  const cycleBalance = organization?.creditBalance?.currentCycleBalance || 0;

  return (
    <div className="p-4 space-y-4">
      {contextHolder}
      <div>
        <Card>
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <div className="font-bold text-xl">{organization?.name}</div>
              <div>
                {organization?.type === "team" ? (
                  <Tag color="orange">TEAM</Tag>
                ) : (
                  <Tag color="blue">PERSONAL</Tag>
                )}
              </div>
            </div>
            <Button type="link" onClick={handleEdit}>
              Edit
            </Button>
          </div>
          <div>Created At: {organization?.createdAt}</div>
          <div className="text-sm text-[var(--legacy-gray-500)] min-h-4">
            {organization?.description}
          </div>
        </Card>
      </div>

      <div className="grid sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
        <Card size="small" styles={{ body: { backgroundColor: "var(--legacy-surface-18181b)" } }}>
          {/* creditAllowance < balance when credit was granted outside the plan (e.g. event orgs, allowance 0 = expiry) */}
          {creditAllowance >= cycleBalance ? (
            <>
              <div className="text-[var(--legacy-99a1af)]">Used Total Credit :</div>
              <div className="text-xl">
                {formatNumber(creditAllowance - cycleBalance)}/{" "}
                {formatNumber(creditAllowance)}
              </div>
            </>
          ) : (
            <>
              <div className="text-[var(--legacy-99a1af)]">Remaining Credit :</div>
              <div className="text-xl">{formatNumber(cycleBalance)}</div>
            </>
          )}
        </Card>
        <Card size="small" styles={{ body: { backgroundColor: "var(--legacy-surface-18181b)" } }}>
          <div className="text-[var(--legacy-99a1af)]">On Top Credit :</div>
          <div className="flex">
            <div className="text-xl">
              + {formatNumber(organization?.creditBalance?.onTopBalance || 0)}
            </div>
          </div>
        </Card>
        <Card size="small" styles={{ body: { backgroundColor: "var(--legacy-surface-18181b)" } }}>
          <div className="text-[var(--legacy-99a1af)]">Total Users :</div>
          <div className="text-xl">
            {members.length || 0}/{organization?.maxUserAccess || 0}
          </div>
        </Card>
      </div>

      <Card>
        <Tabs defaultActiveKey="members" items={items} />
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
          <Form.Item name="status" label="Status" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="accessCodes" label="Access">
            <Checkbox.Group options={ACCESS_CODE} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
