"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Flex,
  Segmented,
  Spin,
  Typography,
} from "antd";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { axiosCore, axiosUser } from "@/app/lib/axios/axios";
import ActivityShareServices from "@/app/services/activity-share.service";
import SocialAccountServices from "@/app/services/social-account.service";
import {
  ActivityShareDetail,
  SocialAccount,
} from "@/app/common/activity-share.type";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import { usePublicSocial } from "./usePublicSocial";
import ShareTaskList from "./share-task-list";
import ApprovalQueue from "./approval-queue";
import Connections from "./connections";
import CreateShareModal from "./create-share-modal";
import ShareTaskDetailDrawer from "./share-task-detail-drawer";

type SubView = "posts" | "approvals" | "connections";

export interface PublicSocialProps {
  /** key ของแท็บที่กำลังแสดง — ใช้ fetch เฉพาะตอนแท็บนี้ active */
  activeKey: string;
  /** gallery id ที่ส่งมาจากปุ่ม Share ในแท็บ All Activity */
  presetGalleryIds?: string[];
  /** เคลียร์ preset หลังเปิด wizard แล้ว เพื่อไม่ให้ค้างตอนเปิดครั้งถัดไป */
  onPresetConsumed?: () => void;
}

/**
 * แท็บ Public Social — ศูนย์รวมงานเผยแพร่ผลงานจาก gallery ขึ้น social
 *
 * แบ่งเป็น 3 มุมมอง: Posts (ทุกคน), Approvals (OWNER/ADMIN ของ org)
 * และ Connections (OWNER/ADMIN ของ org หรือ SUPER_ADMIN)
 */
