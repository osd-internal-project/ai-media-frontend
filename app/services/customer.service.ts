import { AxiosInstance } from "axios";
import {
  ICustomer,
  ICustomerInvoice,
  ICustomerListResult,
} from "../common/customer.type";

/** API client for the admin customers directory. Use with axiosUser. */
const CustomerServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/customer";

  return {
    findMany: async (params: {
      search?: string;
      skip?: number;
      take?: number;
    }): Promise<ICustomerListResult> => {
      return await axiosInstance
        .get(`${baseUrl}`, { params })
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return { data: [], total: 0 };
        });
    },

    findOne: async (id: string): Promise<ICustomer | null> => {
      return await axiosInstance
        .get(`${baseUrl}/${id}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return null;
        });
    },

    findInvoices: async (id: string): Promise<ICustomerInvoice[]> => {
      return await axiosInstance
        .get(`${baseUrl}/${id}/invoices`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
  };
};

export default CustomerServices;
