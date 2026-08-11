"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Empty,
  Flex,
  Input,
  Pagination,
  Popconfirm,
  Select,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye, Pencil, RefreshCw, Send, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import { axiosCore } from "@/app/lib/axios/axios";
import ActivityShareServices from "@/app/services/activity-share.service";
import {
  ACTIVITY_SHARE_STATUSES,
  ActivityShareListItem,
  ActivityShareStatus,
  SHARE_STATUS_COLORS,
} from "@/app/common/activity-share.type";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
import PlatformIcon from "./platform-icon";

interface ShareTaskListProps {
  organizationId: string;
  projectId: string;
  userId: string;
  /** true = แสดงเฉพาะงานของผู้ใช้คนนี้ */
  onlyMine: boolean;
  /** bump ค่านี้เพื่อสั่ง refetch จากภายนอก */
  refreshToken: number;
  onOpenDetail: (shareId: string) => void;
  onEdit: (shareId: string) => void;
}

const PAGE_SIZE = 10;

/**
 * ตารางงาน share พร้อม action ที่เปลี่ยนไปตามสถานะ
 *
 * ปุ่มที่แสดงต่อแถวขึ้นกับสถานะโดยตรง — ผู้ใช้จะได้ไม่เห็นปุ่มที่กดแล้ว backend
 * ปฏิเสธอยู่ดี (เช่น Send ตอนงานยังไม่อนุมัติ)
 */
