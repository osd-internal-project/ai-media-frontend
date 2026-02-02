"use client";
import { createContext, useContext } from "react";

interface OrganizationContextType {
  organizationId: string | undefined;
  organizationRole: string | undefined;
  userId: string | undefined;
  systemRole: string | undefined;
}

const OrganizationContext = createContext<OrganizationContextType>({
  organizationId: undefined,
  organizationRole: undefined,
  userId: undefined,
  systemRole: undefined,
});

export const useOrganization = () => useContext(OrganizationContext);

export const OrganizationProvider = OrganizationContext.Provider;
