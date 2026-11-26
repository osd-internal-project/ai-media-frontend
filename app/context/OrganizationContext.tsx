"use client";
import { createContext, useContext } from "react";

interface OrganizationContextType {
  organizationRole: string | undefined;
  /** access code ของ org ปัจจุบัน — undefined ระหว่างโหลด */
  accessCodes?: string[];
  /** model ที่ org ใช้ได้ — undefined ระหว่างโหลด, [] = ทุก model ที่ active */
  allowedModelIds?: number[];
}

const OrganizationContext = createContext<OrganizationContextType>({
  organizationRole: undefined,
  accessCodes: undefined,
  allowedModelIds: undefined,
});

export const useOrganization = () => useContext(OrganizationContext);

export const OrganizationProvider = OrganizationContext.Provider;
