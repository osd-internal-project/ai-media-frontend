"use client";

import React, { useState, useEffect, useMemo } from "react";
import PricingCards from "@/app/components/package/PricingCards";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PlanServices from "@/app/services/plan.service";
import { TPlan, TPlanInterval } from "@/app/common/plan.type";
import { axiosCore } from "@/app/lib/axios/axios";
import { Segmented } from "antd";

function PlanSkeleton() {
  return (
    <div className="mb-10 mt-0 flex w-full flex-col items-center justify-center">
      <div className="mb-6 h-10 w-44 animate-pulse rounded-full bg-(--l-raised) sm:w-56" />
      <div className="flex w-full gap-3 overflow-hidden pb-4 md:grid md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex h-[560px] w-[78vw] max-w-[320px] shrink-0 animate-pulse flex-col overflow-hidden rounded-2xl bg-[#353538] sm:h-[620px] sm:w-[40vw] md:h-[580px] md:w-auto md:max-w-none lg:min-w-0"
          >
            <div className="border-b border-[#4D4D4D] bg-[#4D4D4D] p-5 pb-5 sm:p-8 sm:pb-6">
              <div className="mb-4 h-9 w-32 rounded-full bg-white/12" />
              <div className="mb-2 h-4 w-full rounded-full bg-white/8" />
              <div className="mb-6 h-4 w-4/5 rounded-full bg-white/8" />
              <div className="mb-4 h-8 w-28 rounded-full bg-white/12" />
              <div className="h-10 w-24 rounded-full bg-white/8" />
            </div>
            <div className="flex flex-1 flex-col justify-between bg-[#2A2A2A] px-5 py-6 sm:px-8 sm:py-8">
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((__, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#6966FF]/70" />
                    <div className="h-4 flex-1 rounded-full bg-white/8" />
                  </div>
                ))}
              </div>
              <div className="mt-8 h-10 w-32 rounded-full bg-(--l-raised)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Plan() {
  const router = useRouter();
  const { status } = useSession();
  const [plans, setPlans] = useState<TPlan[]>([]);
  const [interval, setInterval] = useState<TPlanInterval>("MONTH");
  const [loading, setLoading] = useState(true);

  const planService = useMemo(() => PlanServices(axiosCore), []);

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      const priceA = a.prices?.[0]?.price || 0;
      const priceB = b.prices?.[0]?.price || 0;
      return priceA - priceB;
    });
  }, [plans]);

  /**
   * Proceed to payment for the selected plan price. Logged-in users go straight
   * to checkout; anonymous users are sent to login with a callbackUrl so the
   * purchase resumes at checkout after authenticating. Plans without a price for
   * the current interval (free/enterprise) fall back to login/sign-up.
   *
   * @param priceId selected plan-price id, or "" when the plan has no payable price
   */
  const handleGetStarted = (priceId: string) => {
    if (!priceId) {
      window.location.href = "/login";
      return;
    }

    // newOrg=1 → checkout collects org details and creates a brand-new org after payment
    const checkoutUrl = `/page/payment/checkout?priceId=${priceId}&newOrg=1`;
    if (status === "authenticated") {
      router.push(checkoutUrl);
      return;
    }
    // /login is a route handler that redirects to Keycloak — needs a full page load.
    window.location.href = `/login?callbackUrl=${encodeURIComponent(checkoutUrl)}`;
  };

  const fetchPlans = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await planService.findAllFormatted();
      setPlans(data);
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

  return (
    <>
      <section className="landing-container pb-12 pt-12 sm:pb-14 md:pt-16">
        <div className="z-10 w-full overflow-hidden pb-10 pt-8 sm:pb-16 sm:pt-14 ">
          <div className="mx-auto w-full max-w-7xl px-0 sm:px-2 md:px-4">
            <div className="mb-8 text-left sm:mb-12 md:mb-16">
              <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-(--l-ink) md:text-[56px]">
                Pricing Plans
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-(--l-ink-2)">
                Choose the perfect plan for you and your team.
              </p>
            </div>

            {loading ? (
              <PlanSkeleton />
            ) : (
              <div className="mb-10 mt-0 flex flex-col items-center justify-center">
                <div className="mb-5 w-full text-center sm:mb-6">
                  <Segmented
                    value={interval}
                    onChange={(value) => setInterval(value as TPlanInterval)}
                    options={[
                      {
                        label: (
                          <div style={{ padding: 4 }}>
                            <div>Monthly</div>
                          </div>
                        ),
                        value: "MONTH",
                      },
                      {
                        label: (
                          <div style={{ padding: 4 }}>
                            <div>Yearly (-3%)</div>
                          </div>
                        ),
                        value: "YEAR",
                      },
                    ]}
                  />
                </div>
                <div className="w-full">
                  <PricingCards
                    plans={sortedPlans}
                    onGetStarted={handleGetStarted}
                    planInterval={interval}
                    generateManualPrice={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
