import { AxiosInstance } from "axios";
import type { TPromptGuide } from "../common/prompt-guide.type";

const PromptGuideServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/prompt-guide";
  return {
    findAll: async (): Promise<TPromptGuide[]> => {
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
    create: async (value: TPromptGuide) => {
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
    findByOrganization: async (
      organizationId: string,
      query?: { model?: string },
    ): Promise<TPromptGuide[]> => {
      return await axiosInstance
        .get(`${baseUrl}/organization/${organizationId}`, { params: { ...query } })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findWithImageByTypes: async (
      organizationId: string,
      promptGuideTypeId: number,
    ): Promise<TPromptGuide[]> => {
      return await axiosInstance
        .get(`${baseUrl}/type/${promptGuideTypeId}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    getPromptGuideImages: async (promptGuideId: string) => {
      return await axiosInstance
        .get(`${baseUrl}/${promptGuideId}/images-with-urls`)
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

export default PromptGuideServices;
