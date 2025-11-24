import { AxiosInstance } from "axios";

const GalleryServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/gallery";
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

    findById: async (projectId: string, page: number, pageSize: number) => {
      return await axiosInstance
        .get(`${baseUrl}/${projectId}`, {
          params: {
            page,
            pageSize,
          },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findActivityById: async (projectId: string, page: number, pageSize: number) => {
      return await axiosInstance
        .get(`${baseUrl}/activity/${projectId}`, {
          params: {
            page,
            pageSize,
          },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    updateShareOptions: async (taskId: string, imageUrl: string, status: boolean) => {
      const base = {
        imageUrl,
        status,
      };
      return await axiosInstance
        .patch(`${baseUrl}/${taskId}`, { body: base })
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

export default GalleryServices;
