"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  DatePicker,
  Empty,
  Flex,
  Image,
  Input,
  Modal,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { Check, Images, X } from "lucide-react";
import { axiosCore } from "@/app/lib/axios/axios";
import CommunityPostServices from "@/app/services/community-post.service";
import { CommunityPostListItem } from "@/app/common/community-post.type";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";

interface ApprovalQueueProps {
  organizationId: string;
  userId: string;
  projects: { id: string; name: string }[];
  refreshToken: number;
  onReviewed: () => void;
}

/**
 * คิวอนุมัติของ OWNER/ADMIN — โพสต์สถานะ NEW ทั้งหมดของ org
 *
 * แสดงเป็นแถวใหญ่พร้อมรูปตัวอย่าง ไม่ใช่ตารางแคบ ๆ เพราะคนอนุมัติต้องเห็นสิ่งที่
 * กำลังจะออกสู่สาธารณะจริง ๆ ก่อนกด ไม่ใช่แค่ชื่อเรื่อง
 */
const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  organizationId,
  userId,
  projects,
  refreshToken,
  onReviewed,
}) => {
  const { mode } = useThemeMode();
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);
  const services = useMemo(() => CommunityPostServices(axiosCore), []);
  const [messageApi, contextHolder] = message.useMessage();

  const [rows, setRows] = useState<CommunityPostListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [rejecting, setRejecting] = useState<CommunityPostListItem | null>(null);
  const [rejectNote, setRejectNote] = useState<string>("");

  const [approving, setApproving] = useState<CommunityPostListItem | null>(null);
  const [scheduledAt, setScheduledAt] = useState<Dayjs | null>(null);

  const projectNameById = useMemo(
    () => new Map(projects.map((project) => [project.id, project.name])),
    [projects]
  );

  const fetchRows = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const res = await services.findMany({
        organizationId,
        status: "NEW",
        pageSize: 50,
      });
      setRows(res.data);
    } catch (error) {
      console.error("Failed to load approval queue:", error);
      messageApi.error("Could not load the approval queue");
    } finally {
      setLoading(false);
    }
  }, [organizationId, services, messageApi]);

  useEffect(() => {
    fetchRows();
  }, [refreshToken, organizationId]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * อนุมัติโพสต์ พร้อมตั้งเวลาเผยแพร่ถ้าผู้อนุมัติเลือกไว้
   *
   * การอนุมัติไม่เท่ากับการเผยแพร่ — โพสต์จะไปอยู่สถานะ APPROVED รอคนกด
   * Publish now หรือรอ cron ตามเวลาที่ตั้ง
   */
  const handleApprove = useCallback(async () => {
    if (!approving) return;
    setBusyId(approving.id);
    try {
      await services.approve(approving.id, userId, {
        ...(scheduledAt && { scheduledAt: scheduledAt.toISOString() }),
      });
      messageApi.success(
        scheduledAt
          ? `Approved — it publishes on ${scheduledAt.format("D MMM HH:mm")}`
          : "Approved — publish it when you are ready"
      );
      setApproving(null);
      setScheduledAt(null);
      onReviewed();
      fetchRows();
    } catch (error) {
      const reason =
        (error as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message ?? "Could not approve this post";
      messageApi.error(Array.isArray(reason) ? reason.join(", ") : reason);
    } finally {
      setBusyId(null);
    }
  }, [
    approving,
    scheduledAt,
    services,
    userId,
    messageApi,
    onReviewed,
    fetchRows,
  ]);

  const handleReject = useCallback(async () => {
    if (!rejecting || !rejectNote.trim()) return;
    setBusyId(rejecting.id);
    try {
      await services.reject(rejecting.id, userId, rejectNote.trim());
      messageApi.success("Sent back to the author");
      setRejecting(null);
      setRejectNote("");
      onReviewed();
      fetchRows();
    } catch (error) {
      const reason =
        (error as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message ?? "Could not reject this post";
      messageApi.error(Array.isArray(reason) ? reason.join(", ") : reason);
    } finally {
      setBusyId(null);
    }
  }, [
    rejecting,
    rejectNote,
    services,
    userId,
    messageApi,
    onReviewed,
    fetchRows,
  ]);

  if (loading) {
    return (
      <Flex justify="center" style={{ padding: 64 }}>
        <Spin />
      </Flex>
    );
  }

  return (
    <Flex vertical gap={12}>
      {contextHolder}

      {rows.length === 0 ? (
        <Empty style={{ padding: 48 }} description="Nothing waiting for review" />
      ) : (
        <>
          <Alert
            type="info"
            showIcon
            message="Approving does not publish the post"
            description="An approved post still needs someone to press Publish now, or a scheduled time to arrive."
          />

          {rows.map((post) => (
            <Flex
              key={post.id}
              gap={16}
              align="center"
              style={{
                padding: 12,
                borderRadius: 12,
                border: `1px solid ${semantic.colorBorder}`,
                background: semantic.colorBgContainer,
              }}
            >
              <div
                style={{
                  width: 96,
                  height: 96,
                  flex: "none",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: semantic.colorBgElevated,
                }}
              >
                {post.previewUrl ? (
                  <Image
                    src={post.previewUrl}
                    alt={post.title}
                    preview={false}
                    width="100%"
                    height="100%"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <Flex
                    align="center"
                    justify="center"
                    style={{ height: "100%", color: semantic.colorTextTertiary }}
                  >
                    <Images size={22} />
                  </Flex>
                )}
              </div>

              <Flex vertical flex={1} gap={4} style={{ minWidth: 0 }}>
                <Typography.Text strong ellipsis={{ tooltip: post.title }}>
                  {post.title || "Untitled"}
                </Typography.Text>
                <Typography.Paragraph
                  type="secondary"
                  ellipsis={{ rows: 2 }}
                  style={{ marginBottom: 0, fontSize: 12 }}
                >
                  {post.caption || "No caption"}
                </Typography.Paragraph>
                <Flex gap={6} wrap align="center">
                  <Tag style={{ marginInlineEnd: 0 }}>
                    {projectNameById.get(post.projectId) ?? "Unknown project"}
                  </Tag>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {post.authorDisplayName} ·{" "}
                    {dayjs(post.createdAt).format("D MMM HH:mm")} ·{" "}
                    {post.mediaCount} item{post.mediaCount === 1 ? "" : "s"}
                  </Typography.Text>
                </Flex>
              </Flex>

              <Flex gap={8} flex="none">
                <Button
                  icon={<X size={15} />}
                  loading={busyId === post.id}
                  onClick={() => {
                    setRejecting(post);
                    setRejectNote("");
                  }}
                >
                  Reject
                </Button>
                <Button
                  type="primary"
                  icon={<Check size={15} />}
                  loading={busyId === post.id}
                  onClick={() => {
                    setApproving(post);
                    setScheduledAt(null);
                  }}
                >
                  Approve
                </Button>
              </Flex>
            </Flex>
          ))}
        </>
      )}

      <Modal
        open={Boolean(approving)}
        title="Approve this post"
        okText="Approve"
        confirmLoading={busyId === approving?.id}
        onOk={handleApprove}
        onCancel={() => {
          setApproving(null);
          setScheduledAt(null);
        }}
      >
        <Flex vertical gap={12}>
          <Typography.Text>
            Publish <Typography.Text strong>{approving?.title}</Typography.Text>{" "}
            to the public community page.
          </Typography.Text>
          <div>
            <Typography.Text strong>Schedule (optional)</Typography.Text>
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="D MMM YYYY HH:mm"
              value={scheduledAt}
              onChange={setScheduledAt}
              // เวลาที่ผ่านไปแล้วเลือกไม่ได้ — backend ก็ปฏิเสธเช่นกัน
              disabledDate={(current) => current && current < dayjs().startOf("day")}
              style={{ width: "100%", marginTop: 6 }}
              placeholder="Leave empty to publish manually"
            />
          </div>
        </Flex>
      </Modal>

      <Modal
        open={Boolean(rejecting)}
        title="Send back to the author"
        okText="Reject"
        okButtonProps={{ danger: true, disabled: !rejectNote.trim() }}
        confirmLoading={busyId === rejecting?.id}
        onOk={handleReject}
        onCancel={() => {
          setRejecting(null);
          setRejectNote("");
        }}
      >
        <Typography.Paragraph type="secondary">
          The author sees this note and can edit and resubmit the post.
        </Typography.Paragraph>
        <Input.TextArea
          rows={4}
          value={rejectNote}
          onChange={(event) => setRejectNote(event.target.value)}
          placeholder="What needs to change before this can go public?"
        />
      </Modal>
    </Flex>
  );
};

export default ApprovalQueue;
