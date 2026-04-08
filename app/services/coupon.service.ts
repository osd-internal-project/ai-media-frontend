import { AxiosInstance } from "axios";
import {
  ICouponCode,
  ICouponCodeGroupCreate,
  ICouponCodeUsage,
} from "../common/coupon.type";

const CouponService = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/coupon-code";
  return {
    create: async (data: Partial<ICouponCode>) => {
      return await axiosInstance
        .post(`${baseUrl}`, data)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    createGroup: async (data: Partial<ICouponCodeGroupCreate>) => {
      return await axiosInstance
        .post(`${baseUrl}/group`, data)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    useCoupon: async (data: {
      code: string;
      organizationId: string;
      userId: string;
    }) => {
      return await axiosInstance
        .post(`${baseUrl}/use`, data)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },
    findAll: async (
      params?: any,
    ): Promise<{ data: ICouponCode[]; total: number }> => {
      return await axiosInstance
        .get(`${baseUrl}`, { params })
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return { data: [], total: 0 };
        });
    },
    exportCsv: async (params?: any) => {
      return await axiosInstance
        .get(`${baseUrl}/export`, { params, responseType: "blob" })
        .then((res) => res.data);
    },
    findAllUsage: async (params?: any): Promise<ICouponCodeUsage[]> => {
      return await axiosInstance
        .get(`${baseUrl}/usage`, { params })
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    findUsageByCouponCodeId: async (
      couponCodeId: string,
    ): Promise<ICouponCodeUsage[]> => {
      return await axiosInstance
        .get(`${baseUrl}/usage/coupon-code/${couponCodeId}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    findById: async (id: string): Promise<ICouponCode> => {
      return await axiosInstance
        .get(`${baseUrl}/${id}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    update: async (
      id: string,
      data: Partial<ICouponCode>,
    ): Promise<ICouponCode> => {
      return await axiosInstance
        .patch(`${baseUrl}/${id}`, data)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    remove: async (id: string): Promise<ICouponCode> => {
      return await axiosInstance
        .delete(`${baseUrl}/${id}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return;
        });
    },
  };
};

export default CouponService;
