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
} from "antd";
import { useCallback } from "react";
import { useOrganization } from "@/app/context/OrganizationContext";
import OrganizationService from "@/app/services/organization.service";
import OrganizationMembersServices from "@/app/services/organization-members.service";
import { axiosUser } from "@/app/lib/axios/axios";
import { IOrganization } from "@/app/common/organization.type";
import UserServices from "@/app/services/users.service";
import { TUser } from "@/app/common/user.type";
import { formatNumber } from "@/app/utils/format";
import { canEditOrganization } from "@/app/utils/permissions";
import { useSession } from "next-auth/react";
import OrganizationMemberTab from "./components/OrganizationMemberTab";
import OrganizationPackageTab from "./components/OrganizationPackageTab";
import OrganizationInvitationTab from "./components/OrganizationInvitationTab";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";

export default function OrganizationDetailPage() {
  const { data: session } = useSession();
  const [, contextHolder] = message.useMessage();
  const { organizationRole } = useOrganization();
  const [organization, setOrganization] = useState<IOrganization>();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const { mode } = useThemeMode();
  const semantic = getThemeConfig(mode).token ?? {};

  // Forms
  const [editForm] = Form.useForm();

  // Services
  const organizationService = OrganizationService(axiosUser);
  const organizationMemberService = OrganizationMembersServices(axiosUser);
  const userServices = UserServices(axiosUser);

  // Data
  const [availableUsers, setAvailableUsers] = useState<TUser[]>([]);

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
        <OrganizationInvitationTab
          organizationId={organizationId}
          canManage={canEditOrganization(organizationRole)}
        />
      ),
    },
  ];

  const summaryCardStyle = {
    borderRadius: 16,
    overflow: "hidden" as const,
  };

  const summaryCardStyles = {
    body: {
      backgroundColor: semantic.colorBgContainer,
      borderRadius: 16,
    },
  };

  return (
    <div className="space-y-4 p-3 sm:p-4">
      {contextHolder}
      <div>
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="break-words text-xl font-bold">
                {organization?.name}
              </div>
              <div>
                {organization?.type === "team" ? (
                  <Tag color="orange">TEAM</Tag>
                ) : (
                  <Tag color="blue">PERSONAL</Tag>
                )}
              </div>
            </div>
            {canEditOrganization(organizationRole) && (
              <Button
                type="link"
                onClick={handleEdit}
                className="self-start px-0 sm:px-4"
              >
                Edit
              </Button>
            )}
          </div>
          <div className="break-words text-sm sm:text-base">
            Created At: {organization?.createdAt}
          </div>
          <div className="min-h-4 break-words text-sm text-gray-500">
            {organization?.description}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card
          size="small"
          style={summaryCardStyle}
          styles={summaryCardStyles}
          className="h-full"
        >
          <div
            style={{ color: semantic.colorTextBase }}
            className="text-sm sm:text-base"
          >
            Used Total Credit :
          </div>
          <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-end sm:gap-2">
            <div className="break-all text-lg sm:text-xl">
              {formatNumber(
                (organization?.subscription?.creditAllowance || 0) -
                  (organization?.creditBalance?.currentCycleBalance || 0),
              )}
              / {formatNumber(organization?.subscription?.creditAllowance || 0)}
            </div>
          </div>
        </Card>
        <Card
          size="small"
          style={summaryCardStyle}
          styles={summaryCardStyles}
          className="h-full"
        >
          <div
            style={{ color: semantic.colorTextBase }}
            className="text-sm sm:text-base"
          >
            On Top Credit :
          </div>
          <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-end sm:gap-2">
            <div className="break-all text-lg sm:text-xl">
              + {formatNumber(organization?.creditBalance?.onTopBalance || 0)}
            </div>
          </div>
        </Card>
        <Card
          size="small"
          style={summaryCardStyle}
          styles={summaryCardStyles}
          className="h-full"
        >
          <div
            style={{ color: semantic.colorTextBase }}
            className="text-sm sm:text-base"
          >
            Total Users :
          </div>
          <div className="break-all text-lg sm:text-xl">
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
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
