"use client";

import React, { useEffect, useState } from "react";
import { Select } from "antd";
import { useSession } from "next-auth/react";
import BrandKitServices from "@/app/services/brand-kit.service";
import { axiosCore } from "@/app/lib/axios/axios";
import type { TBrandKit } from "@/app/common/brand-kit";

type Props = {
  /** antd Form passes these; null means "use the organization default" */
  value?: string | null;
  onChange?: (value: string | null) => void;
};

/** Picks the kit a project generates with. Cleared, the project follows the organization's default kit. */
export default function ProjectBrandKitSelect({ value, onChange }: Props) {
  const { data: session } = useSession();
  const organizationId = session?.user?.organizationId;
  const [kits, setKits] = useState<TBrandKit[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!organizationId) return;
    BrandKitServices(axiosCore)
      .findByOrganizationId(organizationId)
      .then((loaded) => {
        if (!cancelled) setKits(loaded ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  const fallback = kits.find((k) => k.isDefault ?? k.default);

  return (
    <Select
      value={value ?? undefined}
      allowClear
      placeholder={
        fallback
          ? `Organization default (${fallback.name})`
          : "Organization default"
      }
      options={kits.map((kit) => ({ value: kit.id, label: kit.name }))}
      notFoundContent="No brand kits in this organization yet"
      // antd reports a cleared Select as undefined; the API needs null to clear the project's kit
      onChange={(next?: string) => onChange?.(next ?? null)}
    />
  );
}
