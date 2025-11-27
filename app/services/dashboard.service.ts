import { AxiosInstance } from "axios";

const DashboardServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/dashboard";
  return {
    findDashboardSummary: async (token: string) => {
      return await axiosInstance
        .get(`${baseUrl}/${token}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findDashboardSummaryOwner: async (token: string) => {
      return await axiosInstance
        .get(`${baseUrl}/find-owner/${token}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findDashboardSummaryProduct: async (token: string) => {
      return await axiosInstance
        .get(`${baseUrl}/find-product/${token}`)
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
