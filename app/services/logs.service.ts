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
    findVdo: async (projectId: string) => {
      return await axiosInstance
        .get(`${baseUrl}/find-vdo/${projectId}`)
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
        .get(`${baseUrl}/generate-vdo-logs/${taskId}`, { params: value })
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
