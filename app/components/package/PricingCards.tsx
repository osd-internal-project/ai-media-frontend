import React from "react";

import { TPlan, TPlanFeature, TPlanInterval } from "@/app/common/plan.type";
import { Button } from "antd";
// import { TPlan } from "@/app/common/plan.type";

interface PricingCardsProps {
  plans: TPlan[];
  planInterval: TPlanInterval;

  // billingPeriod: "monthly" | "annually";
  onGetStarted: (plan: string) => void;
  generateManualPrice?: boolean;
}

const PricingCards: React.FC<PricingCardsProps> = ({
  plans,
  planInterval = "MONTH",
  // billingPeriod,
  onGetStarted,
  generateManualPrice = false,
}) => {
  const getBorderClass = (borderColor: string | undefined) => {
    const classMap: Record<string, string> = {
      "border-blue-500": "border-t-blue-500",
      "border-purple-500": "border-t-purple-500",
      "border-pink-500": "border-t-pink-500",
      "border-green-500": "border-t-green-500",
      "border-yellow-500": "border-t-yellow-500",
      "border-red-500": "border-t-red-500",
      "border-indigo-500": "border-t-indigo-500",
      "border-cyan-500": "border-t-cyan-500",
      "border-orange-500": "border-t-orange-500",
      "border-teal-500": "border-t-teal-500",
      "border-gray-500": "border-t-gray-500",
    };
    return classMap[borderColor || ""] || "border-t-blue-500";
  };

  return (
    <div className="flex flex-nowrap gap-3 w-full pb-4">
      {plans.map((plan, index) => {
        // const borderClass = getBorderClass(plan.borderColor ?? undefined);

        return (
          <div
            key={index}
            className="shrink-0 bg-[#353538] rounded-2xl overflow-hidden relative w-[80vw] sm:w-[40vw] md:w-[320px] lg:w-[calc(25%-0.75rem)] max-w-[320px] shadow-lg flex flex-col font-clash"
          >
            <div className="p-8 pb-6 bg-[#4D4D4D] border-b border-[#4D4D4D]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[32px] tracking-tight font-medium text-white mb-0">
                  {plan.name}
                </h3>
                {/* {plan.badge && (
                  <span className="item-top bg-pink-500 text-[10px] text-white text-xs px-3 py-1 rounded-full font-semibold">
                    {plan.badge}
                  </span>
                )} */}
              </div>
              {/* <div className="flex items-baseline gap-1 mb-4">
                <span className="text-g font-bold text-white">
              {plan.detailJson?.imageAllowance || 0 } Image {plan.detailJson?.creditAllowance || 0} Credit</span>
                <span className="text-gray-400 text-sm">
                / {plan.detailJson?.duration || 0} {plan.detailJson?.unit === "day" ?"Day" : plan.detailJson?.unit === "year" ? "Year" : "Month"}
                </span>
              </div> */}
              {/* <div className="  w-full bg-[#6c6c6c]  text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4">
                Contact Sale
              </div>
              {/*Add Organization*/}

              <div
                className="text-[#D4D4D4] text-[15px] leading-snug mb-6"
                dangerouslySetInnerHTML={{ __html: plan.description || "" }}
              />

              <div className="mb-2">
                <div className="flex items-baseline gap-2 mb-4 items-center">
                  <span className="text-[22px] font-bold text-white tracking-tight">
                    {Number(
                      plan.detailJson?.creditAllowance || 0,
                    ).toLocaleString()}
                  </span>
                  <span className="text-[#A3A3A3] text-[11px] font-bold tracking-widest uppercase">
                    CREDITS/MONTH
                  </span>
                </div>

                {plan.prices
                  .filter((price) => price.interval === planInterval)
                  .map((price) => {
                    return (
                      price.price !== undefined &&
                      price.price !== null &&
                      price.price > 0 && (
                        <div key={price.id} className="flex flex-col">
                          <div className="flex items-baseline gap-2 items-center">
                            <span className="text-[24px] font-bold text-white tracking-tight">
                              {Number(price.price).toLocaleString()}
                            </span>
                            <span className="text-[#A3A3A3] text-[11px] font-bold tracking-widest uppercase">
                              BAHT
                            </span>
                          </div>
                          <div className="text-[#A3A3A3] text-[10px] font-bold tracking-widest uppercase mt-[1px]">
                            PER {price.interval}
                          </div>
                        </div>
                      )
                    );
                  })}
              </div>
            </div>

            {/* <div className="px-6 pb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-green-400">
                    {plan.features[0]?.icon || "💳"}
                  </span>
                  <span className="text-green-400 font-medium">
                    {plan.features[0]?.text || "No credits specified"}
                  </span>
                </div>

                {plan.features[1]?.icon === "♾️" && (
                  <div className="flex items-center gap-3">
                    <span className="text-green-400">
                      {plan.features[1].icon}
                    </span>
                    <span className="text-green-400 font-medium">
                      {plan.features[1].text}
                    </span>
                  </div>
                )}
              </div>
            </div> */}

            <div className="bg-[#2A2A2A] px-8 py-8 flex-grow flex flex-col justify-between">
              <div className="flex flex-col mb-10">
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
                        className={idx === 0 && !category ? "" : "mt-8"}
                      >
                        {category && (
                          <div className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-4">
                            {category}
                          </div>
                        )}
                        <div className="space-y-4">
                          {items.map((feature, featureIndex) => (
                            <div
                              key={featureIndex}
                              className="flex items-start gap-3"
                            >
                              <div className="w-[4px] h-[4px] bg-[#6966FF] mt-2 flex-shrink-0 rounded-[1px]"></div>
                              <span
                                className={`text-[#D4D4D4] text-[13px] leading-snug ${
                                  feature.isHighlight
                                    ? "text-[#6966FF] font-medium"
                                    : ""
                                }`}
                              >
                                {feature.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  );
                })()}{" "}
                <div className="mt-8">
                  {!generateManualPrice && (
                    <button
                      className="bg-[#6966FF] text-black font-semibold text-[14px] px-8 py-2.5 rounded-full hover:bg-[#5A55CC] transition-colors"
                      // onClick={() => {
                      //   const priceId = plan.prices.filter(
                      //     (p) => p.interval === planInterval,
                      //   )[0]?.id;
                      //   onGetStarted(priceId || "");
                      // }}
                      hidden
                    >
                      See more
                    </button>
                  )}
                  {generateManualPrice &&
                    plan.prices
                      .filter((price) => price.interval === planInterval)
                      .map((price) => {
                        return (
                          <div key={price.id} className="mt-4">
                            <Button
                              size="large"
                              color="blue"
                              type="primary"
                              onClick={() => onGetStarted(price.id || "")}
                            >
                              Admin Get Started
                            </Button>
                          </div>
                        );
                      })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PricingCards;
