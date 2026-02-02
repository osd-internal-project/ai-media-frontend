"use client";
import { createContext, useContext } from "react";

interface OrganizationContextType {
  organizationId: string | undefined;
  organizationRole: string | undefined;
  userId: string | undefined;
}

const OrganizationContext = createContext<OrganizationContextType>({
  organizationId: undefined,
  organizationRole: undefined,
  userId: undefined,
});

export const useOrganization = () => useContext(OrganizationContext);

export const OrganizationProvider = OrganizationContext.Provider;
