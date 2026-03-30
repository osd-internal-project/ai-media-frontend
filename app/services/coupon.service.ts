import { AxiosInstance } from "axios";

const CouponService = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/coupon-code";
  return {
    create: async (data: any) => {
      return await axiosInstance
        .post(`${baseUrl}`, data)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    useCoupon: async (data: { code: string; organizationId: string; userId: string }) => {
      return await axiosInstance
        .post(`${baseUrl}/use`, data)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },
    findAll: async (params?: any) => {
      return await axiosInstance
        .get(`${baseUrl}`, { params })
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    findAllUsage: async (params?: any) => {
      return await axiosInstance
        .get(`${baseUrl}/usage`, { params })
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    findUsageByCouponCodeId: async (couponCodeId: string) => {
      return await axiosInstance
        .get(`${baseUrl}/usage/coupon-code/${couponCodeId}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    findById: async (id: string) => {
      return await axiosInstance
        .get(`${baseUrl}/${id}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    update: async (id: string, data: any) => {
      return await axiosInstance
        .patch(`${baseUrl}/${id}`, data)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return;
        });
    },
    remove: async (id: string) => {
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
