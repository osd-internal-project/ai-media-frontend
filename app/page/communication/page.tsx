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
import { ExternalLink, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { notFound } from "next/navigation";
import { axiosCore } from "@/app/lib/axios/axios";
import { FEATURES } from "@/app/config/features";
import CommunityPostServices from "@/app/services/community-post.service";
import ProjectService from "@/app/services/project.service";
import { CommunityPostDetail } from "@/app/common/community-post.type";
import { useOrgIdentity } from "@/app/hooks/useOrgIdentity";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getCanvasBg, getThemeConfig } from "@/app/theme/themeConfig";
import PageSubHeader from "@/app/components/layout/PageSubHeader";
import PostCardGrid from "./components/post-card-grid";
import ApprovalQueue from "./components/approval-queue";
import PostCalendar from "./components/post-calendar";
import PostDetailDrawer from "./components/post-detail-drawer";
import CreatePostModal from "./components/create-post-modal";

type SubView = "posts" | "calendar" | "approvals" | "insights";

/** ตัวเลือก project ที่หน้านี้ต้องใช้ — ตัดจาก IProject ให้เหลือเท่าที่ใช้จริง */
interface ProjectOption {
  id: string;
  name: string;
}

/**
 * Communication — ศูนย์รวมการเผยแพร่ผลงานขึ้นหน้า community สาธารณะของ AI CAVE
 *
 * ต่างจากแท็บ Public Social ในหน้า project ตรงที่:
 * - อยู่ระดับองค์กร เห็นโพสต์ข้าม project ทั้งหมด
 * - ปลายทางคือหน้าเว็บสาธารณะของเราเอง ไม่ใช่ platform ภายนอก
 * ทั้งสองฟีเจอร์แยกกันโดยสิ้นเชิงและไม่แชร์ข้อมูลกัน
 */
