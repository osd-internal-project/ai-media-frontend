"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Checkbox, Empty, Skeleton, message, theme } from "antd";
import { TApplyScope, TPlan } from "@/app/common/plan.type";
import { TMasterModelType } from "@/app/common/master-model-type.type";
import { ACCESS_CODE_GROUPS, MODEL_TYPE_LABELS, sameSet } from "@/app/common/access-codes";
import PlanServices from "@/app/services/plan.service";
import { axiosCore } from "@/app/lib/axios/axios";
import { StatusTag } from "../../components/admin-ui";
import ApplyImpactModal from "../../components/apply-impact-modal";
import { groupModels, modelLabel } from "../../components/entitlement-pickers";

const planService = PlanServices(axiosCore);
const ALL_MODELS_ACCENT = "#0FEAB6";

interface Entitlements {
  accessCodes: string[];
  /** ว่าง = ทุก model ที่ active */
  allowedModelIds: number[];
}

interface Props {
  plans: TPlan[];
  models: TMasterModelType[] | null;
  onSaved: () => void;
}

const entitlementsOf = (plans: TPlan[]) =>
  Object.fromEntries(
    plans.map((plan) => [plan.id, { accessCodes: plan.accessCodes ?? [], allowedModelIds: plan.allowedModelIds ?? [] }]),
  ) as Record<string, Entitlements>;

const toggle = <T,>(values: T[], value: T, on: boolean) =>
  on ? [...values.filter((item) => item !== value), value] : values.filter((item) => item !== value);