const ShareTaskList: React.FC<ShareTaskListProps> = ({
  organizationId,
  projectId,
  userId,
  onlyMine,
  refreshToken,
  onOpenDetail,
  onEdit,
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
  const [statusFilter, setStatusFilter] = useState<ActivityShareStatus | undefined>();
  const [search, setSearch] = useState<string>("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const res = await activityShareServices.findMany({
        organizationId,
        projectId,
        status: statusFilter,
        search: search || undefined,
        createdByUserId: onlyMine ? userId : undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setRows(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error("Failed to load share tasks:", error);
      messageApi.error("Could not load share tasks");
    } finally {
      setLoading(false);
    }
  }, [
    organizationId,
    projectId,
    statusFilter,
    search,
    onlyMine,
    userId,
    page,
    activityShareServices,
    messageApi,
  ]);

  // fetchRows ถูก memo ด้วย filter/page ทั้งหมดอยู่แล้ว จึงใช้เป็น dependency ตรง ๆ
  // ได้โดยไม่ต้อง disable exhaustive-deps
  useEffect(() => {
    fetchRows();
  }, [fetchRows, refreshToken]);

  /**
   * เรียก action แล้ว refetch พร้อมแสดงข้อความจาก backend เมื่อพลาด
   *
   * @param id id ของงาน
   * @param action ฟังก์ชันที่จะเรียก
   * @param successText ข้อความเมื่อสำเร็จ
   */
  const runAction = useCallback(
    async (id: string, action: () => Promise<unknown>, successText: string) => {
      setBusyId(id);
      try {
        await action();
        messageApi.success(successText);
        fetchRows();
      } catch (error) {
        const reason =
          (error as { response?: { data?: { message?: string | string[] } } })
            ?.response?.data?.message ?? "The action failed";
        messageApi.error(Array.isArray(reason) ? reason.join(", ") : reason);
      } finally {
        setBusyId(null);
      }
    },
    [messageApi, fetchRows]
  );

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
            style={{ marginBottom: 0, maxWidth: 320 }}
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
        width: 170,
        render: (targets: ActivityShareListItem["targets"]) => (
          <Flex gap={6} wrap>
            {targets.map((target) => (
              <Tooltip
                key={target.id}
                title={`${target.platform} · ${target.status}${
                  target.errorMessage ? ` · ${target.errorMessage}` : ""
                }`}
              >
                <span style={{ position: "relative", display: "inline-flex" }}>
                  <PlatformIcon platform={target.platform} size={26} />
                  <span
                    style={{
                      position: "absolute",
                      right: -2,
                      bottom: -2,
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      border: `1.5px solid ${semantic.colorBgContainer}`,
                      background:
                        target.status === "SUCCESS"
                          ? "#52c41a"
                          : target.status === "FAILED"
                            ? "#ff4d4f"
                            : "#faad14",
                    }}
                  />
                </span>
              </Tooltip>
            ))}
          </Flex>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        width: 120,
        render: (status: ActivityShareStatus, row) => (
          <Flex vertical gap={2}>
            <Tag color={SHARE_STATUS_COLORS[status]}>{status}</Tag>
            {status === "REJECTED" && row.reviewNote && (
              <Tooltip title={row.reviewNote}>
                <Typography.Text
                  type="danger"
                  style={{ fontSize: 11, cursor: "help" }}
                >
                  see reason
                </Typography.Text>
              </Tooltip>
            )}
          </Flex>
        ),
      },
      {
        title: "Created",
        dataIndex: "createdAt",
        width: 130,
        render: (createdAt: string) => (
          <Typography.Text style={{ fontSize: 12 }}>
            {dayjs(createdAt).format("DD MMM YY HH:mm")}
          </Typography.Text>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 240,
        render: (_, row) => {
          const isOwner = row.createdByUserId === userId;
          const busy = busyId === row.id;
          return (
            <Flex gap={6} wrap>
              <Tooltip title="View details">
                <Button
                  size="small"
                  icon={<Eye size={14} />}
                  onClick={() => onOpenDetail(row.id)}
                />
              </Tooltip>

              {isOwner && (row.status === "NEW" || row.status === "REJECTED") && (
                <Tooltip title="Edit">
                  <Button
                    size="small"
                    icon={<Pencil size={14} />}
                    onClick={() => onEdit(row.id)}
                  />
                </Tooltip>
              )}

              {isOwner && row.status === "APPROVED" && (
                <Popconfirm
                  title="Publish now?"
                  description="The post will be sent to every selected platform."
                  okText="Send"
                  onConfirm={() =>
                    runAction(
                      row.id,
                      () => activityShareServices.send(row.id, userId),
                      "Queued for publishing"
                    )
                  }
                >
                  <Button
                    size="small"
                    type="primary"
                    loading={busy}
                    icon={<Send size={14} />}
                  >
                    Send
                  </Button>
                </Popconfirm>
              )}

              {isOwner && row.status === "FAILED" && (
                <Popconfirm
                  title="Retry the failed destinations?"
                  description="Destinations that already succeeded will not be posted again."
                  okText="Retry"
                  onConfirm={() =>
                    runAction(
                      row.id,
                      () => activityShareServices.retry(row.id, userId),
                      "Retrying the failed destinations"
                    )
                  }
                >
                  <Button
                    size="small"
                    loading={busy}
                    icon={<RefreshCw size={14} />}
                  >
                    Retry
                  </Button>
                </Popconfirm>
              )}

              {isOwner && (row.status === "NEW" || row.status === "REJECTED") && (
                <Popconfirm
                  title="Delete this share task?"
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                  onConfirm={() =>
                    runAction(
                      row.id,
                      () => activityShareServices.deleteById(row.id, userId),
                      "Share task deleted"
                    )
                  }
                >
                  <Button
                    size="small"
                    danger
                    loading={busy}
                    icon={<Trash2 size={14} />}
                  />
                </Popconfirm>
              )}
            </Flex>
          );
        },
      },
    ],
    [
      userId,
      busyId,
      semantic,
      onOpenDetail,
      onEdit,
      runAction,
      activityShareServices,
    ]
  );

  return (
    <div>
      {contextHolder}

      <Flex gap={8} wrap style={{ marginBottom: 12 }}>
        <Input.Search
          allowClear
          placeholder="Search caption"
          style={{ maxWidth: 280 }}
          onSearch={(value) => {
            setPage(1);
            setSearch(value);
          }}
        />
        <Select
          allowClear
          placeholder="All statuses"
          style={{ width: 170 }}
          value={statusFilter}
          onChange={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
          options={ACTIVITY_SHARE_STATUSES.map((status) => ({
            label: status,
            value: status,
          }))}
        />
      </Flex>

      <Table
        rowKey="id"
        size="small"
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={false}
        scroll={{ x: 1000 }}
        locale={{
          emptyText: (
            <Empty description="No share task yet — create one to publish to social" />
          ),
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
    </div>
  );
};

export default ShareTaskList;
