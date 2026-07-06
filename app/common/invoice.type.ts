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
  // null for a PENDING new-org invoice; set once the org is created at confirm
  organizationId: string | null;
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

export type OrgType = "team" | "personal";

/**
 * Billing details sent inline when buying a package for a brand-new org.
 * Mirrors the backend `NewOrgBillingDto` (billing profile fields minus
 * userId/organizationId, which are derived server-side).
 */
export interface INewOrgBilling {
  type: "INDIVIDUAL" | "JURISTIC";
  address: string;
  fullName?: string;
  nationalId?: string;
  companyName?: string;
  taxId?: string;
  branchCode?: string;
  branchName?: string;
  contactName?: string;
  phone?: string;
  email?: string;
}

export interface ICreateInvoice {
  userId: string;
  planPriceId: string;
  paymentMethod: PaymentMethod;

  /** true → create a brand-new org after payment; org/billing profile omitted. */
  createNewOrganization?: boolean;

  // Existing-org purchase (required when createNewOrganization is falsy)
  organizationId?: string;
  billingProfileId?: string;

  // New-org purchase (required when createNewOrganization is true)
  orgName?: string;
  orgType?: OrgType;
  orgDescription?: string;
  billing?: INewOrgBilling;
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
