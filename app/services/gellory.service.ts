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

    findById: async (
      projectId: string,
      organizationId: string,
      page: number,
      pageSize: number,
      status?: boolean
    ) => {
      return await axiosInstance
        .get(`${baseUrl}/${projectId}`, {
          params: {
            organizationId,
            page,
            pageSize,
            status,
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
    findActivityById: async (
      projectId: string,
      page: number,
      pageSize: number
    ) => {
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
    downloadFile: async (id: string, organizationId: string) => {
      return await axiosInstance
        .get(`${baseUrl}/download/${id}?organizationId=${organizationId}`, {
          responseType: "blob",
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    updateShareOptions: async (
      taskId: string,
      imageUrl: string,
      status: boolean
    ) => {
      const base = {
        imageUrl,
        status,
      };
      return await axiosInstance
        .patch(`${baseUrl}/task/${taskId}`, { body: base })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    updateStatus: async (taskId: string, status: boolean) => {
      const base = {
        status,
      };
      return await axiosInstance
        .patch(`${baseUrl}/${taskId}`, { body: base })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          throw err
        });
    },
  };
};

export default GalleryServices;
