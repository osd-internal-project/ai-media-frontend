import { AxiosInstance } from "axios";
import {
  ActivityShareDetail,
  ActivityShareListResponse,
  ActivityShareStatus,
  CreateActivitySharePayload,
  UpdateActivitySharePayload,
} from "@/app/common/activity-share.type";

/** ตัวกรองของหน้ารายการ */
export interface ActivityShareQuery {
  organizationId: string;
  projectId?: string;
  status?: ActivityShareStatus;
  platform?: string;
  search?: string;
  /** จำกัดเฉพาะงานของผู้ใช้คนนี้ (มุมมอง "งานของฉัน") */
  createdByUserId?: string;
  page?: number;
  pageSize?: number;
}

/**
 * client ของ /activity-share บน core service
 *
 * ต่างจาก service เดิมในโปรเจกต์ตรงที่ error ถูก throw ต่อ ไม่ swallow เป็น
 * `return undefined` — หน้าจอต้องแยกได้ว่า "ไม่มีข้อมูล" กับ "เรียกไม่สำเร็จ"
 * เพื่อจะขึ้น toast ที่ถูกต้อง
 */
const ActivityShareServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/activity-share";

  return {
    findMany: async (
      query: ActivityShareQuery
    ): Promise<ActivityShareListResponse> => {
      const res = await axiosInstance.get(baseUrl, { params: query });
      return res.data;
    },

    findOne: async (id: string): Promise<ActivityShareDetail> => {
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
      payload: CreateActivitySharePayload
    ): Promise<ActivityShareDetail> => {
      const res = await axiosInstance.post(baseUrl, payload);
      return res.data;
    },

    update: async (
      id: string,
      payload: UpdateActivitySharePayload
    ): Promise<ActivityShareDetail> => {
      const res = await axiosInstance.patch(`${baseUrl}/${id}`, payload);
      return res.data;
    },

    approve: async (
      id: string,
      userId: string,
      reviewNote?: string
    ): Promise<ActivityShareDetail> => {
      const res = await axiosInstance.patch(`${baseUrl}/${id}/approve`, {
        userId,
        reviewNote,
      });
      return res.data;
    },

    reject: async (
      id: string,
      userId: string,
      reviewNote: string
    ): Promise<ActivityShareDetail> => {
      const res = await axiosInstance.patch(`${baseUrl}/${id}/reject`, {
        userId,
        reviewNote,
      });
      return res.data;
    },

    send: async (id: string, userId: string): Promise<ActivityShareDetail> => {
      const res = await axiosInstance.post(`${baseUrl}/${id}/send`, { userId });
      return res.data;
    },

    retry: async (id: string, userId: string): Promise<ActivityShareDetail> => {
      const res = await axiosInstance.post(`${baseUrl}/${id}/retry`, { userId });
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

export default ActivityShareServices;
