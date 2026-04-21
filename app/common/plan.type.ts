export interface TPlanFeature {
  id?: string;
  featureId?: string;
  key: string;
  label: string;
  icon: string | null;
  text: string;
  isHighlight: boolean;
  // status: boolean;
  category: string;
  orderIndex: number;
}

export interface TPlanPrice {
  id?: string;
  planId?: string;
  interval: string; // MONTH | YEAR | DAY
  price: number;
  duration: number;
  creditAllowance: number;
  imageAllowance: number;
  currency: string;
  isDefault: boolean;
  periodCount?: number;
  periodUnit?: string;
  orderIndex: number;
  plan?: TPlan;
  // detail?: {
  //   unit: string;
  //   creditPerUnit: number | string;
  // };
}

export interface TPlan {
  id: string;
  name: string;
  description: string | null;
  badge: string | null;
  isPopular: boolean;
  borderColor: string | null;
  isDefault: boolean;
  status: boolean;
  orderIndex?: number;
  prices: TPlanPrice[];
  // Backwards compatibility
  features: TPlanFeature[];
  featuresByCategory?: { [category: string]: TPlanFeature[] };
  detailJson?: {
    maxUserAccess?: string | number;
    // packageTokenAmount?: string | number;
    // packageImageAmount?: string | number;
    //   packageCreditAmouns
    creditAllowance?: string | number;
    imageAllowance?: string | number;
    unit: "day" | "month" | "year";
    duration: number;
  };
  createdAt?: string;
  updatedAt?: string;
}
