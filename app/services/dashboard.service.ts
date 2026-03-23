import { AxiosInstance } from "axios";
import {
  IDashboardCreditPerMonthAndType,
  IDashboardGeneratedPerMonthAndType,
  IDashboardOrganizationSummary,
  IDashboardOverviewSummary,
  IDashboardProject,
  IDashboardTableUser,
  IDashboardUser,
} from "../common/dashbaord";

const DashboardServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/dashboard";
  return {
    //NEW
    findOverviewSummary: async (
      organizationId: string,
      params: any,
    ): Promise<IDashboardOverviewSummary> => {
      return await axiosInstance
        .get(`${baseUrl}/overview-summary/${organizationId}`, {
          params: params,
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    countUsedCreditPerMonth: async (
      organizationId: string,
      params: any,
    ): Promise<IDashboardCreditPerMonthAndType[]> => {
      return await axiosInstance
        .get(`${baseUrl}/credit-per-month-and-type/${organizationId}`, {
          params: params,
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    countGeneratedPerMonth: async (
      organizationId: string,
      params: any,
    ): Promise<IDashboardGeneratedPerMonthAndType[]> => {
      return await axiosInstance
        .get(`${baseUrl}/generated-per-month-and-type/${organizationId}`, {
          params: params,
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
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
