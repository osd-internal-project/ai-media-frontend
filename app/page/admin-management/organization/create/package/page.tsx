"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Button, Image } from "antd";
import { useRouter } from "next/navigation";
import { axiosCore } from "@/app/lib/axios/axios";
import PlanServices, { Plan } from "@/app/services/plan.service";
import PricingCards from "./components/PricingCards";
import DetailedComparisonTable from "./components/DetailedComparisonTable";
import { ArrowLeftOutlined } from "@ant-design/icons";

const PackagePage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">(
    "monthly",
  );
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const pricingRef = useRef<HTMLDivElement | null>(null);
  const featureRef = useRef<HTMLDivElement | null>(null);

  const planService = useMemo(() => PlanServices(axiosCore), []);

  // Sort plans by price whenever plans state changes
  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => a.price.monthly - b.price.monthly);
  }, [plans]);

  const handleGetStarted = (plan: Plan) => {
    router.push(
      `/page/admin-management/organization/create/detail?plan=${encodeURIComponent(plan.id)}`,
    );
  };

  const handleToOrganizationPage = () => {
    router.push("/page/admin-management/organization");
  };
  const fetchPlans = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await planService.findAllFormatted();

      const sortedPlans = [...data].sort(
        (a: Plan, b: Plan) => a.price.monthly - b.price.monthly,
      );

      setPlans(sortedPlans);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [planService]);

  useEffect(() => {
    setMounted(true);
    fetchPlans();
  }, [fetchPlans]);

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Content */}
      {/* What is AI Cave Section */}

      <div ref={pricingRef} className="container mx-auto px-4 py-8">
        {/* Header */}
        <div>
          <Button type="link" onClick={handleToOrganizationPage}>
            <ArrowLeftOutlined /> Back
          </Button>
        </div>
        <div className="text-center mb-8">
          <div className="inline-flex bg-gray-800 rounded-lg p-1 mb-6">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              MONTHLY
            </button>
            <button
              onClick={() => setBillingPeriod("annually")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === "annually"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              ANNUALLY
              <span className="ml-2 text-xs text-green-400">
                UP TO 50% OFF ⚡
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <PricingCards
          plans={sortedPlans}
          billingPeriod={billingPeriod}
          onGetStarted={handleGetStarted}
        />

        {/* Detailed Comparison Table */}
        <div ref={featureRef}>
          <DetailedComparisonTable plans={sortedPlans} />
        </div>
      </div>
    </div>
  );
};

export default PackagePage;