const CommunicationPage: React.FC = () => {
  if (!FEATURES.social) {
    notFound();
  }

  const { data: session } = useSession();
  const { mode } = useThemeMode();
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);

  const {
    userId,
    organizationId,
    isOrgAdmin,
    loading: identityLoading,
  } = useOrgIdentity();

  const communityServices = useMemo(() => CommunityPostServices(axiosCore), []);
  const projectServices = useMemo(() => ProjectService(axiosCore), []);

  const [subView, setSubView] = useState<SubView>("posts");
  const [onlyMine, setOnlyMine] = useState<boolean>(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [refreshToken, setRefreshToken] = useState<number>(0);

  const [wizardOpen, setWizardOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<CommunityPostDetail | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const bumpRefresh = useCallback(() => setRefreshToken((n) => n + 1), []);

  /** project ทั้งหมดของ org — ใช้ทั้งฟิลเตอร์ ตัวเลือกใน wizard และแปลง id เป็นชื่อ */
  const fetchProjects = useCallback(async () => {
    if (!organizationId || !session?.user?.id) return;
    try {
      const rows = await projectServices.findByOrganizationId(
        organizationId,
        session.user.id,
        {}
      );
      setProjects(
        (rows ?? []).map((project) => ({ id: project.id, name: project.name }))
      );
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  }, [organizationId, session?.user?.id, projectServices]);

  const fetchPendingCount = useCallback(async () => {
    if (!organizationId || !isOrgAdmin) return;
    try {
      const { count } =
        await communityServices.countPendingApproval(organizationId);
      setPendingCount(count);
    } catch (error) {
      console.error("Failed to load pending count:", error);
    }
  }, [organizationId, isOrgAdmin, communityServices]);

  useEffect(() => {
    if (identityLoading) return;
    fetchProjects();
    fetchPendingCount();
  }, [identityLoading, organizationId, isOrgAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEdit = useCallback(
    async (postId: string) => {
      try {
        const detail = await communityServices.findOne(postId);
        setEditing(detail);
        setWizardOpen(true);
      } catch (error) {
        console.error("Failed to load post for editing:", error);
      }
    },
    [communityServices]
  );

  const handleWizardClose = useCallback(() => {
    setWizardOpen(false);
    setEditing(null);
  }, []);

  const handleSaved = useCallback(() => {
    bumpRefresh();
    fetchPendingCount();
  }, [bumpRefresh, fetchPendingCount]);

  if (identityLoading) {
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
        description="Select an organization before using Communication."
      />
    );
  }

  return (
    <Flex vertical style={{ height: "100%", background: getCanvasBg(mode) }}>
      <PageSubHeader
        title="Communication"
        subtitle="Publish work from your projects to the public AI CAVE community page"
        background={semantic.colorBgContainer as string}
        borderColor={semantic.colorBorder as string}
        titleColor={semantic.colorText as string}
        subtitleColor={semantic.colorTextTertiary as string}
        chipBg={semantic.colorFillSecondary as string}
        chipText={semantic.colorText as string}
        rightSlot={
          <Button
            size="small"
            icon={<ExternalLink size={14} />}
            href="/community"
            target="_blank"
            rel="noopener noreferrer"
          >
            View public page
          </Button>
        }
      />

      <div className="h-full overflow-auto" style={{ padding: 16 }}>
        <Flex justify="space-between" align="center" wrap gap={12}>
          <Segmented
            value={subView}
            onChange={(value) => setSubView(value as SubView)}
            options={[
              { label: "Posts", value: "posts" },
              { label: "Calendar", value: "calendar" },
              ...(isOrgAdmin
                ? [
                    {
                      label: (
                        <Badge
                          count={pendingCount}
                          size="small"
                          offset={[10, 0]}
                        >
                          <span>Approvals</span>
                        </Badge>
                      ),
                      value: "approvals",
                    },
                    { label: "Insights", value: "insights" },
                  ]
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
                disabled={projects.length === 0}
                onClick={() => {
                  setEditing(null);
                  setWizardOpen(true);
                }}
              >
                New post
              </Button>
            </Flex>
          )}
        </Flex>

        {subView === "posts" && projects.length === 0 && (
          <Alert
            style={{ marginTop: 12 }}
            type="info"
            showIcon
            message="No project to publish from yet"
            description="Create a project and generate some media before posting to the community."
          />
        )}

        <div style={{ marginTop: 16 }}>
          {subView === "posts" && (
            <PostCardGrid
              organizationId={organizationId}
              userId={userId}
              isOrgAdmin={isOrgAdmin}
              projects={projects}
              onlyMine={onlyMine}
              refreshToken={refreshToken}
              onOpenDetail={setDetailId}
              onEdit={handleEdit}
              onChanged={handleSaved}
            />
          )}

          {subView === "calendar" && (
            <PostCalendar
              organizationId={organizationId}
              refreshToken={refreshToken}
              onOpenDetail={setDetailId}
            />
          )}

          {subView === "approvals" && isOrgAdmin && (
            <ApprovalQueue
              organizationId={organizationId}
              userId={userId}
              projects={projects}
              refreshToken={refreshToken}
              onReviewed={handleSaved}
            />
          )}

          {subView === "insights" && isOrgAdmin && (
            <PostCardGrid
              organizationId={organizationId}
              userId={userId}
              isOrgAdmin={isOrgAdmin}
              projects={projects}
              onlyMine={false}
              sort="popular"
              publishedOnly
              refreshToken={refreshToken}
              onOpenDetail={setDetailId}
              onEdit={handleEdit}
              onChanged={handleSaved}
            />
          )}
        </div>
      </div>

      <CreatePostModal
        open={wizardOpen}
        organizationId={organizationId}
        userId={userId}
        projects={projects}
        editing={editing}
        onClose={handleWizardClose}
        onSaved={handleSaved}
      />

      <PostDetailDrawer
        postId={detailId}
        open={Boolean(detailId)}
        onClose={() => setDetailId(null)}
      />
    </Flex>
  );
};

export default CommunicationPage;
