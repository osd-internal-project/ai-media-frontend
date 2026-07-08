"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Segmented, Spin } from "antd";
import PricingCards from "@/app/components/package/PricingCards";
import PlanServices from "@/app/services/plan.service";
import { TPlan, TPlanInterval } from "@/app/common/plan.type";
import { axiosCore } from "@/app/lib/axios/axios";
import { useOrganization } from "@/app/context/OrganizationContext";

/** Where a purchase applies: the user's current org, or a brand-new org. */
type BuyMode = "current" | "new";

/**
 * In-app Plans page (inside the authenticated shell). Lets the user pick whether
 * a purchase applies to their current organization (upgrade/downgrade/renew) or
 * creates a new organization, then routes to the checkout accordingly.
 */
export default function PlansPage() {
  const { organizationRole } = useOrganization();
  const router = useRouter();
  const planService = useMemo(() => PlanServices(axiosCore), []);

  const [plans, setPlans] = useState<TPlan[]>([]);

  const [interval, setInterval] = useState<TPlanInterval>("MONTH");
  const [buyMode, setBuyMode] = useState<BuyMode>(
    organizationRole === "OWNER" ? "current" : "new",
  );
  const [loading, setLoading] = useState(true);
  // const currentOrgId = "org_123"; // Replace with actual current organization ID
  const sortedPlans = useMemo(
    () =>
      [...plans].sort(
        (a, b) => (a.prices?.[0]?.price || 0) - (b.prices?.[0]?.price || 0),
      ),
    [plans],
  );
   
  const options = [
    ...(organizationRole === "OWNER"
      ? [
          {
            label: "Upgrade/Downgrade",
            value: "current",
          },
        ]
      : []),
    { label: "New ", value: "new" },
  ];

  //   const currentPlan = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     setPlans(await planService.f());
  //   } catch (error) {
  //     console.error("Failed to fetch plans:", error);
  //     setPlans([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [organizationId]);
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setPlans(await planService.findAllFormatted());
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [planService]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  /** Route to checkout — newOrg=1 only when creating a new organization. */
  const handleGetStarted = (priceId: string) => {
    if (!priceId) return;
    const newOrgParam = buyMode === "new" ? "&newOrg=1" : "";
    router.push(`/page/payment/checkout?priceId=${priceId}${newOrgParam}`);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Plans</h1>
        <p className="mt-1 text-sm text-white/70">
          Choose a plan for your organization.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented<BuyMode>
          value={buyMode}
          onChange={(v) => setBuyMode(v)}
          options={options}
        />
        <Segmented<TPlanInterval>
          value={interval}
          onChange={(v) => setInterval(v)}
          options={[
            { label: "Monthly", value: "MONTH" },
            { label: "Yearly (-3%)", value: "YEAR" },
          ]}
        />
      </div>

      {loading ? (
        <div className="flex h-72 items-center justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <PricingCards
          plans={sortedPlans}
          onGetStarted={handleGetStarted}
          planInterval={interval}
          generateManualPrice={false}
        />
      )}
    </div>
  );
}
