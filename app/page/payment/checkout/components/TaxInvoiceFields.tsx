"use client";

import React from "react";
import { Form, Input, Segmented } from "antd";
import { BillingProfileType } from "@/app/common/billing-profile.type";

interface TaxInvoiceFieldsProps {
  type: BillingProfileType;
  setType: (type: BillingProfileType) => void;
}

/**
 * Tax-invoice form fields (profile type toggle + INDIVIDUAL/JURISTIC fields +
 * address). Renders `Form.Item`s only — it must live inside a parent antd
 * `Form`. Shared by the org+billing form and the checkout "enter new" branch.
 */
export default function TaxInvoiceFields({
  type,
  setType,
}: TaxInvoiceFieldsProps) {
  return (
    <>
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
    </>
  );
}
