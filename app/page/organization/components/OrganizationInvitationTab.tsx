import React, { useCallback, useEffect, useState } from "react";
import { Button, Popconfirm, Space, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { IOrganizationInvitation } from "@/app/common/organization.type";
import OrganizationService from "@/app/services/organization.service";
import { axiosUser } from "@/app/lib/axios/axios";
import SectionEmptyState from "./SectionEmptyState";
import dayjs from "dayjs";

interface OrganizationInvitationTabProps {
  organizationId: string;
  /** When false, action column is hidden. Defaults to true. */
  canManage?: boolean;
}

const STATUS_COLOR: Record<IOrganizationInvitation["status"], string> = {
  pending: "orange",
  accepted: "green",
  expired: "default",
  cancelled: "red",
};

const OrganizationInvitationTab: React.FC<OrganizationInvitationTabProps> = ({
  organizationId,
  canManage = true,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [invitations, setInvitations] = useState<IOrganizationInvitation[]>([]);
  const [loading, setLoading] = useState(false);

  const organizationService = OrganizationService(axiosUser);

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const data =
        await organizationService.findInvitationsByOrganization(organizationId);
      setInvitations(data);
    } catch {
      messageApi.error("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleCancel = async (id: string) => {
    try {
      await organizationService.cancelInvitation(id);
      messageApi.success("Invitation cancelled");
      fetchInvitations();
    } catch {
      messageApi.error("Failed to cancel invitation");
    }
  };

  const columns: ColumnsType<IOrganizationInvitation> = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: IOrganizationInvitation["status"]) => (
        <Tag color={STATUS_COLOR[status]} className="capitalize">
          {status}
        </Tag>
      ),
    },
    {
      title: "Invited At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => dayjs(v).format("YYYY-MM-DD HH:mm") || "",
    },
    {
      title: "Expires At",
      dataIndex: "expiredAt",
      key: "expiredAt",
      render: (v) => dayjs(v).format("YYYY-MM-DD HH:mm") || "",
    },
    ...(canManage
      ? [
          {
            title: "Action",
            key: "action",
            render: (_: unknown, record: IOrganizationInvitation) =>
              record.status === "pending" ? (
                <Popconfirm
                  title="Cancel this invitation?"
                  onConfirm={() => handleCancel(record.id)}
                >
                  <Button type="link" danger size="small">
                    Cancel
                  </Button>
                </Popconfirm>
              ) : (
                <span className="text-gray-400 text-sm">-</span>
              ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      {contextHolder}

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table
          dataSource={invitations}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <SectionEmptyState
                title="No invitations found"
                description="Invite users from the Members tab to see them here."
                className="border-0 bg-transparent px-0 py-6"
              />
            ),
          }}
        />
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {invitations.length === 0 && !loading ? (
          <SectionEmptyState
            title="No invitations found"
            description="Invite users from the Members tab to see them here."
          />
        ) : (
          invitations.map((inv) => (
            <div
              key={inv.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-medium">{inv.email}</div>
                  <Space size={4} className="mt-1 flex-wrap">
                    <Tag color="blue">{inv.role}</Tag>
                    <Tag
                      color={STATUS_COLOR[inv.status]}
                      className="capitalize"
                    >
                      {inv.status}
                    </Tag>
                  </Space>
                </div>
                {canManage && inv.status === "pending" && (
                  <Popconfirm
                    title="Cancel this invitation?"
                    onConfirm={() => handleCancel(inv.id)}
                  >
                    <Button
                      type="link"
                      danger
                      size="small"
                      className="shrink-0 px-0"
                    >
                      Cancel
                    </Button>
                  </Popconfirm>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-400">
                <div>
                  <div>Invited At</div>
                  <div className="text-white">
                    {dayjs(inv.createdAt).format("YYYY-MM-DD HH:mm") || "-"}
                  </div>
                </div>
                <div>
                  <div>Expires At</div>
                  <div className="text-white">
                    {inv.expiredAt
                      ? dayjs(inv.expiredAt).format("YYYY-MM-DD HH:mm")
                      : "-"}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrganizationInvitationTab;
