"use client";
import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Result, Skeleton, Switch, Tabs, message, theme } from "antd";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";
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
import OrganizationEntitlementsTab from "./components/OrganizationEntitlementsTab";
import AuditHistory from "../../components/audit-history";
import { SeatBar, StatusTag } from "../../components/admin-ui";

const organizationService = OrganizationService(axiosUser);
const organizationMemberService = OrganizationMembersServices(axiosUser);
const userServices = UserServices(axiosUser);

const errorText = (error: unknown) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
  "Could not save. Check the connection and try again.";

export default function OrganizationDetailPage() {
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();
  const organizationId = String(id);
  const [organization, setOrganization] = useState<IOrganization>();
  const [loadFailed, setLoadFailed] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm] = Form.useForm();
  const [availableUsers, setAvailableUsers] = useState<TUser[]>([]);

  const fetchOrganizationData = async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const [orgData, membersData] = await Promise.all([
        organizationService.findById(organizationId),
        organizationMemberService.findByOrganization(organizationId),
      ]);
      setOrganization(orgData);
      setMembers(membersData || []);
      setLoadFailed(!orgData);
    } catch (error) {
      console.error(error);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!organizationId) return;
    fetchOrganizationData();
    userServices
      .findAll()
      .then((users) => setAvailableUsers(users || []))
      .catch((error) => console.error(error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const handleEdit = () => {
    editForm.setFieldsValue({
      name: organization?.name,
      description: organization?.description,
      status: organization?.status,
      isOpen: organization?.isOpen,
      closedMessage: organization?.closedMessage,
    });
    setIsEditModalOpen(true);
  };

  const onEditFinish = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      await organizationService.update(organizationId, values);
      messageApi.success("Organization saved");
      setIsEditModalOpen(false);
      fetchOrganizationData();
    } catch (error) {
      messageApi.error(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  if (loadFailed) {
    return (
      <Result
        status="warning"
        title="Could not load this organization"
        extra={[
          <Button key="retry" onClick={fetchOrganizationData}>Try again</Button>,
          <Link key="back" href="/page/admin-management/organization">Back to organizations</Link>,
        ]}
      />
    );
  }
  if (!organization) return <Skeleton active className="p-4" />;

  const creditAllowance = organization.subscription?.creditAllowance || 0;
  const cycleBalance = organization.creditBalance?.currentCycleBalance || 0;
  const isPersonal = organization.type?.toLowerCase() === "personal";
  const muted = { color: token.colorTextSecondary };

  const items = [
    {
      key: "members",
      label: "Members",
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
      key: "entitlements",
      label: "สิทธิ์การใช้งาน",
      children: <OrganizationEntitlementsTab organization={organization} onSaved={fetchOrganizationData} />,
    },
    {
      key: "package",
      label: "Package",
      children: <OrganizationPackageTab organizationId={organizationId} />,
    },
    {
      key: "invitations",
      label: "Invitations",
      children: <OrganizationInvitationTab organizationId={organizationId} canManage />,
    },
    {
      key: "history",
      label: "ประวัติ",
      children: <AuditHistory entityName="organization" entityId={organizationId} />,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {contextHolder}

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/page/admin-management/organization"
            aria-label="Back to organizations"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full"
            style={muted}
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-xl font-semibold" style={{ color: token.colorTextBase }}>{organization.name}</h1>
          <StatusTag tone={isPersonal ? "neutral" : "primary"}>{isPersonal ? "Personal" : "Team"}</StatusTag>
          {!organization.status && <StatusTag tone="error">Inactive</StatusTag>}
          {organization.isOpen === false && <StatusTag tone="warning">Closed</StatusTag>}
          <Button className="!ml-auto" icon={<Pencil size={14} />} onClick={handleEdit}>
            Edit
          </Button>
        </div>
        {organization.description && <p className="text-sm" style={muted}>{organization.description}</p>}
        <dl className="flex flex-wrap items-start gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="text-xs" style={muted}>Plan</dt>
            <dd style={{ color: token.colorTextBase }}>{organization.subscription?.planName ?? (isPersonal ? "Free (default)" : "No plan")}</dd>
          </div>
          <div>
            {/* creditAllowance < balance เมื่อให้ credit นอก plan (เช่น org ของ event, allowance 0 = หมดอายุ) */}
            <dt className="text-xs" style={muted}>{creditAllowance >= cycleBalance ? "Credit used this cycle" : "Credit remaining"}</dt>
            <dd className="tabular-nums" style={{ color: token.colorTextBase }}>
              {creditAllowance >= cycleBalance
                ? `${formatNumber(creditAllowance - cycleBalance)} / ${formatNumber(creditAllowance)}`
                : formatNumber(cycleBalance)}
            </dd>
          </div>
          <div>
            <dt className="text-xs" style={muted}>On-top credit</dt>
            <dd className="tabular-nums" style={{ color: token.colorTextBase }}>+ {formatNumber(organization.creditBalance?.onTopBalance || 0)}</dd>
          </div>
          <div>
            <dt className="text-xs" style={muted}>Seats</dt>
            <dd>
              <SeatBar active={organization.seatUsed ?? 0} pending={organization.seatPending ?? 0} max={organization.maxUserAccess} />
            </dd>
          </div>
          <div>
            <dt className="text-xs" style={muted}>Created</dt>
            <dd className="tabular-nums" style={{ color: token.colorTextBase }}>{dayjs(organization.createdAt).format("D MMM YYYY")}</dd>
          </div>
        </dl>
      </header>

      <Tabs defaultActiveKey="members" items={items} />

      <Modal
        title="Edit organization"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => editForm.submit()}
        okText="Save"
        confirmLoading={saving}
      >
        <Form form={editForm} onFinish={onEditFinish} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Enter a name" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item
            name="isOpen"
            label="System open"
            valuePropName="checked"
            extra="When off, members (except super admin) see only the message below."
          >
            <Switch />
          </Form.Item>
          <Form.Item name="closedMessage" label="Closed message">
            <Input.TextArea rows={2} placeholder="ระบบไม่พร้อมใช้งาน" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <p className="text-xs" style={muted}>User limit, access and AI models are on the สิทธิ์การใช้งาน tab.</p>
        </Form>
      </Modal>
    </div>
  );
}
