import { AxiosInstance } from "axios";
import {
  IDashboardCreditPerMonthAndType,
  IDashboardGeneratedPerMonthAndType,
  IDashboardOrganizationSummary,
  IDashboardOverviewSummary,
  IDashboardProject,
  IDashboardTableUser,
  IDashboardUser,
  IGenerationSeriesPoint,
  IRecentGeneration,
  IGenerationLogPage,
  GenerationLogStatus,
} from "../common/dashbaord";
import type { GenerationSeriesKey } from "../common/generation-type";

/** Query filter accepted by every Overview dashboard endpoint. */
export interface IDashboardFilterParams {
  /** Inclusive UTC range boundaries, ISO 8601. */
  from?: string;
  to?: string;
  projectId?: string;
  metric?: "count" | "credit" | "image";
  granularity?: "day" | "month";
  limit?: number;
}

const DashboardServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/dashboard";
  return {
    //NEW
    // These four reject on failure rather than resolving to undefined. Swallowing the error
    // here made a down report service look identical to an organization with no data, which
    // is what made every Overview stat card render 0.
    findOverviewSummary: async (
      organizationId: string,
      params: IDashboardFilterParams,
    ): Promise<IDashboardOverviewSummary> => {
      const res = await axiosInstance.get(
        `${baseUrl}/overview-summary/${organizationId}`,
        { params },
      );
      return res.data;
    },
    findGenerationSeries: async (
      organizationId: string,
      params: IDashboardFilterParams,
    ): Promise<IGenerationSeriesPoint[]> => {
      const res = await axiosInstance.get<Record<string, unknown>[]>(
        `${baseUrl}/generation-series/${organizationId}`,
        { params },
      );
      // Coerce every series to a number: a key missing from an older report build used to
      // reach the chart as undefined, turn its y-scale into NaN and push lines off the axis.
      return (res.data ?? []).map((row) => {
        const num = (key: GenerationSeriesKey) => Number(row[key]) || 0;
        return {
          bucket: String(row.bucket ?? ""),
          image: num("image"),
          video: num("video"),
          omnihuman: num("omnihuman"),
          dreamactor: num("dreamactor"),
          audio: num("audio"),
          other: num("other"),
        };
      });
    },
    findGenerationLogs: async (
      organizationId: string,
      params: IDashboardFilterParams & {
        userId?: string;
        type?: string;
        status?: GenerationLogStatus;
        page?: number;
        pageSize?: number;
      },
    ): Promise<IGenerationLogPage> => {
      const res = await axiosInstance.get<IGenerationLogPage>(
        `${baseUrl}/generation-logs/${organizationId}`,
        { params },
      );
      return res.data;
    },
    findRecentGenerations: async (
      organizationId: string,
      params: IDashboardFilterParams,
    ): Promise<IRecentGeneration[]> => {
      const res = await axiosInstance.get(
        `${baseUrl}/recent-generations/${organizationId}`,
        { params },
      );
      return res.data ?? [];
    },
    countUsedCreditPerMonth: async (
      organizationId: string,
      params: IDashboardFilterParams,
    ): Promise<IDashboardCreditPerMonthAndType[]> => {
      const res = await axiosInstance.get(
        `${baseUrl}/credit-per-month-and-type/${organizationId}`,
        { params },
      );
      return res.data ?? [];
    },
    countGeneratedPerMonth: async (
      organizationId: string,
      params: IDashboardFilterParams,
    ): Promise<IDashboardGeneratedPerMonthAndType[]> => {
      const res = await axiosInstance.get(
        `${baseUrl}/generated-per-month-and-type/${organizationId}`,
        { params },
      );
      return res.data ?? [];
    },
    //OLD
    findDashboardSummaryOrganization: async (
      organizationId: string,
      params: any,
    ): Promise<IDashboardOrganizationSummary> => {
      return await axiosInstance
        .get(`${baseUrl}/summary-organization/${organizationId}`, {
          params: params,
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    findDashboardSummaryProject: async (
      organizationId: string,
      params: any,
    ): Promise<IDashboardProject[]> => {
      return await axiosInstance
        .get(`${baseUrl}/summary-project/${organizationId}`, { params: params })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    findDashboardSummaryUser: async (
      organizationId: string,
      params: any,
    ): Promise<IDashboardTableUser[]> => {
      return await axiosInstance
        .get(`${baseUrl}/summary-user/${organizationId}`, { params: params })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    findDashboardSummary: async (token: string, params: any) => {
      return await axiosInstance
        .get(`${baseUrl}/${token}`, { params: params })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findDashboardSummaryOwner: async (token: string, params: any) => {
      return await axiosInstance
        .get(`${baseUrl}/find-owner/${token}`, { params: params })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findDashboardSummaryProduct: async (token: string, params: any) => {
      return await axiosInstance
        .get(`${baseUrl}/find-product/${token}`, { params: params })
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

export default DashboardServices;
