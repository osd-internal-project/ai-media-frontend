"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Empty,
  Flex,
  Input,
  Modal,
  Pagination,
  Select,
  Spin,
  message,
} from "antd";
import { Search } from "lucide-react";
import { axiosCore } from "@/app/lib/axios/axios";
import CommunityPostServices from "@/app/services/community-post.service";
import {
  COMMUNITY_STATUS_LABELS,
  COMMUNITY_POST_STATUSES,
  CommunityPostListItem,
  CommunityPostStatus,
  isEditableStatus,
} from "@/app/common/community-post.type";
import PostCard, { PostCardAction } from "./post-card";

const PAGE_SIZE = 12;

/** instance ของ Modal ที่ได้จาก Modal.useModal() */
type ModalApi = ReturnType<typeof Modal.useModal>[0];

/**
 * ห่อ modal.confirm ให้ await ได้
 *
 * `Modal.useModal().confirm` คืน handle ({ destroy, update }) ไม่ใช่ Promise —
 * การ await ตรง ๆ จะได้ object ที่ truthy เสมอ แล้วกลายเป็นว่าผู้ใช้ "ยืนยัน"
 * ทุกครั้งแม้จะกด Cancel
 *
 * @param modal instance จาก Modal.useModal()
 * @param options ข้อความบนกล่องยืนยัน
 * @returns true เมื่อผู้ใช้กดยืนยัน
 */
