import { AxiosInstance } from "axios";

export interface PlanFeature {
  icon: string;
  text: string;
  isHighlight: boolean;
  category?: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  badge: string | null;
  popular: boolean;
  borderColor: string;
  price: {
    monthly: number;
    annually: number;
  };
  features: PlanFeature[];
  featuresByCategory?: { [category: string]: PlanFeature[] };
  detailJson?: {
    maxUserAccess: string;
    packageTokenAmount: string;
    packageImageAmount: string;
  };
}

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

    findAllFormatted: async (): Promise<Plan[]> => {
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

    findByName: async (name: string): Promise<any> => {
      return await axiosInstance
        .get(`${basePlansUrl}/${name}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return null;
        });
    },
  };
};

export default PlanServices;
