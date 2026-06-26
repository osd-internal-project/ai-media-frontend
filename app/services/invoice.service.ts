import { AxiosInstance } from "axios";
import {
  ICreateInvoice,
  IInvoice,
  IInvoiceListResult,
  IInvoiceStatusResult,
  InternetBank,
  IPaySourceResult,
} from "../common/invoice.type";

/** API client for invoices + Omise payment actions. Use with axiosUser. */
const InvoiceServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/invoice";

  return {
    create: async (data: ICreateInvoice): Promise<IInvoice> => {
      return await axiosInstance
        .post(`${baseUrl}`, data)
        .then((res) => res.data);
    },

    findOne: async (id: string): Promise<IInvoice | null> => {
      return await axiosInstance
        .get(`${baseUrl}/${id}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return null;
        });
    },

    findByOrganizationId: async (
      organizationId: string,
    ): Promise<IInvoice[]> => {
      return await axiosInstance
        .get(`${baseUrl}/organization/${organizationId}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    payCard: async (id: string, token: string): Promise<IInvoice> => {
      return await axiosInstance
        .post(`${baseUrl}/${id}/pay/card`, { token })
        .then((res) => res.data);
    },

    paySource: async (
      id: string,
      method: "PROMPTPAY" | "INTERNET_BANKING",
      options?: { bank?: InternetBank; returnUri?: string },
    ): Promise<IPaySourceResult> => {
      return await axiosInstance
        .post(`${baseUrl}/${id}/pay/source`, { method, ...options })
        .then((res) => res.data);
    },

    getStatus: async (id: string): Promise<IInvoiceStatusResult> => {
      return await axiosInstance
        .get(`${baseUrl}/${id}/status`)
        .then((res) => res.data);
    },

    // Admin
    findManyAdmin: async (params: {
      status?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
      skip?: number;
      take?: number;
    }): Promise<IInvoiceListResult> => {
      return await axiosInstance
        .get(`${baseUrl}`, { params })
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return { data: [], total: 0 };
        });
    },
  };
};

export default InvoiceServices;
