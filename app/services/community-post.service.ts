import { AxiosInstance } from "axios";
import {
  CommunityPostDetail,
  CommunityPostListResponse,
  CommunityPostStatus,
  CreateCommunityPostPayload,
  UpdateCommunityPostPayload,
} from "@/app/common/community-post.type";

/** ตัวกรองของหน้ารายการฝั่ง studio */
export interface CommunityPostQuery {
  organizationId: string;
  projectId?: string;
  status?: CommunityPostStatus;
  search?: string;
  /** จำกัดเฉพาะโพสต์ของผู้ใช้คนนี้ (มุมมอง "งานของฉัน") */
  createdByUserId?: string;
  /** latest = ใหม่สุดก่อน, popular = ยอดวิว/ไลก์สูงสุดก่อน */
  sort?: "latest" | "popular";
  page?: number;
  pageSize?: number;
}

/**
 * client ของ /community-post บน core service (ฝั่ง studio)
 *
 * error ถูก throw ต่อ ไม่ swallow เป็น `return undefined` แบบ service รุ่นเก่า —
 * หน้าจอต้องแยกได้ว่า "ไม่มีข้อมูล" กับ "เรียกไม่สำเร็จ" เพื่อจะขึ้น toast ที่ถูกต้อง
 * (แนวเดียวกับ activity-share.service.ts)
 */
const CommunityPostServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/community-post";

  return {
    findMany: async (
      query: CommunityPostQuery
    ): Promise<CommunityPostListResponse> => {
      const res = await axiosInstance.get(baseUrl, { params: query });
      return res.data;
    },

    findOne: async (id: string): Promise<CommunityPostDetail> => {
      const res = await axiosInstance.get(`${baseUrl}/${id}`);
      return res.data;
    },

    countPendingApproval: async (
      organizationId: string
    ): Promise<{ count: number }> => {
      const res = await axiosInstance.get(`${baseUrl}/pending-count`, {
        params: { organizationId },
      });
      return res.data;
    },

    create: async (
      payload: CreateCommunityPostPayload
    ): Promise<CommunityPostDetail> => {
      const res = await axiosInstance.post(baseUrl, payload);
      return res.data;
    },

    update: async (
      id: string,
      payload: UpdateCommunityPostPayload
    ): Promise<CommunityPostDetail> => {
      const res = await axiosInstance.patch(`${baseUrl}/${id}`, payload);
      return res.data;
    },

    /** อนุมัติ พร้อมตั้งเวลาเผยแพร่ได้ในคำสั่งเดียว */
    approve: async (
      id: string,
      userId: string,
      options?: { reviewNote?: string; scheduledAt?: string }
    ): Promise<CommunityPostDetail> => {
      const res = await axiosInstance.patch(`${baseUrl}/${id}/approve`, {
        userId,
        ...options,
      });
      return res.data;
    },

    reject: async (
      id: string,
      userId: string,
      reviewNote: string
    ): Promise<CommunityPostDetail> => {
      const res = await axiosInstance.patch(`${baseUrl}/${id}/reject`, {
        userId,
        reviewNote,
      });
      return res.data;
    },

    publish: async (
      id: string,
      userId: string
    ): Promise<CommunityPostDetail> => {
      const res = await axiosInstance.post(`${baseUrl}/${id}/publish`, {
        userId,
      });
      return res.data;
    },

    /** @param scheduledAt ISO 8601 พร้อม offset */
    schedule: async (
      id: string,
      userId: string,
      scheduledAt: string
    ): Promise<CommunityPostDetail> => {
      const res = await axiosInstance.post(`${baseUrl}/${id}/schedule`, {
        userId,
        scheduledAt,
      });
      return res.data;
    },

    unschedule: async (
      id: string,
      userId: string
    ): Promise<CommunityPostDetail> => {
      const res = await axiosInstance.post(`${baseUrl}/${id}/unschedule`, {
        userId,
      });
      return res.data;
    },

    /** ถอดโพสต์ออกจากหน้าสาธารณะ — ไม่ลบทิ้ง */
    unpublish: async (
      id: string,
      userId: string,
      reason?: string
    ): Promise<CommunityPostDetail> => {
      const res = await axiosInstance.post(`${baseUrl}/${id}/unpublish`, {
        userId,
        reason,
      });
      return res.data;
    },

    republish: async (
      id: string,
      userId: string
    ): Promise<CommunityPostDetail> => {
      const res = await axiosInstance.post(`${baseUrl}/${id}/republish`, {
        userId,
      });
      return res.data;
    },

    deleteById: async (id: string, userId: string): Promise<{ id: string }> => {
      const res = await axiosInstance.delete(`${baseUrl}/${id}`, {
        params: { userId },
      });
      return res.data;
    },
  };
};

export default CommunityPostServices;
