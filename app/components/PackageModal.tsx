import React, { useEffect, useState, useMemo } from "react";
import { Modal, Image } from "antd";
import { useRouter } from "next/navigation";
import { axiosCore } from "../lib/axios/axios";
import PlanServices, { Plan } from "../services/plan.service";
import PricingCards from "../package/components/PricingCards";
import DetailedComparisonTable from "../package/components/DetailedComparisonTable";

interface PackageModalProps {
  open: boolean;
  onClose: () => void;
  onPlanSelect?: (plan: Plan) => void;
}

const PackageModal: React.FC<PackageModalProps> = ({ open, onClose, onPlanSelect }) => {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly");

  const planService = useMemo(() => PlanServices(axiosCore), []);

  // Sort plans by price whenever plans state changes
  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => a.price.monthly - b.price.monthly);
  }, [plans]);

  const fetchPlans = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await planService.findAllFormatted();
      console.log(data);
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [planService]);

  useEffect(() => {
    if (open) {
      fetchPlans();
    }
  }, [open, fetchPlans]);

  const handleGetStarted = (plan: Plan) => {
    if (onPlanSelect) {
      onPlanSelect(plan);
      onClose();
    } else {
      onClose();
      router.push(`/page/organization/create?plan=${encodeURIComponent(plan.name)}`);
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      centered
      styles={{
        content: {
          backgroundColor: "#0f0f0f",
          border: "1px solid #171717",
        },
        mask: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
        },
      }}
      closeIcon={
        <span className="text-white text-xl hover:text-gray-300">×</span>
      }
    >
      <div className="text-white">
        <div className="text-center mb-8 p-6">
          <div className="flex justify-center mb-4">
            <Image
              width="80px"
              src="/images/Logo.png"
              alt="OSD Logo"
              preview={false}
            />
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Unlock the full potential of AI media creation with our flexible pricing plans.
            Start creating stunning images, videos, and audio content today.
          </p>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex bg-gray-800 rounded-lg p-1">
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

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading plans...</p>
          </div>
        )}

        {!loading && (
          <div className="max-h-[70vh] overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <PricingCards
              plans={sortedPlans}
              billingPeriod={billingPeriod}
              onGetStarted={handleGetStarted}
            />

            {sortedPlans.length > 0 && (
              <div className="mt-12">
                <DetailedComparisonTable plans={sortedPlans} />
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-8 p-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            Need a custom plan? <span className="text-blue-400 cursor-pointer hover:underline">Contact our sales team</span>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default PackageModal;