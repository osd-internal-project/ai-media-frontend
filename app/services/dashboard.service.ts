import { AxiosInstance } from "axios";

const DashboardServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/dashboard";
  return {
    findAll: async (token: string) => {
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
  };
};

export default DashboardServices;
