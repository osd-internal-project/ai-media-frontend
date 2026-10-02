"use client";

import { useEffect, useRef } from "react";
import { Badge, Button, Empty, Popover, Typography, notification } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { IPendingInvitation } from "@/app/common/organization.type";
import { useInvitationNotifications } from "@/app/hooks/useInvitationNotifications";

const { Text } = Typography;

const acceptUrl = (invitation: IPendingInvitation) =>
  `/accept-invite?token=${encodeURIComponent(invitation.token)}`;

const orgName = (invitation: IPendingInvitation) =>
  invitation.organizationName || "an organization";

export default function InvitationBell() {
  const router = useRouter();
  const { invitations } = useInvitationNotifications();
  const [notificationApi, contextHolder] = notification.useNotification();
  // null = ยังไม่โหลดรอบแรก — รอบแรกไม่เด้ง toast ให้คำเชิญที่ค้างอยู่เดิม
  const seenIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    const seen = seenIdsRef.current;
    seenIdsRef.current = new Set(invitations.map((invitation) => invitation.id));
    if (!seen) return;
    invitations
      .filter((invitation) => !seen.has(invitation.id))
      .forEach((invitation) =>
        notificationApi.info({
          key: invitation.id,
          message: "New organization invitation",
          description: `You were invited to join ${orgName(invitation)} as ${invitation.role}.`,
          btn: (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                notificationApi.destroy(invitation.id);
                router.push(acceptUrl(invitation));
              }}
            >
              View
            </Button>
          ),
        }),
      );
  }, [invitations, notificationApi, router]);

  const content =
    invitations.length === 0 ? (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No new notifications" />
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: 300 }}>
        {invitations.map((invitation) => (
          <Button
            key={invitation.id}
            type="text"
            onClick={() => router.push(acceptUrl(invitation))}
            style={{ height: "auto", padding: "8px 10px", textAlign: "left", whiteSpace: "normal" }}
          >
            <div>
              <Text strong>Invitation to {orgName(invitation)}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Role {invitation.role} · expires{" "}
                {new Date(invitation.expiresAt).toLocaleString()}
              </Text>
            </div>
          </Button>
        ))}
      </div>
    );

  return (
    <>
      {contextHolder}
      <Popover content={content} title="Notifications" trigger="click" placement="bottomRight">
        <Badge count={invitations.length} size="small" offset={[-4, 4]}>
          <Button type="text" shape="circle" icon={<BellOutlined />} aria-label="Notifications" />
        </Badge>
      </Popover>
    </>
  );
}
