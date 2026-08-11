"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Empty,
  Flex,
  Popconfirm,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { KeyRound, Plug, Unplug } from "lucide-react";
import { axiosUser } from "@/app/lib/axios/axios";
import SocialAccountServices from "@/app/services/social-account.service";
import {
  PLATFORM_LABELS,
  SOCIAL_PLATFORMS,
  SocialAccount,
  SocialPlatform,
} from "@/app/common/activity-share.type";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import PlatformIcon from "./platform-icon";
import ManualTokenModal from "./manual-token-modal";

interface ConnectionsProps {
  organizationId: string;
  userId: string;
  /** SUPER_ADMIN เท่านั้นที่วาง token เองได้ */
  isSuperAdmin: boolean;
  /** แจ้ง parent ว่ารายการบัญชีเปลี่ยน เพื่อให้ wizard เห็นบัญชีใหม่ */
  onAccountsChanged?: (accounts: SocialAccount[]) => void;
}

/**
 * หน้าจัดการบัญชี social ของ organization
 *
 * สิทธิ์แบ่งสองระดับ: OWNER/ADMIN ของ org กด Connect/Disconnect ผ่าน OAuth ได้,
 * ส่วน SUPER_ADMIN เพิ่มเติมคือวาง token เองได้ (ทางสำรองระหว่างรอ app review)
 *
 * การเชื่อมบัญชีเปิดเป็น popup แล้วรอ popup ปิดเอง — ไม่ใช้ postMessage เพราะ
 * หน้า callback อยู่คนละ origin (backend) จึงส่ง message ข้ามมาไม่ได้
 */
