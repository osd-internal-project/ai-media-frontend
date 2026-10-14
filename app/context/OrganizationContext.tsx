"use client";
import { createContext, useContext } from "react";

interface OrganizationContextType {
  organizationRole: string | undefined;
  /** access code ของ org ปัจจุบัน — undefined ระหว่างโหลด */
  accessCodes?: string[];
}

const OrganizationContext = createContext<OrganizationContextType>({
  organizationRole: undefined,
  accessCodes: undefined,
});

export const useOrganization = () => useContext(OrganizationContext);

export const OrganizationProvider = OrganizationContext.Provider;
