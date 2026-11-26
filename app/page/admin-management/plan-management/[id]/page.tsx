"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Form, Input, InputNumber, Result, Skeleton, Switch, message, theme } from "antd";
import { ArrowLeft } from "lucide-react";
import PlanServices from "@/app/services/plan.service";
import MasterModelTypeServices from "@/app/services/master-model-type.service";
import { axiosCore } from "@/app/lib/axios/axios";
import { PlanFeaturesEditor } from "./components/PlanFeaturesEditor";
import { PlanPricesEditor } from "./components/PlanPricesEditor";
import { TApplyScope, TPlan, TPlanFeature, TPlanPrice } from "@/app/common/plan.type";
import { TMasterModelType } from "@/app/common/master-model-type.type";
import { sameSet } from "@/app/common/access-codes";
import { StatusTag } from "../../components/admin-ui";
import ApplyImpactModal from "../../components/apply-impact-modal";
import {
  AccessPicker,
  ModelPicker,
  ModelSelection,
  selectionIds,
  selectionOf,
} from "../../components/entitlement-pickers";

const planService = PlanServices(axiosCore);
const modelService = MasterModelTypeServices(axiosCore);
const LIST_URL = "/page/admin-management/plan-management";

const errorText = (error: unknown) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
  "Could not save the plan. Check the connection and try again.";