function confirmWith(
  modal: ModalApi,
  options: { title: string; content: string; okText: string }
): Promise<boolean> {
  return new Promise((resolve) => {
    modal.confirm({
      title: options.title,
      content: options.content,
      okText: options.okText,
      okButtonProps: { danger: true },
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

interface PostCardGridProps {
  organizationId: string;
  userId: string;
  isOrgAdmin: boolean;
  /** ตัวเลือก project สำหรับฟิลเตอร์ + แปลง projectId เป็นชื่อบนการ์ด */
  projects: { id: string; name: string }[];
  onlyMine: boolean;
  /** เรียงตามยอดนิยม — มุมมอง Insights ใช้ค่านี้ */
  sort?: "latest" | "popular";
  /** จำกัดเฉพาะโพสต์ที่เผยแพร่แล้ว (มุมมอง Insights) */
  publishedOnly?: boolean;
  refreshToken: number;
  onOpenDetail: (id: string) => void;
  onEdit: (id: string) => void;
  onChanged: () => void;
}

/**
 * ตารางการ์ดของโพสต์ พร้อมฟิลเตอร์และ action ต่อใบ
 *
 * action ที่ให้กดได้ขึ้นกับสถานะ + สิทธิ์ ตรงกับ state machine ฝั่ง backend
 * ปุ่มที่กดแล้วต้องได้ 400 กลับมาเสมอไม่ควรโผล่ให้เห็นตั้งแต่แรก
 */
const PostCardGrid: React.FC<PostCardGridProps> = ({
  organizationId,
  userId,
  isOrgAdmin,
  projects,
  onlyMine,
  sort = "latest",
  publishedOnly = false,
  refreshToken,
  onOpenDetail,
  onEdit,
  onChanged,
}) => {
  const services = useMemo(() => CommunityPostServices(axiosCore), []);
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  const [rows, setRows] = useState<CommunityPostListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const [projectId, setProjectId] = useState<string | undefined>();
  const [status, setStatus] = useState<CommunityPostStatus | undefined>(
    publishedOnly ? "PUBLISHED" : undefined
  );
  const [search, setSearch] = useState<string>("");

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
        page,
        pageSize: PAGE_SIZE,
        sort,
        ...(projectId && { projectId }),
        ...(status && { status }),
        ...(search.trim() && { search: search.trim() }),
        ...(onlyMine && userId && { createdByUserId: userId }),
      });
      setRows(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error("Failed to load community posts:", error);
      messageApi.error("Could not load posts");
    } finally {
      setLoading(false);
    }
  }, [
    organizationId,
    page,
    sort,
    projectId,
    status,
    search,
    onlyMine,
    userId,
    services,
    messageApi,
  ]);

  useEffect(() => {
    fetchRows();
  }, [refreshToken, organizationId, page, projectId, status, onlyMine, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  // ฟิลเตอร์เปลี่ยนแล้วต้องกลับหน้า 1 ไม่งั้นจะค้างอยู่หน้าที่ไม่มีข้อมูลแล้ว
  useEffect(() => {
    setPage(1);
  }, [projectId, status, onlyMine, search]);

  /**
   * action ที่กดได้สำหรับโพสต์ใบนี้ ตามสถานะและสิทธิ์ของผู้ใช้
   *
   * @param post โพสต์ที่กำลังแสดง
   * @returns รายการ action สำหรับ dropdown
   */
  const actionsFor = useCallback(
    (post: CommunityPostListItem): PostCardAction[] => {
      const items: PostCardAction[] = [{ key: "detail", label: "View detail" }];
      const isOwner = post.createdByUserId === userId;

      if (isOwner && isEditableStatus(post.status)) {
        items.push({ key: "edit", label: "Edit" });
        items.push({ key: "delete", label: "Delete", danger: true });
      }
      if (isOrgAdmin && post.status === "APPROVED") {
        items.push({ key: "publish", label: "Publish now" });
      }
      if (isOrgAdmin && post.status === "SCHEDULED") {
        items.push({ key: "publish", label: "Publish now" });
        items.push({ key: "unschedule", label: "Cancel schedule" });
      }
      if (isOrgAdmin && post.status === "PUBLISHED") {
        items.push({ key: "unpublish", label: "Take down", danger: true });
      }
      if (isOrgAdmin && post.status === "UNPUBLISHED") {
        items.push({ key: "republish", label: "Publish again" });
      }
      return items;
    },
    [userId, isOrgAdmin]
  );

  /**
   * ยิงคำสั่งตาม action ที่เลือก
   *
   * @param key action ที่กด
   * @param post โพสต์เป้าหมาย
   */
  const handleAction = useCallback(
    async (key: string, post: CommunityPostListItem) => {
      if (key === "detail") return onOpenDetail(post.id);
      if (key === "edit") return onEdit(post.id);

      // การถอดโพสต์และการลบเปลี่ยนสิ่งที่คนนอกเห็นอยู่ — ต้องยืนยันก่อนเสมอ
      if (key === "unpublish" && !(await confirmWith(modal, {
        title: "Take this post down?",
        content:
          "It disappears from the public community page right away. Search engines and social platforms may keep a cached copy for a while.",
        okText: "Take down",
      }))) {
        return;
      }
      if (key === "delete" && !(await confirmWith(modal, {
        title: "Delete this post?",
        content: "This cannot be undone.",
        okText: "Delete",
      }))) {
        return;
      }

      try {
        switch (key) {
          case "publish":
            await services.publish(post.id, userId);
            messageApi.success("Published to the community page");
            break;
          case "unschedule":
            await services.unschedule(post.id, userId);
            messageApi.success("Schedule cancelled");
            break;
          case "unpublish":
            await services.unpublish(post.id, userId);
            messageApi.success("Post taken down");
            break;
          case "republish":
            await services.republish(post.id, userId);
            messageApi.success("Post is public again");
            break;
          case "delete":
            await services.deleteById(post.id, userId);
            messageApi.success("Post deleted");
            break;
          default:
            return;
        }
        onChanged();
        fetchRows();
      } catch (error) {
        // backend คืนเหตุผลที่อ่านรู้เรื่อง — แสดงตรง ๆ ให้ผู้ใช้แก้ได้
        const reason =
          (error as { response?: { data?: { message?: string | string[] } } })
            ?.response?.data?.message ?? "The action could not be completed";
        messageApi.error(Array.isArray(reason) ? reason.join(", ") : reason);
      }
    },
    [
      services,
      userId,
      modal,
      messageApi,
      onOpenDetail,
      onEdit,
      onChanged,
      fetchRows,
    ]
  );

  return (
    <Flex vertical gap={16}>
      {contextHolder}
      {modalContextHolder}

      <Flex gap={8} wrap>
        <Input
          allowClear
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onPressEnter={fetchRows}
          onBlur={fetchRows}
          prefix={<Search size={14} />}
          placeholder="Search title or caption"
          style={{ width: 260 }}
        />
        <Select
          allowClear
          value={projectId}
          onChange={setProjectId}
          placeholder="All projects"
          style={{ width: 200 }}
          options={projects.map((project) => ({
            value: project.id,
            label: project.name,
          }))}
        />
        {!publishedOnly && (
          <Select
            allowClear
            value={status}
            onChange={setStatus}
            placeholder="All statuses"
            style={{ width: 190 }}
            options={COMMUNITY_POST_STATUSES.map((value) => ({
              value,
              label: COMMUNITY_STATUS_LABELS[value],
            }))}
          />
        )}
      </Flex>

      {loading ? (
        <Flex justify="center" style={{ padding: 64 }}>
          <Spin />
        </Flex>
      ) : rows.length === 0 ? (
        <Empty
          style={{ padding: 48 }}
          description="No posts match these filters yet"
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {rows.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              projectName={projectNameById.get(post.projectId)}
              actions={actionsFor(post)}
              onOpen={onOpenDetail}
              onAction={handleAction}
            />
          ))}
        </div>
      )}

      {total > PAGE_SIZE && (
        <Flex justify="flex-end">
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={total}
            showSizeChanger={false}
            onChange={setPage}
          />
        </Flex>
      )}
    </Flex>
  );
};

export default PostCardGrid;
