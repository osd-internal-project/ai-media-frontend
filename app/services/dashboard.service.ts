import { AxiosInstance } from "axios";
import { IDashboardProject, IDashboardUser } from "../common/dashbaord";

const DashboardServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/dashboard";
  return {
    findDashboardSummaryProject: async (
      organizationId: string,
      params: any
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
      params: any
    ): Promise<IDashboardUser[]> => {
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
