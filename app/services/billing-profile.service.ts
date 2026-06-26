import { AxiosInstance } from "axios";
import {
  IBillingProfile,
  ICreateBillingProfile,
} from "../common/billing-profile.type";

/** API client for billing (tax-invoice) profiles. Use with axiosUser. */
const BillingProfileServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/billing-profile";

  return {
    findByUserId: async (userId: string): Promise<IBillingProfile[]> => {
      return await axiosInstance
        .get(`${baseUrl}`, { params: { userId } })
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    findByOrganizationId: async (
      organizationId: string,
    ): Promise<IBillingProfile[]> => {
      return await axiosInstance
        .get(`${baseUrl}`, { params: { organizationId } })
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    findOne: async (id: string): Promise<IBillingProfile | null> => {
      return await axiosInstance
        .get(`${baseUrl}/${id}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return null;
        });
    },

    create: async (
      data: ICreateBillingProfile,
    ): Promise<IBillingProfile> => {
      return await axiosInstance
        .post(`${baseUrl}`, data)
        .then((res) => res.data);
    },

    update: async (
      id: string,
      data: Partial<ICreateBillingProfile>,
    ): Promise<IBillingProfile> => {
      return await axiosInstance
        .patch(`${baseUrl}/${id}`, data)
        .then((res) => res.data);
    },

    setDefault: async (id: string): Promise<IBillingProfile> => {
      return await axiosInstance
        .patch(`${baseUrl}/${id}/default`)
        .then((res) => res.data);
    },

    remove: async (id: string): Promise<boolean> => {
      return await axiosInstance
        .delete(`${baseUrl}/${id}`)
        .then(() => true)
        .catch((err) => {
          console.log(err);
          return false;
        });
    },
  };
};

export default BillingProfileServices;
