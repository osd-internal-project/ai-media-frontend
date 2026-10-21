"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Button, Card, Form, Input, message, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { axiosCore } from "@/app/lib/axios/axios";
import OrganizationService from "@/app/services/organization.service";
import PlanServices from "@/app/services/plan.service";
import UserServices from "@/app/services/users.service";
import { axiosUser } from "@/app/lib/axios/axios";
import { ArrowLeft } from "lucide-react";
import { TPlan, TPlanPrice } from "@/app/common/plan.type";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [planPrice, setPlanPrice] = useState<TPlanPrice | undefined>(undefined);
  // const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const organizationService = OrganizationService(axiosUser);
  const userServices = UserServices(axiosUser);

  const planService = useMemo(() => PlanServices(axiosCore), []);

  useEffect(() => {
    const fetchPlans = async () => {
      const planPriceId = searchParams.get("price");
      const raw = await planService.findPlanWithPrice(planPriceId || "");
      if (!raw) {
        messageApi.error("Plan not found");
        router.push("/page/admin-management/organization");
        return;
      }
      setPlanPrice(raw);
    };
    fetchPlans();
  }, [planService, searchParams]);

  const onFinish = async (values: any) => {
    if (!planPrice || !planPrice.plan) {
      messageApi.error("Please select a plan first");
      return;
    }
    const plan = planPrice.plan;
    setLoading(true);

    try {
      const userDetail = await userServices.findDetailByToken(
        session?.user?.id as string,
      );

      const payload = {
        ...values,
        planId: plan?.id || "",
        priceId: planPrice?.id || "",
        type: "team",
        createdById: userDetail?.userId || "",
        // slug: values.name.toLowerCase().replace(/ /g, "-"),
      };

      // console.log("Payload being sent:", payload);

      const response = await organizationService.createBySystemAdmin(payload);

      if (response) {
        messageApi.success("Organization created successfully!");
        setTimeout(() => {
          router.push("/page/admin-management/organization");
        }, 1000);
      }
    } catch (error: any) {
      console.error("Error creating organization:", error);
      console.error("Error response:", error?.response?.data);

      let errorMessage = "Failed to create organization";

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
              className="mb-4 text-[var(--legacy-gray-400)] hover:text-[var(--legacy-ink)]"
            >
              Back
            </Button>
            <h1 className="text-3xl font-bold text-[var(--legacy-ink)] mb-2">
              Create Organization
            </h1>
            <p className="text-[var(--legacy-gray-400)]">
              Set up a new team organization with custom package allocations
            </p>
          </div>
          <Card
            className="shadow-lg"
            styles={{
              body: {
                backgroundColor: "var(--legacy-surface-18181b)",
                padding: "32px",
              },
            }}
          >
            {/* Selected Plan Details */}
            {planPrice?.plan?.detailJson && (
              <div className="mb-6 p-4 bg-[var(--legacy-panel-27272a)] rounded-lg border border-[var(--legacy-line-3f3f46)]">
                <h3 className="text-[var(--legacy-ink)] font-medium mb-3">
                  Selected Plan: {planPrice.plan.name}
                </h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-[var(--legacy-gray-400)]">Max Users</p>
                    <p className="text-[var(--legacy-ink)] font-semibold">
                      {planPrice.plan.detailJson.maxUserAccess}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--legacy-gray-400)]">Price</p>
                    <p className="text-[var(--legacy-ink)] font-semibold">
                      {planPrice.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--legacy-gray-400)]">Image</p>
                    <p className="text-[var(--legacy-ink)] font-semibold">
                      {planPrice.plan.detailJson.imageAllowance}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--legacy-gray-400)]">Credit</p>
                    <p className="text-[var(--legacy-ink)] font-semibold">
                      {planPrice.plan.detailJson.creditAllowance}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <Form
              form={form}
              layout="vertical"
              name="create_org_form"
              onFinish={onFinish}
              initialValues={{
                packageTokenAmount: 0,
                packageImageAmount: 0,
                maxUserAccess: 1,
              }}
            >
              <Form.Item
                label={
                  <span className="text-[var(--legacy-ink)] font-medium">
                    Organization Name
                  </span>
                }
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please enter organization name",
                  },
                  {
                    min: 3,
                    message: "Organization name must be at least 3 characters",
                  },
                ]}
              >
                <Input
                  placeholder="Enter organization name"
                  size="middle"
                  className="bg-[var(--legacy-panel-27272a)] border-[var(--legacy-line-3f3f46)] text-[var(--legacy-ink)]"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-[var(--legacy-ink)] font-medium">Description</span>
                }
                name="description"
              >
                <Input.TextArea
                  rows={3}
                  size="middle"
                  placeholder="Optional description"
                  className="bg-[var(--legacy-panel-27272a)] border-[var(--legacy-line-3f3f46)] text-[var(--legacy-ink)]"
                />
              </Form.Item>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[var(--legacy-line-gray-700)]">
                <Button type="primary" size="middle" htmlType="submit">
                  Create Organization
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </Spin>
    </div>
  );
}
