import React from "react";
import { Check } from "lucide-react";
import { Plan } from "../../services/plan.service";

interface PricingCardsProps {
  plans: Plan[];
  billingPeriod: "monthly" | "annually";
  onGetStarted: () => void;
}

const PricingCards: React.FC<PricingCardsProps> = ({
  plans,
  billingPeriod,
  onGetStarted,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {plans.map((plan, index) => (
        <div
          key={index}
          className={`bg-[#171717] rounded-lg overflow-hidden border-t-4 ${plan.borderColor} relative`}
        >
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white mb-2">
                {plan.name}
              </h3>
              {plan.badge && (
                <span className="bg-pink-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  {plan.badge}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold text-white">
                $
                {billingPeriod === "monthly"
                  ? plan.price.monthly
                  : plan.price.annually}
              </span>
              <span className="text-gray-400 text-sm">/Seat/mo</span>
            </div>
            <button
              onClick={onGetStarted}
              className="w-full bg-[#6c6c6c] hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4"
            >
              Get Started
            </button>
            <p className="text-gray-400 text-sm leading-relaxed">
              {plan.description}
            </p>
          </div>

          <div className="px-6 pb-6">
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
          </div>

          <div className="bg-gray-750 px-6 py-6">
            <div className="space-y-3">
              {plan.features
                .slice(plan.features[1]?.icon === "♾️" ? 2 : 1)
                .map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="flex items-center gap-3"
                  >
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className={`text-gray-300 text-sm ${feature.isHighlight ? 'text-green-400 font-semibold' : ''}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PricingCards;