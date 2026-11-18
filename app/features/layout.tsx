import type { Metadata } from "next";
import type { ReactNode } from "react";
import { copy } from "../home/i18n/copy";

export const metadata: Metadata = { title: copy.th.seo.featuresTitle, description: copy.th.seo.featuresDescription };

export default function FeaturesLayout({ children }: { children: ReactNode }) {
  return children;
}
