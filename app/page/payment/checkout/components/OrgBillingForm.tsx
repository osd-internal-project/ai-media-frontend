"use client";

import React from "react";
import { Button, Form, Input } from "antd";
import type { FormInstance } from "antd";
import { BillingProfileType } from "@/app/common/billing-profile.type";
import TaxInvoiceFields from "./TaxInvoiceFields";

/** Values produced by the org + tax-invoice form. */
export interface OrgBillingFormValues {
  orgName: string;
  orgDescription?: string;
  // Individual
  fullName?: string;
  nationalId?: string;
  // Juristic
  companyName?: string;
  taxId?: string;
  branchCode?: string;
  branchName?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  // Common
  address: string;
}

interface OrgBillingFormProps {
  form: FormInstance;
  type: BillingProfileType;
  setType: (type: BillingProfileType) => void;
  onFinish: (values: OrgBillingFormValues) => void;
  submitLabel?: string;
  loading?: boolean;
}

/**
 * Organization + tax-invoice details form used when creating a brand-new
 * organization during checkout. Shared by the checkout (invoice) flow and the
 * standalone purchase flow so the fields/validation stay in one place.
 */
export default function OrgBillingForm({
  form,
  type,
  setType,
  onFinish,
  submitLabel = "Continue",
  loading = false,
}: OrgBillingFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={(values) => onFinish(values as OrgBillingFormValues)}
    >
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
      <TaxInvoiceFields type={type} setType={setType} />

      <div className="flex justify-end">
        <Button type="primary" htmlType="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </Form>
  );
}
