"use client";
import { createContext, useContext } from "react";

interface OrganizationContextType {
  organizationId: string | undefined;
  projectRole: string | undefined;
  organizationRole: string | undefined;
}

const OrganizationContext = createContext<OrganizationContextType>({
  organizationId: undefined,
  projectRole: undefined,
  organizationRole: undefined,
});

export const useOrganization = () => useContext(OrganizationContext);

export const OrganizationProvider = OrganizationContext.Provider;
