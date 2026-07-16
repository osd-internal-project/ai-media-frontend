"use client";
import React, { useEffect, useRef, useState } from "react";
import { TPlan, TPlanFeature, TPlanInterval } from "@/app/common/plan.type";
import { Button } from "antd";

interface PricingCardsProps {
  plans: TPlan[];
  planInterval: TPlanInterval;
  onGetStarted: (plan: string) => void;
  generateManualPrice?: boolean;
}

const PricingCards: React.FC<PricingCardsProps> = ({
  plans,
  planInterval = "MONTH",
  onGetStarted,
  generateManualPrice = false,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [edgePadding, setEdgePadding] = useState(16);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (window.innerWidth >= 768) return;

    const card = el.querySelector(".pricing-card") as HTMLElement;
    if (!card) return;

    const nextEdgePadding = Math.max(
      16,
      (el.clientWidth - card.clientWidth) / 2,
    );

    setEdgePadding(nextEdgePadding);

    window.requestAnimationFrame(() => {
      el.scrollTo({ left: 0, behavior: "auto" });
    });
  }, [plans.length]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const card = el.querySelector(".pricing-card") as HTMLElement;
    if (!card) return;

    const gap = 8; // 🔥 ลด gap mobile
    const amount = card.offsetWidth + gap;

    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full">
      {/* 🔥 ARROWS (mobile only) */}
      <button
        onClick={() => scroll("left")}
        className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center"
      >
        ‹
      </button>

      <button
        onClick={() => scroll("right")}
        className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center"
      >
        ›
      </button>

      {/* CONTAINER */}
      <div
        ref={scrollRef}
        className="
          flex w-full snap-x snap-mandatory gap-2 overflow-x-auto pb-4
          md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:snap-none
          lg:grid-cols-4
        "
        style={{
          WebkitOverflowScrolling: "touch",
          paddingLeft: edgePadding,
          paddingRight: edgePadding,
        }}
      >
        {plans.map((plan, index) => {
          return (
            <div
              key={index}
              className="
                pricing-card
                relative flex w-[78vw] min-w-[240px] shrink-0 snap-center
                flex-col overflow-hidden rounded-2xl bg-[#353538]
                font-clash shadow-lg
                sm:w-[360px] md:min-w-0 md:w-full
                md:px-0
                sm:px-4
              "
            >
              {/* HEADER */}
              <div className=" min-h-[280px] border-b border-[#4D4D4D] bg-[#4D4D4D] p-4 pb-4 sm:p-8 sm:pb-6">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="mb-0 text-[22px] font-medium tracking-tight text-white sm:text-[32px]">
                    {plan.name}
                  </h3>
                </div>

                <div
                  className="mb-5 text-[13px] leading-snug text-[#D4D4D4] sm:text-[15px]"
                  dangerouslySetInnerHTML={{ __html: plan.description || "" }}
                />

                <div className="mb-2">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="text-[18px] font-bold tracking-tight text-white sm:text-[22px]">
                      {Number(
                        plan.detailJson?.creditAllowance || 0,
                      ).toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#A3A3A3] sm:text-[11px]">
                      CREDITS/MONTH
                    </span>
                  </div>

                  {plan.prices
                    .filter((price) => price.interval === planInterval)
                    .map(
                      (price) =>
                        price.price > 0 && (
                          <div key={price.id} className="flex flex-col">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[20px] font-bold tracking-tight text-white sm:text-[24px]">
                                {Number(price.price).toLocaleString()}
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-[#A3A3A3] sm:text-[11px]">
                                BAHT
                              </span>
                            </div>
                            <div className="mt-[1px] text-[9px] font-bold uppercase tracking-widest text-[#A3A3A3]">
                              PER {price.interval}
                            </div>
                          </div>
                        ),
                    )}
                </div>
              </div>

              {/* BODY */}
              <div className="flex flex-grow flex-col justify-between bg-[#2A2A2A] px-4 py-5 sm:px-8 sm:py-8">
                <div className="mb-6 flex flex-col sm:mb-10">
                  {(() => {
                    const groupedFeatures = plan.features.reduce(
                      (acc, feature) => {
                        const cat = feature.category || "";
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(feature);
                        return acc;
                      },
                      {} as Record<string, TPlanFeature[]>,
                    );

                    return Object.entries(groupedFeatures).map(
                      ([category, items], idx) => (
                        <div
                          key={category || idx}
                          className={
                            idx === 0 && !category ? "" : "mt-4 sm:mt-8"
                          }
                        >
                          {category && (
                            <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-[#A3A3A3] sm:mb-4 sm:text-[11px]">
                              {category}
                            </div>
                          )}

                          <div className="space-y-2 sm:space-y-4">
                            {items.map((feature, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <div className="w-[4px] h-[4px] bg-[#6966FF] mt-2 rounded-[1px]" />
                                <span className="text-[11px] text-[#D4D4D4] sm:text-[13px]">
                                  {feature.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    );
                  })()}
                </div>{" "}
                <div className="mt-6">
                  {generateManualPrice ? (
                    plan.prices
                      .filter((p) => p.interval === planInterval)
                      .map((price) => (
                        <div key={price.id} className="mt-3">
                          <Button
                            size="large"
                            type="primary"
                            onClick={() => onGetStarted(price.id || "")}
                          >
                            Admin Get Started
                          </Button>
                        </div>
                      ))
                  ) : (
                    // Public CTA: select this plan's price for the current
                    // interval and proceed to payment. Falls back to an empty
                    // id (free/enterprise plans) so the parent can redirect.
                    <Button
                      block
                      size="large"
                      type="primary"
                      onClick={() =>
                        onGetStarted(
                          plan.prices.find((p) => p.interval === planInterval)
                            ?.id || "",
                        )
                      }
                    >
                      Get Started
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* HINT */}
      <div className="md:hidden text-center text-white/40 text-[11px] mt-2">
        ← swipe →
      </div>
    </div>
  );
};

export default PricingCards;
