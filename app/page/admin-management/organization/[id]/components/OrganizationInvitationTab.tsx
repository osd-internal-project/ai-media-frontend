import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Popconfirm, Segmented, Space, Table, message, theme } from "antd";
import type { ColumnsType } from "antd/es/table";
import { IOrganizationInvitation } from "@/app/common/organization.type";
import OrganizationService from "@/app/services/organization.service";
import { axiosUser } from "@/app/lib/axios/axios";
import SectionEmptyState from "./SectionEmptyState";
import dayjs from "dayjs";
import { StatusTag, StatusTone } from "../../../components/admin-ui";

interface OrganizationInvitationTabProps {
  organizationId: string;
  /** When false, action column is hidden. Defaults to true. */
  canManage?: boolean;
}

type InvitationState = "pending" | "expired" | "accepted" | "cancelled";

const STATE_TONE: Record<InvitationState, StatusTone> = {
  pending: "warning",
  expired: "neutral",
  accepted: "success",
  cancelled: "error",
};

const STATE_LABEL: Record<InvitationState, string> = {
  pending: "Pending",
  expired: "Expired",
  accepted: "Accepted",
  cancelled: "Cancelled",
};

/** PENDING ที่เลยวันหมดอายุ = หมดอายุ (backend ไม่ได้เปลี่ยนสถานะให้เอง และไม่นับ seat แล้ว) */
const stateOf = (invitation: IOrganizationInvitation): InvitationState => {
  const status = invitation.status?.toLowerCase();
  if (status === "pending") {
    return dayjs(invitation.expiresAt).isBefore(dayjs()) ? "expired" : "pending";
  }
  return (["accepted", "cancelled", "expired"] as const).find((value) => value === status) ?? "expired";
};

const expiryText = (invitation: IOrganizationInvitation) => {
  const expiresAt = dayjs(invitation.expiresAt);
  if (!expiresAt.isValid()) return "—";
  const hours = expiresAt.diff(dayjs(), "hour");
  if (hours < 0) return `หมดอายุ ${expiresAt.format("D MMM HH:mm")}`;
  return hours < 24 ? `อีก ${Math.max(hours, 1)} ชม.` : `อีก ${Math.ceil(hours / 24)} วัน`;
};

const errorText = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

const organizationService = OrganizationService(axiosUser);

const OrganizationInvitationTab: React.FC<OrganizationInvitationTabProps> = ({
  organizationId,
  canManage = true,
}) => {
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const [invitations, setInvitations] = useState<IOrganizationInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"open" | "all">("open");
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    try {
      setInvitations(await organizationService.findInvitationsByOrganization(organizationId));
    } catch {
      messageApi.error("Could not load invitations");
    } finally {
      setLoading(false);
    }
  }, [organizationId, messageApi]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const run = async (id: string, action: () => Promise<unknown>, done: string, failed: string) => {
    setBusyId(id);
    try {
      await action();
      messageApi.success(done);
      fetchInvitations();
    } catch (error) {
      messageApi.error(errorText(error, failed));
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => {
    const states = invitations.map(stateOf);
    return {
      pending: states.filter((state) => state === "pending").length,
      expired: states.filter((state) => state === "expired").length,
    };
  }, [invitations]);

  const rows = useMemo(
    () =>
      [...invitations]
        .filter((invitation) => filter === "all" || ["pending", "expired"].includes(stateOf(invitation)))
        .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()),
    [invitations, filter],
  );

  const actions = (invitation: IOrganizationInvitation) => {
    const state = stateOf(invitation);
    // ส่งซ้ำ/ยกเลิกได้เฉพาะที่ backend ยังเป็น PENDING (รวมที่เลยวันหมดอายุ)
    if (invitation.status?.toUpperCase() !== "PENDING") return <span style={{ color: token.colorTextSecondary }}>—</span>;
    return (
      <Space size={4}>
        <Button
          size="small"
          loading={busyId === invitation.id}
          onClick={() =>
            run(
              invitation.id,
              () => organizationService.resendInvitation(invitation.id),
              `Invitation resent to ${invitation.email}`,
              "Could not resend the invitation",
            )
          }
        >
          {state === "expired" ? "Renew & resend" : "Resend"}
        </Button>
        <Popconfirm
          title="Cancel this invitation?"
          description="The link in the email stops working and the seat is freed."
          okText="Cancel invitation"
          cancelText="Keep"
          onConfirm={() =>
            run(
              invitation.id,
              () => organizationService.cancelInvitation(invitation.id),
              "Invitation cancelled",
              "Could not cancel the invitation",
            )
          }
        >
          <Button size="small" type="text" danger>
            Cancel
          </Button>
        </Popconfirm>
      </Space>
    );
  };

  const columns: ColumnsType<IOrganizationInvitation> = [
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <StatusTag tone="neutral">{role}</StatusTag>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, invitation) => {
        const state = stateOf(invitation);
        return <StatusTag tone={STATE_TONE[state]}>{STATE_LABEL[state]}</StatusTag>;
      },
    },
    {
      title: "Invited",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => <span className="tabular-nums">{dayjs(value).format("D MMM YYYY HH:mm")}</span>,
    },
    {
      title: "Expires",
      key: "expiresAt",
      render: (_, invitation) =>
        stateOf(invitation) === "pending" || stateOf(invitation) === "expired" ? (
          <span className="tabular-nums">{expiryText(invitation)}</span>
        ) : (
          <span style={{ color: token.colorTextSecondary }}>—</span>
        ),
    },
    ...(canManage
      ? [{ title: "Action", key: "action", render: (_: unknown, invitation: IOrganizationInvitation) => actions(invitation) }]
      : []),
  ];

  const empty = (
    <SectionEmptyState
      title={filter === "open" ? "No open invitations" : "No invitations yet"}
      description="Invite users from the Members tab. Pending invitations count toward the seat limit."
      className="border-0 bg-transparent px-0 py-6"
    />
  );

  return (
    <div className="space-y-3">
      {contextHolder}

      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          value={filter}
          onChange={(value) => setFilter(value as "open" | "all")}
          options={[
            { value: "open", label: `Open ${counts.pending + counts.expired}` },
            { value: "all", label: `All ${invitations.length}` },
          ]}
        />
        <span className="text-xs" style={{ color: token.colorTextSecondary }}>
          {counts.pending} pending use a seat{counts.expired ? `, ${counts.expired} expired don't` : ""}
        </span>
      </div>

      <div className="hidden md:block">
        <Table
          dataSource={rows}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
          locale={{ emptyText: empty }}
        />
      </div>

      <div className="space-y-3 md:hidden">
        {rows.length === 0 && !loading
          ? empty
          : rows.map((invitation) => {
              const state = stateOf(invitation);
              return (
                <div
                  key={invitation.id}
                  className="rounded-xl p-4"
                  style={{ border: `1px solid ${token.colorBorderSecondary}` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{invitation.email}</div>
                      <Space size={4} className="mt-1 flex-wrap">
                        <StatusTag tone="neutral">{invitation.role}</StatusTag>
                        <StatusTag tone={STATE_TONE[state]}>{STATE_LABEL[state]}</StatusTag>
                      </Space>
                    </div>
                    {canManage && actions(invitation)}
                  </div>
                  <div className="mt-2 text-sm tabular-nums" style={{ color: token.colorTextSecondary }}>
                    Invited {dayjs(invitation.createdAt).format("D MMM YYYY HH:mm")}
                    {(state === "pending" || state === "expired") && `, ${expiryText(invitation)}`}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default OrganizationInvitationTab;
