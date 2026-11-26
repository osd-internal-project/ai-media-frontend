import { AxiosInstance } from "axios";
import type { TBrandKit } from "../common/brand-kit";

/** One row of GET /brand-kit/:id/prompt-preview: what the kit adds for one model. */
export interface TBrandPromptPreview {
  modelId: number;
  modelType: string;
  name: string | null;
  type: string;
  promptMaxChars: number;
  brandKitBudget: number;
  text: string;
  avoid: string;
  usedChars: number;
  dropped: string[];
}

const BrandKitServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/brand-kit";
  return {
    findAll: async (): Promise<TBrandKit[]> => {
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
    findByOrganizationId: async (
      organizationId: string,
    ): Promise<TBrandKit[]> => {
      return await axiosInstance
        .get(`${baseUrl}/organization/${organizationId}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    getDefaultByOrganizationId: async (organizationId: string) => {
      return await axiosInstance
        .get(`${baseUrl}/organization/${organizationId}/default`)
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
    promptPreview: async (
      id: string,
    ): Promise<TBrandPromptPreview[] | undefined> => {
      return await axiosInstance
        .get(`${baseUrl}/${id}/prompt-preview`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    create: async (data: Partial<TBrandKit>) => {
      return await axiosInstance
        .post(`${baseUrl}`, data)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    setDefault: async (id: string) => {
      return await axiosInstance
        .post(`${baseUrl}/set-default/${id}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    update: async (id: string, data: Partial<TBrandKit>) => {
      return await axiosInstance
        .patch(`${baseUrl}/${id}`, data)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },

    del: async (roleId: string) => {
      return await axiosInstance
        .delete(`${baseUrl}/${roleId}`)
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

export default BrandKitServices;
