import { BillingProfileType } from "./billing-profile.type";
import { InternetBank, PaymentMethod } from "./invoice.type";

export type PurchaseStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED";

export interface IPendingPurchase {
  id: string;
  userId: string;
  planId: string;
  planPriceId: string;
  planName: string;
  planInterval: string;
  orgName: string;
  orgDescription?: string | null;
  orgType: string;
  billingType: BillingProfileType;
  fullName?: string | null;
  nationalId?: string | null;
  companyName?: string | null;
  taxId?: string | null;
  branchCode?: string | null;
  branchName?: string | null;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address: string;
  subTotal: string | number;
  vatAmount: string | number;
  totalAmount: string | number;
  currency: string;
  paymentMethod: PaymentMethod;
  omiseChargeId?: string | null;
  omiseSourceId?: string | null;
  authorizeUri?: string | null;
  qrImageUri?: string | null;
  bank?: string | null;
  status: PurchaseStatus;
  createdOrganizationId?: string | null;
  invoiceId?: string | null;
  expiredAt?: string | null;
  createdAt: string;
}

export interface ICreatePurchase {
  userId: string;
  planPriceId: string;
  paymentMethod?: PaymentMethod;
  org: {
    name: string;
    description?: string;
    type?: string;
  };
  billing: {
    type: BillingProfileType;
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
  };
}

export interface IPurchasePayResult {
  status: string;
  chargeId?: string;
  authorizeUri?: string | null;
  qrImageUri?: string | null;
  organizationId?: string | null;
  invoiceNo?: string;
}

export interface IPurchaseStatusResult {
  status: string;
  organizationId?: string | null;
  invoiceNo?: string;
}

export type { InternetBank };
