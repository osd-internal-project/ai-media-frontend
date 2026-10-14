import { AxiosInstance } from "axios";
import { ISavedCard } from "../common/invoice.type";

/** API client for an organization's saved cards (Omise customer). Use with axiosUser. */
const PaymentMethodServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/payment-method";

  return {
    listCards: async (organizationId: string): Promise<ISavedCard[]> => {
      return await axiosInstance
        .get(`${baseUrl}/${organizationId}/cards`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    addCard: async (
      organizationId: string,
      token: string,
    ): Promise<ISavedCard[]> => {
      return await axiosInstance
        .post(`${baseUrl}/${organizationId}/cards`, { token })
        .then((res) => res.data);
    },

    deleteCard: async (
      organizationId: string,
      cardId: string,
    ): Promise<ISavedCard[]> => {
      return await axiosInstance
        .delete(`${baseUrl}/${organizationId}/cards/${cardId}`)
        .then((res) => res.data);
    },
  };
};

export default PaymentMethodServices;
