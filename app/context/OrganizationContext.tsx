"use client";
import { createContext, useContext } from "react";

interface OrganizationContextType {
  organizationRole: string | undefined;

}

const OrganizationContext = createContext<OrganizationContextType>({
  organizationRole: undefined,
});

export const useOrganization = () => useContext(OrganizationContext);

export const OrganizationProvider = OrganizationContext.Provider;
