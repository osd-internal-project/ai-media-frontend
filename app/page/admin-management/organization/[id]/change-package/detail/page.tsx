"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Button, Card, message, Spin } from "antd";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { axiosCore } from "@/app/lib/axios/axios";
import PlanServices from "@/app/services/plan.service";
import OrganizationSubscriptionServices from "@/app/services/organization-subscription.service";
import { axiosUser } from "@/app/lib/axios/axios";
import { ArrowLeft } from "lucide-react";
import { TPlanPrice } from "@/app/common/plan.type";
import OrganizationService from "@/app/services/organization.service";

export default function ChangePackageDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = useParams();
  const organizationId = String(id);

  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [planPrice, setPlanPrice] = useState<TPlanPrice | undefined>(undefined);
  const [organization, setOrganization] = useState<any>(undefined);

  const planService = useMemo(() => PlanServices(axiosCore), []);
  const organizationService = useMemo(() => OrganizationService(axiosUser), []);

  useEffect(() => {
    const fetchRequiredData = async () => {
      try {
        const planPriceId = searchParams.get("price");
        if (!planPriceId) {
            router.push(`/page/admin-management/organization/${organizationId}`);
            return;
        }

        const rawPlan = await planService.findPlanWithPrice(planPriceId);
        if (!rawPlan) {
          messageApi.error("Plan not found");
          router.push(`/page/admin-management/organization/${organizationId}/change-package`);
          return;
        }
        setPlanPrice(rawPlan);

        const orgData = await organizationService.findById(organizationId);
        if (orgData) {
            setOrganization(orgData);
        }
      } catch(e) {
         console.error(e)
      }
    };
    fetchRequiredData();
  }, [planService, searchParams, organizationId, router, messageApi]);

  const onConfirm = async () => {
    if (!planPrice || !planPrice.plan) {
      messageApi.error("Please select a plan first");
      return;
    }
    
    setLoading(true);

    try {
      // In backend there are upgrade/downgrade routes. 
      // We will assume "upgrade" for now or use the specific change subscription endpoint.
      await axiosUser.post(`/organization-subscription/upgrade/${organizationId}`, {
         priceId: planPrice.id
      });
      messageApi.success("Package changed successfully!");
      setTimeout(() => {
        router.push(`/page/admin-management/organization/${organizationId}`);
      }, 1000);
    } catch (error: any) {
      console.error("Error changing package:", error);
      let errorMessage = "Failed to change package";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (Array.isArray(error?.response?.data?.message)) {
        errorMessage = error.response.data.message.join(", ");
      } else if (error?.message) {
        errorMessage = error.message;
      }

      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="p-4 ">
      {contextHolder}
      <Spin spinning={loading}>
        <div className="mx-auto">
          <div className="mb-6">
            <Button
              type="text"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={handleCancel}
              className="mb-4 text-gray-400 hover:text-white"
            >
              Back
            </Button>
            <h1 className="text-3xl font-bold text-white mb-2">
              Confirm Package Change
            </h1>
            <p className="text-gray-400">
              Review and confirm the new package for your organization
            </p>
          </div>
          <Card
            className="shadow-lg"
            styles={{
              body: {
                backgroundColor: "#18181b",
                padding: "32px",
              },
            }}
          >
            {/* Organization Info */}
            <div className="mb-6 p-4 bg-[#27272a] rounded-lg border border-[#3f3f46]">
              <h3 className="text-white font-medium mb-3">Organization</h3>
              <div className="text-sm">
                 <p className="text-gray-400">Name</p>
                 <p className="text-white font-semibold">{organization?.name}</p>
              </div>
            </div>

            {/* Selected Plan Details */}
            {planPrice?.plan?.detailJson && (
              <div className="mb-6 p-4 bg-[#27272a] rounded-lg border border-[#3f3f46]">
                <h3 className="text-white font-medium mb-3">
                  Selected Plan: {planPrice.plan.name}
                </h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Max Users</p>
                    <p className="text-white font-semibold">
                      {planPrice.plan.detailJson.maxUserAccess}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Price</p>
                    <p className="text-white font-semibold">
                      {planPrice.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Image</p>
                    <p className="text-white font-semibold">
                      {planPrice.plan.detailJson.imageAllowance}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Credit</p>
                    <p className="text-white font-semibold">
                      {planPrice.plan.detailJson.creditAllowance}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-700">
              <Button type="primary" size="middle" onClick={onConfirm}>
                Confirm Change Package
              </Button>
            </div>
          </Card>
        </div>
      </Spin>
    </div>
  );
}
