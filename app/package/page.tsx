"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Button, Image } from "antd";
import { useRouter } from "next/navigation";
import { axiosCore } from "../lib/axios/axios";
import PlanServices from "../services/plan.service";
import PricingCards from "./components/PricingCards";
import DetailedComparisonTable from "./components/DetailedComparisonTable";
import { TPlan } from "../common/plan.type";
import BillingGate from "../components/BillingGate";

const PackagePage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
 
  const [plans, setPlans] = useState<TPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const pricingRef = useRef<HTMLDivElement | null>(null);
  const featureRef = useRef<HTMLDivElement | null>(null);

  const planService = useMemo(() => PlanServices(axiosCore), []);

  // Sort plans by price whenever plans state changes
  const sortedPlans = useMemo(() => {
    return [...plans];
  }, [plans]);

  const handleGetStarted = () => {
    router.push("/signup");
  };
  const handleToLoginPage = () => {
    window.location.href = "/login";
  };

  // Payment-first flow: navigate to the purchase form by priceId. The purchase
  // page is under the protected /page/* matcher, so an unauthenticated click is
  // auto-redirected to /login?callbackUrl=... and returns here after login.
  const handleBuy = (priceId: string) => {
    router.push(`/page/organization/purchase?priceId=${priceId}`);
  };
  const fetchPlans = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await planService.findAllFormatted();

      const sortedPlans = [...data];

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
      <nav className="relative bg-gray-800/50 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex flex-1 items-center justify-between">
              <div className="flex shrink-0 items-center">
                <Image
                  // width="64px"
                  src="/images/logo-1.png"
                  alt="OSD Logo"
                  preview={false}
                />
              </div>
              <div className="flex items-center space-x-2 md:space-x-4">
                <a
                  onClick={() => {
                    pricingRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  className="cursor-pointer rounded-md px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                >
                  Package Price
                </a>
                <a
                  onClick={() => {
                    featureRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  className="cursor-pointer rounded-md px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                >
                  Features
                </a>
                <Button
                  onClick={handleToLoginPage}
                  type="primary"
                  // className="cursor-pointer rounded-md bg-gray-950/50 px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm font-medium text-white hover:bg-gray-800 hover:text-white transition"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Pricing section — Buy enters the payment-first onboarding flow */}
      <div ref={pricingRef} className="max-w-7xl mx-auto mt-12 px-4">
        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-2">
          Choose your plan
        </h2>
        <p className="text-gray-400 mb-8">
          Pick a package and pay to create your organization.
        </p>
        <PricingCards
          plans={sortedPlans}
          onGetStarted={handleGetStarted}
          onBuy={(_, priceId) => handleBuy(priceId)}
        />
      </div>

      {/* Content */}
      {/* What is AI Cave Section */}
      <div className="max-w-7xl mx-auto my-18 px-4">
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40">
          <div className="rounded-3xl bg-[#0B0B0C] px-12 py-12 md:px-16 md:py-14">
            {/* Subtitle */}
            <p className="text-sm uppercase tracking-widest text-purple-400 mb-4">
              What is AI Cave ?
            </p>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-8">
              Your All-in-One AI Media Creation Platform
            </h2>

            {/* Content */}
            <div className="space-y-6 text-gray-300 text-base md:text-lg leading-relaxed">
              <p>
                AI Cave is an all-in-one AI media creation platform that
                empowers creators to generate stunning images, videos, and audio
                in one seamless workspace. With access to premium AI models, you
                can create consistent characters, train personalized models, and
                bring ideas to life with just one click.
              </p>

              <p>
                Designed for speed and efficiency, AI Cave delivers high-quality
                results through parallel generation and professional-grade
                outputs.
              </p>

              <p className="text-gray-200">
                Whether you’re telling stories, building brands, or producing
                content at scale, AI Cave transforms imagination into reality —
                without complexity.
              </p>
            </div>
          </div>
        </div>
      </div>
     
    </div>
  );
};

const GatedPackagePage = () => (
  <BillingGate>
    <PackagePage />
  </BillingGate>
);

export default GatedPackagePage;
