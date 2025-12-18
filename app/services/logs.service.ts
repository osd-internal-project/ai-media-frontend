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

    findById: async (projectId: string, skip?: number, take?: number) => {
      const params: any = {};
      if (skip !== undefined) params.skip = skip;
      if (take !== undefined) params.take = take;
      return await axiosInstance
        .get(`${baseUrl}/${projectId}`, { params })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findVdo: async (projectId: string, skip?: number, take?: number) => {
      const params: any = {};
      if (skip !== undefined) params.skip = skip;
      if (take !== undefined) params.take = take;
      return await axiosInstance
        .get(`${baseUrl}/find-vdo/${projectId}`, { params })
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
