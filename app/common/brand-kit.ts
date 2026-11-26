/** brand_kit.style: how the brand looks beyond its colours */
export interface TBrandKitStyle {
  mood?: string;
  look?: string;
  lighting?: string;
  mustHave?: string[];
}

export interface TBrandKit {
  id: string;
  name: string;
  description: string;
  industryType: string;
  isDefault?: boolean;
  default?: boolean;
  createdAt: string;
  updatedAt: string;
  brandCiPrompt: string;
  negativePrompt: string;
  organizationId: string;
  customPrompt?: string | null;
  style?: TBrandKitStyle | null;
  /** 1 = the saved brandCiPrompt is sent as written, 2 = the backend composes from this kit's records */
  promptVersion?: number;
  /** present on the by-organization and by-id responses */
  brandKitDetails?: TBrandKitDetail[];
}

export interface TBrandKitDetail {
  id: string;
  name: string;
  type: "colors" | "typography" | "logo" | "style_ref";
  detail?:
    | TBrandKitDetailColor
    | TBrandKitDetailTypography
    | TBrandKitDetailLogo;
  createdAt: string;
  updatedAt: string;
  brandKitId: string;
  sortOrder?: number;
  /** false = kept in the kit but not sent to the model */
  includeInPrompt?: boolean;
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
/** A logo or a style image. `key` is the stored file; `url` is filled in by the API for display. */
export interface TBrandKitDetailLogo {
  key?: string;
  url?: string | null;
  type?: "primary" | "secondary" | "icon" | "light" | "dark";
}
