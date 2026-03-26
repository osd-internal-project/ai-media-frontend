export interface TBrandKit {
  id: string;
  name: string;
  description: string;
  industryType: string;
  createdAt: string;
  updatedAt: string;
  brandCiPrompt: string;
  negativePrompt: string;
  organizationId: string;
}

export interface TBrandKitDetail {
  id: string;
  name: string;
  type: "colors" | "typography" | "logo";
  detail?:
    | TBrandKitDetailColor
    | TBrandKitDetailTypography
    | TBrandKitDetailLogo;
  createdAt: string;
  updatedAt: string;
  brandKitId: string;
}
export interface TBrandKitDetailColor {
  hex: string;
  type: "primary" | "secondary" | "accent" | "neutral" | "background";
}
export interface TBrandKitDetailTypography {
  weight: string;
  type: "Heading" | "Body" | "Caption";
  preview: string;
}
export interface TBrandKitDetailLogo {
  url: string;
  type: "primary" | "secondary" | "icon" | "light" | "dark";
}
