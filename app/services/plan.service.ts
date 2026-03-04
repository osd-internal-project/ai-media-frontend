import { AxiosInstance } from "axios";

import { TPlan, TPlanPrice } from "../common/plan.type";

const PlanServices = (axiosInstance: AxiosInstance) => {
  const basePlansUrl = "/plans";

  return {
    findAll: async (): Promise<any[]> => {
      return await axiosInstance
        .get(`${basePlansUrl}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    findAllFormatted: async (): Promise<TPlan[]> => {
      return await axiosInstance
        .get(`${basePlansUrl}/formatted`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    findPopular: async (): Promise<any[]> => {
      return await axiosInstance
        .get(`${basePlansUrl}/popular`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    findPlanWithPrice: async (priceId: string): Promise<TPlanPrice | null> => {
      return await axiosInstance
        .get(`${basePlansUrl}/price/${priceId}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return null;
        });
    },
    findById: async (id: string): Promise<TPlan | null> => {
      return await axiosInstance
        .get(`${basePlansUrl}/${id}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return null;
        });
    },

    create: async (data: any): Promise<TPlan | null> => {
      return await axiosInstance
        .post(`${basePlansUrl}`, data)
        .then((res) => res.data);
    },

    update: async (id: string, data: any): Promise<TPlan | null> => {
      return await axiosInstance
        .patch(`${basePlansUrl}/${id}`, data)
        .then((res) => res.data);
    },

    delete: async (id: string): Promise<boolean> => {
      return await axiosInstance
        .delete(`${basePlansUrl}/${id}`)
        .then(() => {
          return true;
        })
        .catch((err) => {
          console.log(err);
          return false;
        });
    },
  };
};

export default PlanServices;
