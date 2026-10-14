import { IInvoice } from "./invoice.type";

export type WhtStatus =
  | "PENDING"
  | "RECEIVED"
  | "VERIFIED"
  | "REJECTED"
  | "REFUNDED";

export interface IWhtStatusLog {
  id: string;
  whtRequestId: string;
  fromStatus?: string | null;
  toStatus: string;
  adminUserId: string;
  note?: string | null;
  createdAt: string;
}

export interface IWhtRequest {
  id: string;
  invoiceId: string;
  receiptId: string;
  customerId: string;
  organizationId: string;
  userId: string;
  receiptNo: string;
  receiptDate: string;
  preVatAmount: string | number;
  whtPercent: number;
  whtAmount: string | number;
  docRefNo: string;
  docRefDate: string;
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  bankBranchCode: string;
  status: WhtStatus;
  createdAt: string;
  updatedAt: string;
  invoice?: IInvoice;
  statusLogs?: IWhtStatusLog[];
}

export interface ICreateWhtRequest {
  invoiceId: string;
  whtPercent: 1 | 3;
  docRefNo: string;
  docRefDate: string;
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  bankBranchCode: string;
}

export interface IWhtListResult {
  data: IWhtRequest[];
  total: number;
}
