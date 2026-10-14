export type BillingProfileType = "INDIVIDUAL" | "JURISTIC";

export interface IBillingProfile {
  id: string;
  userId: string;
  organizationId: string;
  type: BillingProfileType;
  address: string;
  isDefault: boolean;

  // Individual
  fullName?: string | null;
  nationalId?: string | null;

  // Juristic
  companyName?: string | null;
  taxId?: string | null;
  branchCode?: string | null;
  branchName?: string | null;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface ICreateBillingProfile {
  userId: string;
  organizationId: string;
  type: BillingProfileType;
  address: string;
  isDefault?: boolean;
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
