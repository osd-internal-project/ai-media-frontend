"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "antd";
import { useRouter, useParams } from "next/navigation";
import { axiosCore } from "@/app/lib/axios/axios";
import PlanServices from "@/app/services/plan.service";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { TPlan, TPlanPrice } from "@/app/common/plan.type";
import DetailedComparisonTable from "@/app/package/components/DetailedComparisonTable";
import OrganizationSubscriptionServices from "@/app/services/organization-subscription.service";
import { axiosUser } from "@/app/lib/axios/axios";
import ChangePlanCards from "@/app/components/package/ChangePlanCards";

const ChangePackagePage = () => {
  const router = useRouter();
  const { id } = useParams();
  const organizationId = String(id);
  const [mounted, setMounted] = useState(false);
  const [plans, setPlans] = useState<TPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const pricingRef = useRef<HTMLDivElement | null>(null);
  const featureRef = useRef<HTMLDivElement | null>(null);
  const [currentPlan, setCurrentPlan] = useState<TPlan | null>(null);
  const [currentPrice, setCurrentPrice] = useState<TPlanPrice | null>(null);

  const planService = useMemo(() => PlanServices(axiosCore), []);
  const subscriptionService = useMemo(
    () => OrganizationSubscriptionServices(axiosUser),
    [],
  );

  // Sort plans by price whenever plans state changes
  const sortedPlans = useMemo(() => {
    const getSortPrice = (plan: TPlan) => {
      const firstPrice = plan.prices.find(
        (price) => typeof price.price === "number" && Number.isFinite(price.price),
      );

      return firstPrice?.price ?? Number.POSITIVE_INFINITY;
    };

    return [...plans].sort((a, b) => getSortPrice(a) - getSortPrice(b));
  }, [plans]);

  const handleGetStarted = (priceId: string) => {
    router.push(
      `/page/admin-management/organization/${organizationId}/change-package/detail?price=${encodeURIComponent(priceId)}`,
    );
  };

  const handleToOrganizationPage = () => {
    router.push(`/page/admin-management/organization/${organizationId}`);
  };

  const fetchPlansAndSubscription = React.useCallback(async () => {
    try {
      setLoading(true);
      const [data, subData] = await Promise.all([
        planService.findAllFormatted(),
        subscriptionService.findByOrganizationId(organizationId),
      ]);
      // Inactive packages are hidden here, except the org's current one so its "current" marker stays.
      setPlans(
        data.filter((p: TPlan) => p.status || p.id === subData?.planId),
      );

      if (subData && subData.planId) {
        const cPlan = data.find((p: TPlan) => p.id === subData.planId) || null;
        setCurrentPlan(cPlan);

        if (cPlan && subData.interval) {
          const cPrice =
            cPlan.prices.find(
              (pr: TPlanPrice) =>
                pr.interval === subData.interval &&
                Number(pr.price) === Number(subData.price),
            ) || null;
          setCurrentPrice(cPrice);
        }
      }
    } catch (error) {
      console.error("Failed to fetch plans or subscription:", error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    setMounted(true);
    fetchPlansAndSubscription();
  }, []);

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--legacy-surface-0f0f0f)] text-[var(--legacy-ink)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--legacy-ink)] mx-auto mb-4"></div>
          <p>Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--legacy-surface-0f0f0f)] text-[var(--legacy-ink)]">
      <div ref={pricingRef} className="container mx-auto px-4 py-8">
        {/* Header */}
        <div>
          <Button type="link" onClick={handleToOrganizationPage}>
            <ArrowLeftOutlined /> Back
          </Button>
        </div>

        {/* Pricing Cards */}
        <ChangePlanCards
          plans={sortedPlans}
          onGetStarted={handleGetStarted}
          currentPlan={currentPlan}
          currentPrice={currentPrice}
        />

        {/* Detailed Comparison Table */}
        <div ref={featureRef}>
          <DetailedComparisonTable plans={sortedPlans} />
        </div>
      </div>
      xx
    </div>
  );
};

export default ChangePackagePage;
