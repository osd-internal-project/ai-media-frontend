import { AxiosInstance } from "axios";

const ReportServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/dashboard";
  return {
    reportcsvDashboard: async (token: string, params: any) => {
      return await axiosInstance
        .post(
          `${baseUrl}/download`,
          { ...params, token },
          {
            responseType: "blob",
          },
        )
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

export default ReportServices;
