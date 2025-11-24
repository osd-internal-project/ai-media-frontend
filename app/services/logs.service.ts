import { AxiosInstance } from "axios";

const LogsServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/logs";
  return {
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

    findById: async (projectId: string) => {
      return await axiosInstance
        .get(`${baseUrl}/${projectId}`)
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
