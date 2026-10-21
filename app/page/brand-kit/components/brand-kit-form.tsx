"use client";

import React from "react";
import { Form, Input, Select, Typography } from "antd";
import type { FormInstance } from "antd/es/form";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";

type BrandKitFormProps = {
  form: FormInstance;
  mode?: 'create' | 'edit';
};

export default function BrandKitForm({
  form,
  mode = 'create',
}: BrandKitFormProps) {
  const { mode: themeMode } = useThemeMode();
  const hintColor =
    themeMode === "dark"
      ? "#9ca3af"
      : getThemeConfig(themeMode).token?.colorTextSecondary;
  return (
    <>
      <Typography.Text style={{ color: hintColor, marginBottom: 12, display: "block" }}>
        {mode === 'edit'
          ? 'Edit your brand kit information.'
          : 'Create a new brand kit to store your brand identity and CI.'}
      </Typography.Text>

      <Form layout="vertical" form={form}>
        <Form.Item
          label="Brand / Kit Name"
          name="name"
          rules={[{ required: true, message: "Please enter brand kit name" }]}
        >
          <Input placeholder="e.g. Acme Corp Brand" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input placeholder="Brief description of this brand kit" />
        </Form.Item>

        <Form.Item
          label="Industry"
          name="industry"
          rules={[{ required: true, message: "Please select industry" }]}
        >
          <Select
            placeholder="Select industry..."
            options={[
              { label: "Technology / AI", value: "Technology / AI" },
              { label: "Corporate / Finance", value: "Corporate / Finance" },
              { label: "Retail / E-commerce", value: "Retail / E-commerce" },
              { label: "Education", value: "Education" },
            ]}
          />
        </Form.Item>
      </Form>
    </>
  );
}