/** แถว = Access + model, คอลัมน์ = plan; แก้หลาย plan แล้วบันทึกครั้งเดียวผ่านหน้าต่างผลกระทบ */
const PlanMatrixView: React.FC<Props> = ({ plans, models, onSaved }) => {
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const [draft, setDraft] = useState<Record<string, Entitlements>>(() => entitlementsOf(plans));
  const [impactOpen, setImpactOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(entitlementsOf(plans)), [plans]);

  // backend ที่ยังไม่มี allowedModelIds = ยังไม่รองรับ PATCH เฉพาะ field (จะลบ price ทิ้ง) จึงให้ดูอย่างเดียว
  const readOnly = plans.some((plan) => plan.allowedModelIds === undefined);
  const activeIds = useMemo(() => (models ?? []).map((model) => model.id), [models]);
  const modelGroups = useMemo(() => groupModels(models ?? []), [models]);
  const original = useMemo(() => entitlementsOf(plans), [plans]);
  const changed = plans.filter(
    (plan) =>
      !sameSet(draft[plan.id]?.accessCodes, original[plan.id].accessCodes) ||
      !sameSet(draft[plan.id]?.allowedModelIds, original[plan.id].allowedModelIds),
  );

  const update = (planId: string, next: (current: Entitlements) => Entitlements) =>
    setDraft((current) => ({ ...current, [planId]: next(current[planId]) }));

  const setModel = (plan: TPlan, modelId: number, on: boolean) => {
    const current = draft[plan.id].allowedModelIds;
    // จาก "ทุก model" → เริ่มจาก model ที่ active ทั้งหมดแล้วเอาตัวที่กดออก
    const ids = toggle(current.length ? current : activeIds, modelId, on);
    if (ids.length === 0) {
      messageApi.warning(`${plan.name} needs at least one model, or turn on "All active models".`);
      return;
    }
    update(plan.id, (entitlements) => ({ ...entitlements, allowedModelIds: ids }));
  };

  const save = async (scope: TApplyScope) => {
    setSaving(true);
    const failed: string[] = [];
    let applied = 0;
    // ทีละ plan: แต่ละ PATCH เป็น transaction ของตัวเอง ถ้าพลาดบางตัวจะรายงานชื่อ
    for (const plan of changed) {
      try {
        const result = await planService.update(plan.id, { ...draft[plan.id], applyToOrganizations: scope });
        applied += result?.appliedOrganizations ?? 0;
      } catch {
        failed.push(plan.name);
      }
    }
    setSaving(false);
    setImpactOpen(false);
    const saved = changed.length - failed.length;
    if (saved > 0) {
      messageApi.success(
        applied > 0 ? `Saved ${saved} plans and copied to ${applied} organizations` : `Saved ${saved} plans`,
      );
    }
    if (failed.length) messageApi.error(`Could not save: ${failed.join(", ")}. Their changes were reloaded.`);
    onSaved();
  };

  if (plans.length === 0) return <Empty description="No plans match the search" />;

  const border = `1px solid ${token.colorBorderSecondary}`;
  const stickyCell: React.CSSProperties = { position: "sticky", left: 0, background: token.colorBgContainer, zIndex: 1 };
  const sectionRow = (title: string) => (
    <tr>
      <th
        colSpan={plans.length + 1}
        className="px-3 pb-1.5 pt-4 text-left text-xs font-medium"
        style={{ color: token.colorTextSecondary, borderBottom: border }}
      >
        {title}
      </th>
    </tr>
  );
  const rowLabel = (label: React.ReactNode) => (
    <th scope="row" className="whitespace-nowrap px-3 py-1.5 text-left font-normal" style={{ ...stickyCell, borderBottom: border }}>
      {label}
    </th>
  );
  const cell = (key: string, child: React.ReactNode) => (
    <td key={key} className="px-3 py-1.5 text-center" style={{ borderBottom: border }}>
      {child}
    </td>
  );

  return (
    <div className="flex flex-col gap-3">
      {contextHolder}
      {readOnly && (
        <Alert
          type="info"
          showIcon
          message="The backend has not been updated for per-plan models yet, so this table is read-only."
        />
      )}

      <div className="overflow-x-auto rounded-xl" style={{ border, background: token.colorBgContainer }}>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left" style={{ ...stickyCell, borderBottom: border }} />
              {plans.map((plan) => (
                <th key={plan.id} scope="col" className="min-w-[120px] px-3 py-2 text-center align-bottom" style={{ borderBottom: border }}>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold" style={{ color: token.colorTextBase }}>{plan.name}</span>
                    {plan.isDefault ? (
                      <StatusTag tone="primary">Default</StatusTag>
                    ) : (
                      !plan.status && <StatusTag tone="neutral">Draft</StatusTag>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sectionRow("Access")}
            {ACCESS_CODE_GROUPS.map((group) => (
              <React.Fragment key={group.title}>
                {group.options.map((option, index) => (
                  <tr key={option.value}>
                    {rowLabel(
                      <span>
                        {index === 0 && <span className="mr-2 text-xs" style={{ color: token.colorTextSecondary }}>{group.title}</span>}
                        {option.label}
                      </span>,
                    )}
                    {plans.map((plan) =>
                      cell(
                        plan.id,
                        <Checkbox
                          aria-label={`${plan.name}: ${option.label}`}
                          disabled={readOnly}
                          checked={draft[plan.id]?.accessCodes.includes(option.value)}
                          onChange={(event) =>
                            update(plan.id, (entitlements) => ({
                              ...entitlements,
                              accessCodes: toggle(entitlements.accessCodes, option.value, event.target.checked),
                            }))
                          }
                        />,
                      ),
                    )}
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {sectionRow("AI models")}
            <tr>
              {rowLabel(
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: ALL_MODELS_ACCENT }} />
                  All active models
                </span>,
              )}
              {plans.map((plan) =>
                cell(
                  plan.id,
                  <Checkbox
                    aria-label={`${plan.name}: all active models`}
                    disabled={readOnly || models === null}
                    checked={!draft[plan.id]?.allowedModelIds.length}
                    onChange={(event) =>
                      update(plan.id, (entitlements) => ({
                        ...entitlements,
                        allowedModelIds: event.target.checked ? [] : activeIds,
                      }))
                    }
                  />,
                ),
              )}
            </tr>
            {models === null ? (
              <tr>
                <td colSpan={plans.length + 1} className="p-3">
                  <Skeleton active paragraph={{ rows: 2 }} title={false} />
                </td>
              </tr>
            ) : (
              modelGroups.map(([type, group]) => (
                <React.Fragment key={type}>
                  {group.map((model, index) => (
                    <tr key={model.id}>
                      {rowLabel(
                        <span>
                          {index === 0 && (
                            <span className="mr-2 text-xs" style={{ color: token.colorTextSecondary }}>
                              {MODEL_TYPE_LABELS[type] ?? type}
                            </span>
                          )}
                          {modelLabel(model)}
                        </span>,
                      )}
                      {plans.map((plan) => {
                        const ids = draft[plan.id]?.allowedModelIds ?? [];
                        const viaAll = ids.length === 0;
                        return cell(
                          plan.id,
                          <Checkbox
                            aria-label={`${plan.name}: ${modelLabel(model)}${viaAll ? " (included by all models)" : ""}`}
                            disabled={readOnly}
                            checked={viaAll || ids.includes(model.id)}
                            style={viaAll ? { opacity: 0.55 } : undefined}
                            onChange={(event) => setModel(plan, model.id, event.target.checked)}
                          />,
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <div
          className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-2 py-3"
          style={{ background: token.colorBgLayout, borderTop: border }}
        >
          <span className="mr-auto text-xs tabular-nums" style={{ color: token.colorTextSecondary }}>
            {changed.length ? `แก้ ${changed.length} plan ที่ยังไม่บันทึก` : "ติ๊กช่องเพื่อแก้ Access หรือ model ของแต่ละ plan"}
          </span>
          <Button disabled={!changed.length || saving} onClick={() => setDraft(original)}>
            ยกเลิก
          </Button>
          <Button type="primary" disabled={!changed.length} onClick={() => setImpactOpen(true)}>
            บันทึก…
          </Button>
        </div>
      )}

      <ApplyImpactModal
        open={impactOpen}
        plans={changed.map((plan) => ({ id: plan.id, name: plan.name }))}
        saving={saving}
        onCancel={() => setImpactOpen(false)}
        onConfirm={save}
      />
    </div>
  );
};

export default PlanMatrixView;
