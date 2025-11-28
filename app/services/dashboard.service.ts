import { AxiosInstance } from "axios";

const DashboardServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/dashboard";
  return {
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
