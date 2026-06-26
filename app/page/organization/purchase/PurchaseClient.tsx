"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Segmented,
  Spin,
  message,
} from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { axiosUser, axiosCore } from "@/app/lib/axios/axios";
import PurchaseServices from "@/app/services/purchase.service";
import PlanServices from "@/app/services/plan.service";
import { BillingProfileType } from "@/app/common/billing-profile.type";
import { ICreatePurchase } from "@/app/common/purchase.type";
import { TPlanPrice } from "@/app/common/plan.type";

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

  const handleSubmit = async (values: Record<string, unknown>) => {
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
          name: values.orgName as string,
          description: (values.orgDescription as string) || undefined,
          type: "team",
        },
        billing: {
          type,
          address: values.address as string,
          fullName: values.fullName as string | undefined,
          nationalId: values.nationalId as string | undefined,
          companyName: values.companyName as string | undefined,
          taxId: values.taxId as string | undefined,
          branchCode: values.branchCode as string | undefined,
          branchName: values.branchName as string | undefined,
          contactName: values.contactName as string | undefined,
          phone: values.phone as string | undefined,
          email: values.email as string | undefined,
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
          <p className="text-gray-300">
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
      <h1 className="text-2xl font-bold text-white">Create Your Organization</h1>
      <p className="text-gray-400">
        Enter your organization and tax-invoice details. Your organization is
        created after payment is confirmed.
      </p>

      <Card size="small" className="mb-2">
        <div className="flex justify-between text-gray-300">
          <span>Selected package</span>
          <span className="text-white font-medium">
            {price.interval} · {formatTHB(subTotal)}
          </span>
        </div>
        <div className="flex justify-between text-gray-300">
          <span>VAT 7%</span>
          <span>{formatTHB(subTotal * 0.07)}</span>
        </div>
        <div className="flex justify-between font-semibold text-white">
          <span>Total</span>
          <span>{formatTHB(subTotal * 1.07)}</span>
        </div>
      </Card>

      <Card size="small">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <p className="text-white font-semibold mb-2">Organization</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Form.Item
              label="Organization Name"
              name="orgName"
              rules={[{ required: true, message: "Organization name is required" }]}
            >
              <Input placeholder="My Company" />
            </Form.Item>
            <Form.Item label="Description" name="orgDescription">
              <Input placeholder="Optional" />
            </Form.Item>
          </div>

          <p className="text-white font-semibold mt-2 mb-2">
            Tax Invoice Information
          </p>
          <Form.Item label="Profile Type">
            <Segmented
              value={type}
              onChange={(v) => setType(v as BillingProfileType)}
              options={[
                { label: "Individual", value: "INDIVIDUAL" },
                { label: "Juristic (Company)", value: "JURISTIC" },
              ]}
            />
          </Form.Item>

          {type === "INDIVIDUAL" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[{ required: true, message: "Full name is required" }]}
              >
                <Input placeholder="Full name" />
              </Form.Item>
              <Form.Item
                label="National ID"
                name="nationalId"
                rules={[
                  { required: true, message: "National ID is required" },
                  { len: 13, message: "National ID must be 13 digits" },
                ]}
              >
                <Input placeholder="13-digit national ID" maxLength={13} />
              </Form.Item>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item
                label="Company Name"
                name="companyName"
                rules={[{ required: true, message: "Company name is required" }]}
              >
                <Input placeholder="Company name" />
              </Form.Item>
              <Form.Item
                label="Tax ID"
                name="taxId"
                rules={[
                  { required: true, message: "Tax ID is required" },
                  { len: 13, message: "Tax ID must be 13 digits" },
                ]}
              >
                <Input placeholder="13-digit tax ID" maxLength={13} />
              </Form.Item>
              <Form.Item
                label="Branch Code"
                name="branchCode"
                rules={[{ required: true, message: "Branch code is required" }]}
                tooltip="Head office = 00000"
              >
                <Input placeholder="e.g. 00000 (head office)" />
              </Form.Item>
              <Form.Item label="Branch Name" name="branchName">
                <Input placeholder="Branch name" />
              </Form.Item>
              <Form.Item
                label="Contact Name"
                name="contactName"
                rules={[{ required: true, message: "Contact name is required" }]}
              >
                <Input placeholder="Contact person" />
              </Form.Item>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[{ required: true, message: "Phone is required" }]}
              >
                <Input placeholder="Phone number" />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Invalid email" },
                ]}
              >
                <Input placeholder="billing@company.com" />
              </Form.Item>
            </div>
          )}

          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: "Address is required" }]}
          >
            <Input.TextArea rows={3} placeholder="Full billing address" />
          </Form.Item>

          <div className="flex justify-end">
            <Button type="primary" htmlType="submit" loading={submitting}>
              Continue to Payment
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
