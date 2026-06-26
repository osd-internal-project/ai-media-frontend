import { AxiosInstance } from "axios";
import { IInvoice } from "../common/invoice.type";
import {
  ICreateWhtRequest,
  IWhtListResult,
  IWhtRequest,
  WhtStatus,
} from "../common/wht-request.type";

/** API client for withholding-tax refund requests. Use with axiosUser. */
const WhtRequestServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/wht-request";

  return {
    eligibleInvoices: async (
      organizationId: string,
    ): Promise<IInvoice[]> => {
      return await axiosInstance
        .get(`${baseUrl}/eligible-invoices`, { params: { organizationId } })
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    create: async (data: ICreateWhtRequest): Promise<IWhtRequest> => {
      return await axiosInstance
        .post(`${baseUrl}`, data)
        .then((res) => res.data);
    },

    findOne: async (id: string): Promise<IWhtRequest | null> => {
      return await axiosInstance
        .get(`${baseUrl}/${id}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return null;
        });
    },

    findManyAdmin: async (params: {
      status?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      skip?: number;
      take?: number;
    }): Promise<IWhtListResult> => {
      return await axiosInstance
        .get(`${baseUrl}`, { params })
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return { data: [], total: 0 };
        });
    },

    updateStatus: async (
      id: string,
      toStatus: WhtStatus,
      adminUserId: string,
      note?: string,
    ): Promise<IWhtRequest> => {
      return await axiosInstance
        .patch(`${baseUrl}/${id}/status`, { toStatus, adminUserId, note })
        .then((res) => res.data);
    },
  };
};

export default WhtRequestServices;
