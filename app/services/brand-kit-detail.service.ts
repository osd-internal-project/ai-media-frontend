import { AxiosInstance } from "axios";
import type { TBrandKitDetail } from "../common/brand-kit";

const BrandKitDetailServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/brand-kit-detail";
  return {
    findAll: async (): Promise<TBrandKitDetail[]> => {
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
    findByBrandKitId: async (brandKitId: string): Promise<TBrandKitDetail[]> => {
      return await axiosInstance
        .get(`${baseUrl}/brand-kit/${brandKitId}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    findByTypeAndBrandKitId: async (
      type: string,
      brandKitId: string,
    ): Promise<TBrandKitDetail[]> => {
      return await axiosInstance
        .get(`${baseUrl}/type/${type}/brand-kit/${brandKitId}`)
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
    create: async (value: Partial<TBrandKitDetail>) => {
      return await axiosInstance
        .post(`${baseUrl}`, value)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    update: async (id: string, data: Partial<TBrandKitDetail>) => {
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

    del: async (id: string) => {
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

export default BrandKitDetailServices;
