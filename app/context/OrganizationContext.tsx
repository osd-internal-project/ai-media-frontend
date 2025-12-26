"use client";
import { createContext, useContext } from "react";

interface OrganizationContextType {
  organizationId: string | undefined;
}

const OrganizationContext = createContext<OrganizationContextType>({
  organizationId: undefined,
});

export const useOrganization = () => useContext(OrganizationContext);

export const OrganizationProvider = OrganizationContext.Provider;