const PublicSocial: React.FC<PublicSocialProps> = ({
  activeKey,
  presetGalleryIds,
  onPresetConsumed,
}) => {
  const params = useParams();
  const projectId = (params as { id: string }).id;
  const { mode } = useThemeMode();
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);

  const {
    userId,
    organizationId,
    isOrgAdmin,
    isSuperAdmin,
    loading: contextLoading,
  } = usePublicSocial();

  // SUPER_ADMIN เข้าถึง Connections ได้แม้ไม่ได้เป็นสมาชิกของ org นั้น —
  // ไม่งั้นทีมแพลตฟอร์มจะเปิดหน้าที่ตัวเองเป็นคนเดียวที่ใช้ได้ไม่ได้
  const canManageConnections = isOrgAdmin || isSuperAdmin;

  const activityShareServices = useMemo(
    () => ActivityShareServices(axiosCore),
    []
  );
  const socialAccountServices = useMemo(
    () => SocialAccountServices(axiosUser),
    []
  );

  const [subView, setSubView] = useState<SubView>("posts");
  const [onlyMine, setOnlyMine] = useState<boolean>(true);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [refreshToken, setRefreshToken] = useState<number>(0);

  const [wizardOpen, setWizardOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<ActivityShareDetail | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const isActive = activeKey === "social";

  const bumpRefresh = useCallback(() => setRefreshToken((n) => n + 1), []);

  /** โหลดบัญชีที่เชื่อมไว้ — wizard ต้องใช้เลือกปลายทาง */
  const fetchAccounts = useCallback(async () => {
    if (!organizationId) return;
    try {
      setAccounts(await socialAccountServices.findMany(organizationId));
    } catch (error) {
      console.error("Failed to load social accounts:", error);
    }
  }, [organizationId, socialAccountServices]);

  const fetchPendingCount = useCallback(async () => {
    if (!organizationId || !isOrgAdmin) return;
    try {
      const { count } =
        await activityShareServices.countPendingApproval(organizationId);
      setPendingCount(count);
    } catch (error) {
      console.error("Failed to load pending count:", error);
    }
  }, [organizationId, isOrgAdmin, activityShareServices]);

  useEffect(() => {
    if (!isActive || contextLoading) return;
    fetchAccounts();
    fetchPendingCount();
  }, [isActive, contextLoading, organizationId, isOrgAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  /** เปิด wizard พร้อม preselect จากแท็บ All Activity */
  useEffect(() => {
    if (isActive && presetGalleryIds && presetGalleryIds.length > 0) {
      setEditing(null);
      setWizardOpen(true);
    }
  }, [isActive, presetGalleryIds]);

  const handleEdit = useCallback(
    async (shareId: string) => {
      try {
        const detail = await activityShareServices.findOne(shareId);
        setEditing(detail);
        setWizardOpen(true);
      } catch (error) {
        console.error("Failed to load share for editing:", error);
      }
    },
    [activityShareServices]
  );

  const handleWizardClose = useCallback(() => {
    setWizardOpen(false);
    setEditing(null);
    onPresetConsumed?.();
  }, [onPresetConsumed]);

  const handleSaved = useCallback(() => {
    bumpRefresh();
    fetchPendingCount();
  }, [bumpRefresh, fetchPendingCount]);

  if (contextLoading) {
    return (
      <Flex justify="center" align="center" style={{ padding: 64 }}>
        <Spin />
      </Flex>
    );
  }

  if (!organizationId) {
    return (
      <Alert
        style={{ margin: 16 }}
        type="warning"
        showIcon
        message="No organization selected"
        description="Select an organization before using Public Social."
      />
    );
  }

  return (
    <div
      className="h-full overflow-auto"
      style={{ background: semantic.colorBgBase, padding: 16 }}
    >
      <Flex justify="space-between" align="center" wrap gap={12}>
        <Segmented
          value={subView}
          onChange={(value) => setSubView(value as SubView)}
          options={[
            { label: "Posts", value: "posts" },
            ...(isOrgAdmin
              ? [
                  {
                    label: (
                      <Badge count={pendingCount} size="small" offset={[10, 0]}>
                        <span>Approvals</span>
                      </Badge>
                    ),
                    value: "approvals",
                  },
                ]
              : []),
            ...(canManageConnections
              ? [{ label: "Connections", value: "connections" }]
              : []),
          ]}
        />

        {subView === "posts" && (
          <Flex align="center" gap={12}>
            <Checkbox
              checked={onlyMine}
              onChange={(event) => setOnlyMine(event.target.checked)}
            >
              <Typography.Text style={{ fontSize: 13 }}>
                Only mine
              </Typography.Text>
            </Checkbox>
            <Button
              type="primary"
              icon={<Plus size={15} />}
              disabled={accounts.length === 0}
              onClick={() => {
                setEditing(null);
                setWizardOpen(true);
              }}
            >
              New share task
            </Button>
          </Flex>
        )}
      </Flex>

      {subView === "posts" && accounts.length === 0 && (
        <Alert
          style={{ marginTop: 12 }}
          type="info"
          showIcon
          message="No social account connected yet"
          description={
            canManageConnections
              ? "Open the Connections tab to link a Facebook Page, Instagram, TikTok or YouTube account."
              : "Ask an organization owner or admin to connect a social account first."
          }
        />
      )}

      <div style={{ marginTop: 16 }}>
        {subView === "posts" && (
          <ShareTaskList
            organizationId={organizationId}
            projectId={projectId}
            userId={userId}
            onlyMine={onlyMine}
            refreshToken={refreshToken}
            onOpenDetail={setDetailId}
            onEdit={handleEdit}
          />
        )}

        {subView === "approvals" && isOrgAdmin && (
          <ApprovalQueue
            organizationId={organizationId}
            projectId={projectId}
            userId={userId}
            refreshToken={refreshToken}
            onReviewed={() => {
              bumpRefresh();
              fetchPendingCount();
            }}
          />
        )}

        {subView === "connections" && canManageConnections && (
          <Connections
            organizationId={organizationId}
            userId={userId}
            isSuperAdmin={isSuperAdmin}
            onAccountsChanged={setAccounts}
          />
        )}
      </div>

      <CreateShareModal
        open={wizardOpen}
        organizationId={organizationId}
        projectId={projectId}
        userId={userId}
        accounts={accounts}
        editing={editing}
        presetGalleryIds={presetGalleryIds}
        onClose={handleWizardClose}
        onSaved={handleSaved}
      />

      <ShareTaskDetailDrawer
        shareId={detailId}
        open={Boolean(detailId)}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
};

export default PublicSocial;