const Connections: React.FC<ConnectionsProps> = ({
  organizationId,
  userId,
  isSuperAdmin,
  onAccountsChanged,
}) => {
  const { mode } = useThemeMode();
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);
  const socialAccountServices = useMemo(
    () => SocialAccountServices(axiosUser),
    []
  );
  const [messageApi, contextHolder] = message.useMessage();

  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [connectingPlatform, setConnectingPlatform] =
    useState<SocialPlatform | null>(null);
  /** เปิดฟอร์มวาง token เอง — เก็บ platform ที่กดมาและบัญชีที่กำลังแก้ */
  const [manualForm, setManualForm] = useState<{
    platform: SocialPlatform;
    editing: SocialAccount | null;
  } | null>(null);

  const fetchAccounts = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const data = await socialAccountServices.findMany(organizationId);
      setAccounts(data);
      onAccountsChanged?.(data);
    } catch (error) {
      console.error("Failed to load social accounts:", error);
      messageApi.error("Could not load connected accounts");
    } finally {
      setLoading(false);
    }
  }, [organizationId, socialAccountServices, messageApi, onAccountsChanged]);

  useEffect(() => {
    fetchAccounts();
  }, [organizationId]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * เปิดหน้า consent ของ platform ใน popup แล้ว refresh รายการเมื่อ popup ปิด
   *
   * @param platform platform ที่จะเชื่อม
   */
  const handleConnect = useCallback(
    async (platform: SocialPlatform) => {
      setConnectingPlatform(platform);
      try {
        const { authorizeUrl } = await socialAccountServices.getConnectUrl(
          platform,
          organizationId,
          userId
        );
        const popup = window.open(
          authorizeUrl,
          "social-connect",
          "width=680,height=760"
        );
        if (!popup) {
          messageApi.warning("Allow pop-ups to connect an account");
          setConnectingPlatform(null);
          return;
        }
        // ไม่มีทางรับ event ข้าม origin ได้ จึง poll ว่า popup ปิดหรือยัง
        const timer = window.setInterval(() => {
          if (popup.closed) {
            window.clearInterval(timer);
            setConnectingPlatform(null);
            fetchAccounts();
          }
        }, 800);
      } catch (error) {
        console.error("Failed to start OAuth flow:", error);
        messageApi.error(
          `Could not start the ${PLATFORM_LABELS[platform]} connection`
        );
        setConnectingPlatform(null);
      }
    },
    [organizationId, userId, socialAccountServices, messageApi, fetchAccounts]
  );

  const handleDisconnect = useCallback(
    async (account: SocialAccount) => {
      try {
        await socialAccountServices.disconnect(account.id, userId);
        messageApi.success(`Disconnected ${account.displayName}`);
        fetchAccounts();
      } catch (error) {
        console.error("Failed to disconnect account:", error);
        messageApi.error("Could not disconnect the account");
      }
    },
    [socialAccountServices, userId, messageApi, fetchAccounts]
  );

  /** จัดกลุ่มบัญชีตาม platform เพื่อแสดงเป็นการ์ดต่อ platform */
  const accountsByPlatform = useMemo(() => {
    const grouped = new Map<SocialPlatform, SocialAccount[]>();
    for (const platform of SOCIAL_PLATFORMS) grouped.set(platform, []);
    for (const account of accounts) {
      grouped.get(account.platform)?.push(account);
    }
    return grouped;
  }, [accounts]);

  const hasExpired = accounts.some((account) => account.status === "EXPIRED");

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ padding: 48 }}>
        <Spin />
      </Flex>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      {contextHolder}

      {hasExpired && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Some accounts need to be reconnected"
          description="Their access expired and could not be refreshed automatically. Posts to these accounts will fail until you reconnect them."
        />
      )}

      <Flex vertical gap={16}>
        {SOCIAL_PLATFORMS.map((platform) => {
          const platformAccounts = accountsByPlatform.get(platform) ?? [];
          return (
            <Card
              key={platform}
              size="small"
              styles={{ body: { padding: 16 } }}
              style={{ background: semantic.colorBgContainer }}
            >
              <Flex align="center" justify="space-between" wrap gap={12}>
                <Flex align="center" gap={12}>
                  <PlatformIcon platform={platform} />
                  <div>
                    <Typography.Text strong>
                      {PLATFORM_LABELS[platform]}
                    </Typography.Text>
                    <div>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {platformAccounts.length === 0
                          ? "No account connected"
                          : `${platformAccounts.length} account(s) connected`}
                      </Typography.Text>
                    </div>
                  </div>
                </Flex>

                <Flex gap={8} wrap>
                  {/* วาง token เองเป็นทางสำรองระหว่างที่ app review ยังไม่ผ่าน */}
                  {isSuperAdmin && (
                    <Button
                      icon={<KeyRound size={15} />}
                      onClick={() => setManualForm({ platform, editing: null })}
                    >
                      Configure token
                    </Button>
                  )}
                  <Button
                    type="primary"
                    icon={<Plug size={15} />}
                    loading={connectingPlatform === platform}
                    onClick={() => handleConnect(platform)}
                  >
                    Connect
                  </Button>
                </Flex>
              </Flex>

              {platformAccounts.length > 0 && (
                <Flex vertical gap={8} style={{ marginTop: 14 }}>
                  {platformAccounts.map((account) => (
                    <Flex
                      key={account.id}
                      align="center"
                      justify="space-between"
                      gap={12}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: `1px solid ${semantic.colorBorderSecondary}`,
                      }}
                    >
                      <Flex align="center" gap={10}>
                        <Avatar src={account.avatarUrl ?? undefined} size={28}>
                          {account.displayName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography.Text>{account.displayName}</Typography.Text>
                        {account.status === "EXPIRED" ? (
                          <Tag color="warning">Reconnect needed</Tag>
                        ) : (
                          <Tag color="green">Active</Tag>
                        )}
                        {account.connectionType === "MANUAL" && (
                          <Tooltip title="Token was entered by a system administrator, not through the platform's consent flow">
                            <Tag>Manual</Tag>
                          </Tooltip>
                        )}
                      </Flex>

                      <Flex gap={8}>
                        {isSuperAdmin && account.connectionType === "MANUAL" && (
                          <Button
                            size="small"
                            icon={<KeyRound size={14} />}
                            onClick={() =>
                              setManualForm({
                                platform: account.platform,
                                editing: account,
                              })
                            }
                          >
                            Edit token
                          </Button>
                        )}
                        <Popconfirm
                          title="Disconnect this account?"
                          description="Scheduled and pending posts to this account will fail."
                          okText="Disconnect"
                          okButtonProps={{ danger: true }}
                          onConfirm={() => handleDisconnect(account)}
                        >
                          <Button size="small" danger icon={<Unplug size={14} />}>
                            Disconnect
                          </Button>
                        </Popconfirm>
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              )}
            </Card>
          );
        })}
      </Flex>

      {accounts.length === 0 && (
        <Empty
          style={{ marginTop: 24 }}
          description="Connect at least one account before creating a share task"
        />
      )}

      <ManualTokenModal
        open={Boolean(manualForm)}
        organizationId={organizationId}
        userId={userId}
        editing={manualForm?.editing ?? null}
        presetPlatform={manualForm?.platform}
        onClose={() => setManualForm(null)}
        onSaved={() => {
          messageApi.success("Token saved and verified");
          fetchAccounts();
        }}
      />
    </div>
  );
};

export default Connections;
