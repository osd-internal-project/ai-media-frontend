"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Empty,
  Flex,
  Image,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Check, X } from "lucide-react";
import dayjs from "dayjs";
import { axiosCore } from "@/app/lib/axios/axios";
import ActivityShareServices from "@/app/services/activity-share.service";
import {
  ActivityShareDetail,
  ActivityShareListItem,
} from "@/app/common/activity-share.type";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import PlatformIcon from "./platform-icon";

interface ApprovalQueueProps {
  organizationId: string;
  projectId: string;
  userId: string;
  refreshToken: number;
  /** เรียกหลังอนุมัติ/ปฏิเสธ เพื่อให้ badge จำนวนคิวอัปเดต */
  onReviewed: () => void;
}

const PAGE_SIZE = 10;

/**
 * คิวอนุมัติสำหรับ OWNER/ADMIN ของ organization
 *
 * ขยายแถวเพื่อดูสื่อและ caption เต็มก่อนตัดสินใจ — แอดมินต้องเห็นสิ่งที่กำลัง
 * อนุมัติจริง ๆ ไม่ใช่แค่ข้อความย่อในตาราง
 */
const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  organizationId,
  projectId,
  userId,
  refreshToken,
  onReviewed,
}) => {
  const { mode } = useThemeMode();
  const semantic = useMemo(() => getThemeConfig(mode).token ?? {}, [mode]);
  const activityShareServices = useMemo(
    () => ActivityShareServices(axiosCore),
    []
  );
  const [messageApi, contextHolder] = message.useMessage();

  const [rows, setRows] = useState<ActivityShareListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  /** cache รายละเอียดของแถวที่ถูกขยาย — โหลด lazy ทีละแถว */
  const [details, setDetails] = useState<Record<string, ActivityShareDetail>>({});
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  /** งานที่กำลังจะถูกปฏิเสธ (ต้องกรอกเหตุผลก่อน) */
  const [rejecting, setRejecting] = useState<ActivityShareListItem | null>(null);
  const [rejectNote, setRejectNote] = useState<string>("");

  const fetchRows = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const res = await activityShareServices.findMany({
        organizationId,
        projectId,
        status: "NEW",
        page,
        pageSize: PAGE_SIZE,
      });
      setRows(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error("Failed to load approval queue:", error);
      messageApi.error("Could not load the approval queue");
    } finally {
      setLoading(false);
    }
  }, [organizationId, projectId, page, activityShareServices, messageApi]);

  useEffect(() => {
    fetchRows();
  }, [organizationId, projectId, page, refreshToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDetail = useCallback(
    async (id: string) => {
      if (details[id]) return;
      setLoadingDetailId(id);
      try {
        const detail = await activityShareServices.findOne(id);
        setDetails((prev) => ({ ...prev, [id]: detail }));
      } catch (error) {
        console.error("Failed to load share detail:", error);
      } finally {
        setLoadingDetailId(null);
      }
    },
    [details, activityShareServices]
  );

  const handleApprove = useCallback(
    async (row: ActivityShareListItem) => {
      setBusyId(row.id);
      try {
        await activityShareServices.approve(row.id, userId);
        messageApi.success("Approved — the creator can now send it");
        fetchRows();
        onReviewed();
      } catch (error) {
        const reason =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Could not approve";
        messageApi.error(reason);
      } finally {
        setBusyId(null);
      }
    },
    [activityShareServices, userId, messageApi, fetchRows, onReviewed]
  );

  const handleReject = useCallback(async () => {
    if (!rejecting || !rejectNote.trim()) return;
    setBusyId(rejecting.id);
    try {
      await activityShareServices.reject(
        rejecting.id,
        userId,
        rejectNote.trim()
      );
      messageApi.success("Rejected — the creator can edit and resubmit");
      setRejecting(null);
      setRejectNote("");
      fetchRows();
      onReviewed();
    } catch (error) {
      const reason =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Could not reject";
      messageApi.error(reason);
    } finally {
      setBusyId(null);
    }
  }, [
    rejecting,
    rejectNote,
    activityShareServices,
    userId,
    messageApi,
    fetchRows,
    onReviewed,
  ]);

  const columns: ColumnsType<ActivityShareListItem> = useMemo(
    () => [
      {
        title: "Preview",
        dataIndex: "previewUrl",
        width: 84,
        render: (previewUrl: string | null) => (
          <Avatar shape="square" size={52} src={previewUrl ?? undefined} />
        ),
      },
      {
        title: "Caption",
        dataIndex: "caption",
        render: (caption: string) => (
          <Typography.Paragraph
            ellipsis={{ rows: 2 }}
            style={{ marginBottom: 0, maxWidth: 340 }}
          >
            {caption || (
              <Typography.Text type="secondary">No caption</Typography.Text>
            )}
          </Typography.Paragraph>
        ),
      },
      {
        title: "Destinations",
        dataIndex: "targets",
        width: 150,
        render: (targets: ActivityShareListItem["targets"]) => (
          <Flex gap={6} wrap>
            {targets.map((target) => (
              <PlatformIcon
                key={target.id}
                platform={target.platform}
                size={26}
              />
            ))}
          </Flex>
        ),
      },
      {
        title: "Submitted",
        dataIndex: "createdAt",
        width: 130,
        render: (createdAt: string) => (
          <Typography.Text style={{ fontSize: 12 }}>
            {dayjs(createdAt).format("DD MMM YY HH:mm")}
          </Typography.Text>
        ),
      },
      {
        title: "Review",
        key: "review",
        width: 200,
        render: (_, row) => (
          <Flex gap={8}>
            <Popconfirm
              title="Approve this share task?"
              description="The creator will be able to publish it."
              okText="Approve"
              onConfirm={() => handleApprove(row)}
            >
              <Button
                size="small"
                type="primary"
                loading={busyId === row.id}
                icon={<Check size={14} />}
              >
                Approve
              </Button>
            </Popconfirm>
            <Button
              size="small"
              danger
              icon={<X size={14} />}
              onClick={() => {
                setRejecting(row);
                setRejectNote("");
              }}
            >
              Reject
            </Button>
          </Flex>
        ),
      },
    ],
    [busyId, handleApprove]
  );

  return (
    <div>
      {contextHolder}

      <Table
        rowKey="id"
        size="small"
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={false}
        scroll={{ x: 900 }}
        locale={{ emptyText: <Empty description="Nothing waiting for approval" /> }}
        expandable={{
          onExpand: (expanded, row) => {
            if (expanded) loadDetail(row.id);
          },
          expandedRowRender: (row) => {
            const detail = details[row.id];
            if (loadingDetailId === row.id || !detail) {
              return (
                <Flex justify="center" style={{ padding: 16 }}>
                  <Spin size="small" />
                </Flex>
              );
            }
            return (
              <Flex vertical gap={12} style={{ padding: 8 }}>
                <Flex wrap gap={8}>
                  {detail.media.map((item) => (
                    <Image
                      key={item.galleryId}
                      width={80}
                      height={80}
                      src={item.thumbnailUrl || item.url || ""}
                      alt="share media"
                      style={{ objectFit: "cover", borderRadius: 8 }}
                    />
                  ))}
                </Flex>
                <Typography.Paragraph style={{ marginBottom: 0 }}>
                  {detail.caption || (
                    <Typography.Text type="secondary">
                      No caption
                    </Typography.Text>
                  )}
                </Typography.Paragraph>
                {detail.hashtags.length > 0 && (
                  <Flex wrap gap={4}>
                    {detail.hashtags.map((tag) => (
                      <Tag key={tag}>#{tag}</Tag>
                    ))}
                  </Flex>
                )}
                {detail.linkUrl && (
                  <a href={detail.linkUrl} target="_blank" rel="noreferrer">
                    {detail.linkUrl}
                  </a>
                )}
                <Flex wrap gap={8}>
                  {detail.targets.map((target) => (
                    <Flex
                      key={target.id}
                      align="center"
                      gap={8}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 8,
                        border: `1px solid ${semantic.colorBorderSecondary}`,
                      }}
                    >
                      <PlatformIcon platform={target.platform} size={22} />
                      <Typography.Text style={{ fontSize: 12 }}>
                        {target.socialAccount?.displayName ?? target.platform}
                      </Typography.Text>
                    </Flex>
                  ))}
                </Flex>
              </Flex>
            );
          },
        }}
      />

      {total > PAGE_SIZE && (
        <Flex justify="flex-end" style={{ marginTop: 12 }}>
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={total}
            showSizeChanger={false}
            onChange={setPage}
          />
        </Flex>
      )}

      <Modal
        open={Boolean(rejecting)}
        title="Reject this share task"
        okText="Reject"
        okButtonProps={{
          danger: true,
          // เหตุผลบังคับ — ไม่งั้นผู้สร้างไม่รู้ว่าต้องแก้อะไร
          disabled: !rejectNote.trim(),
          loading: busyId === rejecting?.id,
        }}
        onOk={handleReject}
        onCancel={() => setRejecting(null)}
      >
        <Typography.Paragraph type="secondary">
          The creator sees this reason and can edit the task and resubmit it.
        </Typography.Paragraph>
        <Input.TextArea
          rows={4}
          value={rejectNote}
          onChange={(event) => setRejectNote(event.target.value)}
          placeholder="What needs to change?"
        />
      </Modal>
    </div>
  );
};

export default ApprovalQueue;
