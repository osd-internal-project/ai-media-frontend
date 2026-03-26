import { AxiosInstance } from "axios";
import type { TBrandKit } from "../common/brand-kit";

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
