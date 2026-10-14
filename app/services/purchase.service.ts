import { AxiosInstance } from "axios";
import { InternetBank } from "../common/invoice.type";
import {
  ICreatePurchase,
  IPendingPurchase,
  IPurchasePayResult,
  IPurchaseStatusResult,
} from "../common/purchase.type";

/** API client for the payment-first onboarding flow (order → pay → create org). */
const PurchaseServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/purchase";

  return {
    create: async (data: ICreatePurchase): Promise<IPendingPurchase> => {
      return await axiosInstance
        .post(`${baseUrl}`, data)
        .then((res) => res.data);
    },

    findOne: async (id: string): Promise<IPendingPurchase | null> => {
      return await axiosInstance
        .get(`${baseUrl}/${id}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return null;
        });
    },

    payCard: async (
      id: string,
      token: string,
    ): Promise<IPurchasePayResult> => {
      return await axiosInstance
        .post(`${baseUrl}/${id}/pay/card`, { token })
        .then((res) => res.data);
    },

    paySource: async (
      id: string,
      method: "PROMPTPAY" | "INTERNET_BANKING",
      options?: { bank?: InternetBank; returnUri?: string },
    ): Promise<IPurchasePayResult> => {
      return await axiosInstance
        .post(`${baseUrl}/${id}/pay/source`, { method, ...options })
        .then((res) => res.data);
    },

    getStatus: async (id: string): Promise<IPurchaseStatusResult> => {
      return await axiosInstance
        .get(`${baseUrl}/${id}/status`)
        .then((res) => res.data);
    },
  };
};

export default PurchaseServices;