export default function PlanDetailPage() {
  const { id } = useParams();
  const planId = String(id);
  const isCreate = planId === "create";
  const router = useRouter();
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [original, setOriginal] = useState<TPlan | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [impactOpen, setImpactOpen] = useState(false);
  const [features, setFeatures] = useState<TPlanFeature[]>([]);
  const [prices, setPrices] = useState<TPlanPrice[]>([]);
  const [models, setModels] = useState<TMasterModelType[] | null>(null);
  const [modelSelection, setModelSelection] = useState<ModelSelection>(selectionOf([]));
  const name = Form.useWatch("name", form);
  const status = Form.useWatch("status", form);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    const data = await planService.findById(planId);
    if (data) {
      form.setFieldsValue(data);
      setOriginal(data);
      setFeatures(data.features || []);
      setPrices(data.prices || []);
      setModelSelection(selectionOf(data.allowedModelIds));
      setDirty(false);
    } else {
      setLoadFailed(true);
    }
    setLoading(false);
  }, [form, planId]);

  useEffect(() => {
    if (!isCreate) fetchPlan();
    modelService
      .findAll()
      .then(setModels)
      .catch(() => {
        setModels([]);
        messageApi.error("Could not load AI models.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const change = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setDirty(true);
  };

  const save = async (scope?: TApplyScope) => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        ...values,
        prices,
        features,
        allowedModelIds: selectionIds(modelSelection),
        ...(scope && { applyToOrganizations: scope }),
      };
      if (isCreate) {
        const created = await planService.create(payload);
        messageApi.success("Plan created");
        if (created?.id) router.replace(`${LIST_URL}/${created.id}`);
        return;
      }
      const updated = await planService.update(planId, payload);
      const applied = updated?.appliedOrganizations ?? 0;
      messageApi.success(applied > 0 ? `Plan saved and copied to ${applied} organizations` : "Plan saved");
      setImpactOpen(false);
      fetchPlan();
    } catch (error) {
      messageApi.error(errorText(error));
    } finally {
      setSaving(false);
    }
  };

  // ถ้า Access หรือ model เปลี่ยน ต้องถามก่อนว่าจะคัดลอกไป org ไหน (ไม่มี org เปลี่ยนแบบเงียบ ๆ)
  const onSaveClick = async () => {
    try {
      await form.validateFields();
    } catch {
      messageApi.error("Fill in the required fields first.");
      return;
    }
    const entitlementsChanged =
      !!original &&
      (!sameSet(form.getFieldValue("accessCodes"), original.accessCodes) ||
        !sameSet(selectionIds(modelSelection), original.allowedModelIds));
    if (entitlementsChanged) setImpactOpen(true);
    else save();
  };

  if (loadFailed) {
    return (
      <Result
        status="warning"
        title="Could not load this plan"
        extra={[
          <Button key="retry" onClick={fetchPlan}>Try again</Button>,
          <Link key="back" href={LIST_URL}>Back to plans</Link>,
        ]}
      />
    );
  }
  if (loading) return <Skeleton active className="p-4" />;

  const muted = { color: token.colorTextSecondary };

  return (
    <div className="flex w-full flex-col gap-3">
      {contextHolder}

      <header className="flex flex-wrap items-center gap-2">
        <Link
          href={LIST_URL}
          aria-label="Back to plans"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full"
          style={muted}
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-xl font-semibold" style={{ color: token.colorTextBase }}>
          {isCreate ? "New plan" : name || original?.name}
        </h1>
        {!isCreate && <StatusTag tone={status ? "success" : "neutral"}>{status ? "Active" : "Draft"}</StatusTag>}
        {original?.isDefault && <StatusTag tone="primary">Default for new users</StatusTag>}
      </header>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={() => setDirty(true)}
        initialValues={{ popular: false, isDefault: false, status: false, accessCodes: [] }}
        className="flex max-w-6xl flex-col gap-3"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Card title="Basic information">
            <Form.Item name="name" label="Plan name" rules={[{ required: true, message: "Enter a plan name" }]}>
              <Input placeholder="Professional" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="Best for power users" />
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="badge" label="Badge">
                <Input placeholder="Best value" />
              </Form.Item>
              <Form.Item name="borderColor" label="Border color">
                <Input placeholder="#6D5DF5" />
              </Form.Item>
            </div>
            <div className="flex flex-wrap gap-x-8">
              <Form.Item name="status" label="Active" valuePropName="checked" className="mb-0">
                <Switch />
              </Form.Item>
              <Form.Item name="popular" label="Popular" valuePropName="checked" className="mb-0">
                <Switch />
              </Form.Item>
              <Form.Item
                name="isDefault"
                label="Default plan"
                valuePropName="checked"
                className="mb-0"
                tooltip="Personal organizations compare their access and models with this plan"
              >
                <Switch />
              </Form.Item>
            </div>
          </Card>

          <Card title="Quotas">
            <Form.Item name={["detailJson", "maxUserAccess"]} label="User limit" extra="Copied to an organization when it starts this plan.">
              <InputNumber className="w-full" min={0} addonAfter="seats" />
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name={["detailJson", "creditAllowance"]} label="Credit allowance">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
              <Form.Item name={["detailJson", "imageAllowance"]} label="Image allowance">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </div>
          </Card>
        </div>

        <Card title="Access">
          <Form.Item name="accessCodes" className="mb-0">
            <AccessPicker />
          </Form.Item>
        </Card>

        <Card title="AI models">
          <ModelPicker models={models} value={modelSelection} onChange={change(setModelSelection)} />
        </Card>

        <PlanPricesEditor prices={prices} onChange={change(setPrices)} />
        <PlanFeaturesEditor features={features} onChange={change(setFeatures)} />
      </Form>

      <div
        className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-2 py-3"
        style={{ background: token.colorBgLayout, borderTop: `1px solid ${token.colorBorderSecondary}` }}
      >
        {dirty && <span className="mr-auto text-xs" style={muted}>มีการแก้ที่ยังไม่บันทึก</span>}
        {!isCreate && (
          <Button onClick={fetchPlan} disabled={!dirty || saving}>
            ยกเลิก
          </Button>
        )}
        <Button type="primary" onClick={onSaveClick} loading={saving && !impactOpen} disabled={!isCreate && !dirty}>
          {isCreate ? "สร้าง plan" : "บันทึก"}
        </Button>
      </div>

      <ApplyImpactModal
        open={impactOpen}
        plans={[{ id: planId, name: name || original?.name || "plan" }]}
        saving={saving}
        onCancel={() => setImpactOpen(false)}
        onConfirm={(scope) => save(scope)}
      />
    </div>
  );
}
