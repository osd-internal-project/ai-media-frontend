"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Form, Spin, message } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { axiosUser, axiosCore } from "@/app/lib/axios/axios";
import PurchaseServices from "@/app/services/purchase.service";
import PlanServices from "@/app/services/plan.service";
import { BillingProfileType } from "@/app/common/billing-profile.type";
import { ICreatePurchase } from "@/app/common/purchase.type";
import { TPlanPrice } from "@/app/common/plan.type";
import OrgBillingForm, {
  OrgBillingFormValues,
} from "@/app/page/payment/checkout/components/OrgBillingForm";

const formatTHB = (v: number | string) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(Number(v));

/** Org + tax-invoice form keyed by priceId. Creates an order then goes to /payment. */
export default function PurchaseClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const priceId = searchParams.get("priceId") ?? "";
  const purchaseService = useMemo(() => PurchaseServices(axiosUser), []);
  const planService = useMemo(() => PlanServices(axiosCore), []);
  const userId = session?.user?.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [price, setPrice] = useState<TPlanPrice | null>(null);
  const [type, setType] = useState<BillingProfileType>("INDIVIDUAL");

  useEffect(() => {
    const load = async () => {
      if (!priceId) {
        setLoading(false);
        return;
      }
      const p = await planService.findPlanWithPrice(priceId);
      setPrice(p);
      setLoading(false);
    };
    load();
  }, [priceId, planService]);

  const handleSubmit = async (values: OrgBillingFormValues) => {
    if (!userId || !priceId) {
      messageApi.error("Missing user or package information");
      return;
    }
    setSubmitting(true);
    try {
      const payload: ICreatePurchase = {
        userId,
        planPriceId: priceId,
        org: {
          name: values.orgName,
          description: values.orgDescription || undefined,
          type: "team",
        },
        billing: {
          type,
          address: values.address,
          fullName: values.fullName,
          nationalId: values.nationalId,
          companyName: values.companyName,
          taxId: values.taxId,
          branchCode: values.branchCode,
          branchName: values.branchName,
          contactName: values.contactName,
          phone: values.phone,
          email: values.email,
        },
      };
      const order = await purchaseService.create(payload);
      router.push(`/payment?orderId=${order.id}`);
    } catch {
      messageApi.error("Failed to create order");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!priceId || !price) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        {contextHolder}
        <Card>
          <p className="text-[var(--legacy-gray-300)]">
            No package selected. Please pick a package first.
          </p>
          <Button
            type="primary"
            className="mt-4"
            onClick={() => router.push("/package")}
          >
            Back to packages
          </Button>
        </Card>
      </div>
    );
  }

  const subTotal = Number(price.price);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      {contextHolder}
      <h1 className="text-2xl font-bold text-[var(--legacy-ink)]">Create Your Organization</h1>
      <p className="text-[var(--legacy-gray-400)]">
        Enter your organization and tax-invoice details. Your organization is
        created after payment is confirmed.
      </p>

      <Card size="small" className="mb-2">
        <div className="flex justify-between text-[var(--legacy-gray-300)]">
          <span>Selected package</span>
          <span className="text-[var(--legacy-ink)] font-medium">
            {price.interval} · {formatTHB(subTotal)}
          </span>
        </div>
        <div className="flex justify-between text-[var(--legacy-gray-300)]">
          <span>VAT 7%</span>
          <span>{formatTHB(subTotal * 0.07)}</span>
        </div>
        <div className="flex justify-between font-semibold text-[var(--legacy-ink)]">
          <span>Total</span>
          <span>{formatTHB(subTotal * 1.07)}</span>
        </div>
      </Card>

      <Card size="small">
        <OrgBillingForm
          form={form}
          type={type}
          setType={setType}
          onFinish={handleSubmit}
          submitLabel="Continue to Payment"
          loading={submitting}
        />
      </Card>
    </div>
  );
}
