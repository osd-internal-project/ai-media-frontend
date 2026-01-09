import React, { useEffect } from "react";
import { Check } from "lucide-react";
import { Plan } from "../../services/plan.service";

interface DetailedComparisonTableProps {
  plans: Plan[];
}

const DetailedComparisonTable: React.FC<DetailedComparisonTableProps> = ({
  plans,
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-16 bg-[#0f0f0f] rounded-lg overflow-hidden border border-[#171717]">
      {isMobile && (
        <div className="block md:hidden">
          <div className="p-4 space-y-6">
            {plans.slice(0, 3).map((plan, planIndex) => (
              <div key={planIndex} className="bg-[#171717] rounded-lg p-4">
                <div className="text-center mb-4 pb-4 border-b border-gray-600">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>

                {(() => {
                  const allCategories = [
                    ...new Set(
                      plans.flatMap(
                        (plan) =>
                          plan.features?.map((f) => f.category || "General") ||
                          []
                      )
                    ),
                  ];

                  return allCategories.map((category) => (
                    <div key={category} className="mb-4">
                      <h4 className="text-gray-400 text-xs font-semibold tracking-wider uppercase mb-3 border-b border-gray-700 pb-2">
                        {category.toUpperCase()}
                      </h4>

                      {(() => {
                        const categoryFeatures = [
                          ...new Set(
                            plans.flatMap(
                              (plan) =>
                                plan.features
                                  ?.filter(
                                    (f) =>
                                      (f.category || "General") === category
                                  )
                                  ?.map((f) => f.text) || []
                            )
                          ),
                        ];

                        return categoryFeatures.map((featureText) => {
                          const hasFeature = plan.features?.some(
                            (f) =>
                              f.text === featureText &&
                              (f.category || "General") === category
                          );
                          const feature = plan.features?.find(
                            (f) =>
                              f.text === featureText &&
                              (f.category || "General") === category
                          );

                          return hasFeature ? (
                            <div
                              key={featureText}
                              className="flex items-center gap-3 mb-2"
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  feature?.isHighlight
                                    ? "bg-green-500"
                                    : "bg-gray-600"
                                }`}
                              >
                                <Check className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-white text-sm">
                                {featureText}
                              </span>
                            </div>
                          ) : null;
                        });
                      })()}
                    </div>
                  ));
                })()}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isMobile && (
        <div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="w-1/4"></th>
                {plans.slice(0, 3).map((plan, index) => (
                  <th
                    key={index}
                    className={`text-center p-6 ${
                      index < 2 ? "border-r border-[#171717]" : ""
                    }`}
                  >
                    <div className="text-white">
                      <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {plan.description}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {plans.length > 0 &&
                (() => {
                  const allCategories = [
                    ...new Set(
                      plans.flatMap(
                        (plan) =>
                          plan.features?.map((f) => f.category || "General") ||
                          []
                      )
                    ),
                  ];

                  return allCategories.map((category) => (
                    <React.Fragment key={category}>
                      <tr className="border-t border-[#171717]">
                        <td colSpan={4} className="p-4 bg-[#171717]">
                          <h4 className="text-gray-400 text-sm font-semibold tracking-wider uppercase">
                            {category.toUpperCase()}
                          </h4>
                        </td>
                      </tr>

                      {(() => {
                        const categoryFeatures = [
                          ...new Set(
                            plans.flatMap(
                              (plan) =>
                                plan.features
                                  ?.filter(
                                    (f) =>
                                      (f.category || "General") === category
                                  )
                                  ?.map((f) => f.text) || []
                            )
                          ),
                        ];

                        return categoryFeatures.map((featureText) => (
                          <tr
                            key={featureText}
                            className="border-t border-[#171717]"
                          >
                            <td className="p-4 text-white font-medium border-r border-[#171717]">
                              {featureText}
                            </td>
                            {plans.slice(0, 3).map((plan, planIndex) => {
                              const hasFeature = plan.features?.some(
                                (f) =>
                                  f.text === featureText &&
                                  (f.category || "General") === category
                              );
                              const feature = plan.features?.find(
                                (f) =>
                                  f.text === featureText &&
                                  (f.category || "General") === category
                              );

                              return (
                                <td
                                  key={planIndex}
                                  className={`p-4 text-center ${
                                    planIndex < 2
                                      ? "border-r border-[#171717]"
                                      : ""
                                  }`}
                                >
                                  {hasFeature ? (
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                                        feature?.isHighlight
                                          ? "bg-green-500"
                                          : "bg-gray-600"
                                      }`}
                                    >
                                      <Check className="w-5 h-5 text-white" />
                                    </div>
                                  ) : null}
                                </td>
                              );
                            })}
                          </tr>
                        ));
                      })()}
                    </React.Fragment>
                  ));
                })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DetailedComparisonTable;
