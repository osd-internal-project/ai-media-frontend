export interface ICouponCode {
  id: string;
  code: string;
  expiresAt: string | Date;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  usageLimit: number;
  fixOrganizationId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  onTopCredit: number;
  couponCodeUsage?: ICouponCodeUsage;
  referenceTag?: string;
}

export interface ICouponCodeGroupCreate {
  tag: string;
  expiresAt: string | Date;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  usageLimit: number;
  fixOrganizationId?: string;
  onTopCredit: number;
  referenceTag: string;
  amount: number;
}
export interface ICouponCodeUsage {
  id: string;
  organizationId?: string;
  usedAt: string | Date;
  usedById: string;
  onTopCredit: number;
  organizationName: string;
  organizationCode: string;
  usedByName: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  couponCodeId: string;
  couponCode?: ICouponCode;
  remainCredit: number;
}

export interface IUseCouponCodeDto {
  code: string;
  organizationId: string;
  userId: string;
}
