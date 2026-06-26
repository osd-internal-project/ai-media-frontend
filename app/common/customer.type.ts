import { ICustomer, IInvoice } from "./invoice.type";

export type { ICustomer };

export interface ICustomerListResult {
  data: ICustomer[];
  total: number;
}

export type ICustomerInvoice = IInvoice;
