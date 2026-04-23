"use client";
import React from "react";
import { Modal, Form, Input, InputNumber, Switch, Divider, message } from "antd";
import { TPlan } from "@/app/common/plan.type";

interface PlanFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (plan: TPlan) => void;
  loading?: boolean;
  initialValues?: Partial<TPlan>;
  title?: string;
  submitText?: string;
}

export const PlanFormModal: React.FC<PlanFormModalProps> = ({
  open,
  onCancel,
  onSuccess,
  loading,
  initialValues,
  title = "Create New Plan",
  submitText = "Create Plan",
}) => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    // Structure data for the API
    const planData = {
      ...values,
      popular: values.popular || false,
      isDefault: values.isDefault || false,
      prices: [
        {
          period: "monthly",
          interval: "MONTH",
          price: values.monthlyPrice || 0,
          duration: 30,
          creditAllowance: 0,
          currency: "THB",
          isDefault: true,
          orderIndex: 0,
        },
        {
          period: "annually",
          interval: "YEAR",
          price: values.annualPrice || 0,
          duration: 365,
          creditAllowance: 0,
          currency: "THB",
          isDefault: false,
          orderIndex: 1,
        },
      ],
      detailJson: {
        maxUserAccess: values.maxUserAccess || 0,
      },
      features: [], // Initial empty features, can be added in detail page
    };
    onSuccess(planData as any);
  };

  React.useEffect(() => {
    if (open) {
      if (initialValues) {
        // Fallback for pricing 
        form.setFieldsValue({
          ...initialValues,
          popular: initialValues.isPopular, 
          maxUserAccess: initialValues.detailJson?.maxUserAccess,
          creditAllowance: initialValues.detailJson?.creditAllowance,
          imageAllowance: initialValues.detailJson?.imageAllowance,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={submitText}
      width={600}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ popular: false, isDefault: false }}
      >
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label="Plan Name"
            rules={[{ required: true, message: "Please input plan name!" }]}
            className="col-span-2"
          >
            <Input placeholder="e.g. Professional, Enterprise" />
          </Form.Item>

          <Form.Item name="description" label="Description" className="col-span-2">
            <Input.TextArea placeholder="Short description of the plan" rows={2} />
          </Form.Item>

          <Form.Item name="badge" label="Badge Text">
            <Input placeholder="e.g. Best Value, New" />
          </Form.Item>

          <Form.Item name="borderColor" label="Border Color (Hex)">
            <Input placeholder="e.g. #3b82f6" />
          </Form.Item>

          <Form.Item name="popular" label="Is Popular" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="isDefault" label="Is Default Plan" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
        <Divider orientation="left">Quotas</Divider>
        <div className="grid grid-cols-1 gap-4">
          <Form.Item name="maxUserAccess" label="Max User Access">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
            <Form.Item name="creditAllowance" label="Package Credit ">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
            <Form.Item name="imageAllowance" label="Package Image ">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};
