import { AxiosInstance } from "axios";
import type { TPromptGuideType } from "../common/prompt-guide.type";

const PromptGuideTypeServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/prompt-guide-type";
  return {
    findAll: async (): Promise<TPromptGuideType[]> => {
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
    create: async (value: TPromptGuideType) => {
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
    update: async (id: number, value: any) => {
      return await axiosInstance
        .patch(`${baseUrl}/${id}`, { body: value })
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
        .get(`${baseUrl}/${id}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    del: async (id: number) => {
      return await axiosInstance
        .delete(`${baseUrl}/${id}`)
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

export default PromptGuideTypeServices;
