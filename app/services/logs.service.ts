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
    findProjectTaskByPage: async (
      projectId: string,
      query: {
        organizationId?: string;
        type?: string;
        skip?: number;
        take?: number;
        fristsql?: number;
        lastsql?: number;
        userId?: string;
      },
    ) => {
      return await axiosInstance
        .get(`${baseUrl}/find-product-task/${projectId}`, { params: query })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findImageByPage: async (
      projectId: string,
      skip?: number,
      take?: number,
    ) => {
      const params: any = {};
      if (skip !== undefined) params.skip = skip;
      if (take !== undefined) params.take = take;
      return await axiosInstance
        .get(`${baseUrl}/find-image/${projectId}`, { params })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    // findImageByFristId: async (projectId: string, fristId: string) => {
    //   const params: any = {};
    //   if (fristId !== undefined) params.fristid = fristId;
    //   return await axiosInstance
    //     .get(`${baseUrl}/find-image/${projectId}/frist`, { params })
    //     .then((res) => {
    //       return res.data;
    //     })
    //     .catch((err) => {
    //       console.log(err);
    //       return;
    //     });
    // },
    findvideoByPage: async (
      projectId: string,
      skip?: number,
      take?: number,
    ) => {
      const params: any = {};
      if (skip !== undefined) params.skip = skip;
      if (take !== undefined) params.take = take;
      return await axiosInstance
        .get(`${baseUrl}/find-video/${projectId}`, { params })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findvideoByFristId: async (projectId: string, fristId: string) => {
      const params: any = {};
      if (fristId !== undefined) params.fristid = fristId;
      return await axiosInstance
        .get(`${baseUrl}/find-video/${projectId}/frist`, { params })
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
        .get(`${baseUrl}/generate-video-logs/${taskId}`, { params: value })
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
