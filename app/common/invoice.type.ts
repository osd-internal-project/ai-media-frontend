export type PaymentMethod = "CARD" | "PROMPTPAY" | "INTERNET_BANKING";
export type InvoiceStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED";
export type InternetBank = "bay" | "bbl" | "kbank" | "ktb" | "scb";

export interface ICustomer {
  id: string;
  customerCode: string;
  type: "INDIVIDUAL" | "JURISTIC";
  organizationId: string;
  name: string;
  taxId?: string | null;
  branchCode?: string | null;
  branchName?: string | null;
  address: string;
  createdAt: string;
}

export interface IReceipt {
  id: string;
  receiptNo: string;
  invoiceId: string;
  customerId?: string | null;
  preVatAmount: string | number;
  vatAmount: string | number;
  amount: string | number;
  issuedAt: string;
}

export interface IInvoice {
  id: string;
  invoiceNo: string;
  organizationId: string;
  userId: string;
  billingProfileId: string;
  customerId?: string | null;
  planId?: string | null;
  planPriceId?: string | null;
  planName: string;
  planInterval: string;
  subTotal: string | number;
  vatAmount: string | number;
  totalAmount: string | number;
  currency: string;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  issuedAt: string;
  paidAt?: string | null;
  expiredAt?: string | null;
  customer?: ICustomer | null;
  receipt?: IReceipt | null;
}

export interface ICreateInvoice {
  organizationId: string;
  userId: string;
  billingProfileId: string;
  planPriceId: string;
  paymentMethod: PaymentMethod;
}

export interface IPaySourceResult {
  status: string;
  chargeId?: string;
  authorizeUri?: string | null;
  qrImageUri?: string | null;
}

export interface IInvoiceStatusResult {
  status: InvoiceStatus | string;
  invoice?: IInvoice;
}

export interface IInvoiceListResult {
  data: IInvoice[];
  total: number;
}
