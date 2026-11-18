"use client";
import { createContext, useContext } from "react";

/** What the current page shows after the org name in the app header (e.g. the open project). */
export type PageHeaderInfo = { name: string; status: string; subtitle?: string } | null;

type PageHeaderContextType = {
  pageHeader: PageHeaderInfo;
  setPageHeader: (info: PageHeaderInfo) => void;
};

const PageHeaderContext = createContext<PageHeaderContextType>({
  pageHeader: null,
  setPageHeader: () => {},
});

export const usePageHeader = () => useContext(PageHeaderContext);

export const PageHeaderProvider = PageHeaderContext.Provider;
