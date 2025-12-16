import { AxiosInstance } from "axios";
import type { IProject } from "../common/project.type";

const ProjectService = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/project";
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
    create: async (value: IProject) => {
      return await axiosInstance
        .post(`${baseUrl}`, { body: value })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    update: async (id: number, value: Partial<IProject>) => {
      return await axiosInstance
        .patch(`${baseUrl}/${id}`, value)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findById: async (id: string) => {
      return await axiosInstance
        .get(`${baseUrl}/manage/${id}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },

    findOneUserId: async (id: string) => {
      return await axiosInstance
        .get(`${baseUrl}/${id}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },

    upload: async (formData: any) => {
      return await axiosInstance
        .post(`${baseUrl}/upload-images`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((result) => result.data)
        .catch((err) => err);
    },
  };
};

export default ProjectService;
