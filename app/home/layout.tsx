import type { Metadata } from "next";
import type { ReactNode } from "react";
import { copy } from "./i18n/copy";

export const metadata: Metadata = { title: copy.th.seo.homeTitle, description: copy.th.seo.homeDescription };

export default function HomeLayout({ children }: { children: ReactNode }) {
  return children;
}
