import { AxiosInstance } from "axios";
import type { IGenerationLogDetail } from "../common/dashbaord";

export type AdminAuditEntity = "organization" | "plan" | "master_model_type";

export interface IAdminAuditEntry {
  id: string;
  action: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  createdAt: string;
  user: { userId: string; fullname: string | null; email: string | null };
}

const LogsServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/logs";
  return {
    /** ประวัติการแก้ของ admin (org / plan / model) — reject เมื่อพลาด ให้ tab แสดง error ได้ */
    listAudit: async (
      entityName: AdminAuditEntity,
      entityId: string,
    ): Promise<IAdminAuditEntry[]> => {
      const res = await axiosInstance.get<IAdminAuditEntry[]>(`${baseUrl}/audit`, {
        params: { entityName, entityId },
      });
      return res.data;
    },
    // Rejects on failure so the log drawer can show a retry instead of an empty result.
    findDetail: async (
      logId: string,
      organizationId: string,
    ): Promise<IGenerationLogDetail> => {
      const res = await axiosInstance.get<IGenerationLogDetail>(
        `${baseUrl}/detail/${logId}`,
        { params: { organizationId } },
      );
      return res.data;
    },
    findUsedCreditByModel: async (
      projectId: string,
      organizationId: string,
      userId: string,
    ): Promise<{ modelName: string | null; credit: number }[]> => {
      const res = await axiosInstance.get<{ modelName: string | null; credit: number }[]>(
        `${baseUrl}/used-credit-by-model/${projectId}`,
        { params: { organizationId, userId } },
      );
      return res.data;
    },
    findAll: async () => {
      return await axiosInstance
        .get(`${baseUrl}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findProjectTaskByPage: async (
      projectId: string,
      query: {
        organizationId?: string;
        type?: string;
        skip?: number;
        take?: number;
        fristsql?: number;
        lastsql?: number;
        userId?: string;
      },
    ) => {
      return await axiosInstance
        .get(`${baseUrl}/find-product-task/${projectId}`, { params: query })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findImageByPage: async (
      projectId: string,
      skip?: number,
      take?: number,
    ) => {
      const params: any = {};
      if (skip !== undefined) params.skip = skip;
      if (take !== undefined) params.take = take;
      return await axiosInstance
        .get(`${baseUrl}/find-image/${projectId}`, { params })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    // findImageByFristId: async (projectId: string, fristId: string) => {
    //   const params: any = {};
    //   if (fristId !== undefined) params.fristid = fristId;
    //   return await axiosInstance
    //     .get(`${baseUrl}/find-image/${projectId}/frist`, { params })
    //     .then((res) => {
    //       return res.data;
    //     })
    //     .catch((err) => {
    //       console.log(err);
    //       return;
    //     });
    // },
    findvideoByPage: async (
      projectId: string,
      skip?: number,
      take?: number,
    ) => {
      const params: any = {};
      if (skip !== undefined) params.skip = skip;
      if (take !== undefined) params.take = take;
      return await axiosInstance
        .get(`${baseUrl}/find-video/${projectId}`, { params })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findvideoByFristId: async (projectId: string, fristId: string) => {
      const params: any = {};
      if (fristId !== undefined) params.fristid = fristId;
      return await axiosInstance
        .get(`${baseUrl}/find-video/${projectId}/frist`, { params })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findByTaskId: async (taskId: string, value: any) => {
      return await axiosInstance
        .get(`${baseUrl}/generate-video-logs/${taskId}`, { params: value })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findByUserId: async (userId: string, skip: number, take: number) => {
      return await axiosInstance
        .get(`${baseUrl}/by-userid/${userId}?take=${take}&skip=${skip}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
  };
};

export default LogsServices;
