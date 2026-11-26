"use client";

import React, { useMemo } from "react";
import { Alert, Checkbox, Radio, Skeleton, theme } from "antd";
import { ACCESS_CODE_GROUPS, MODEL_TYPE_LABELS } from "@/app/common/access-codes";
import { TMasterModelType } from "@/app/common/master-model-type.type";

export const modelLabel = (model: TMasterModelType) => model.name ?? model.modelType ?? `#${model.id}`;

/** model แยกตาม type ตามลำดับที่ backend ส่งมา */
export const groupModels = (models: TMasterModelType[]): [string, TMasterModelType[]][] => {
  const groups = new Map<string, TMasterModelType[]>();
  models.forEach((model) => {
    const key = model.type ?? "other";
    groups.set(key, [...(groups.get(key) ?? []), model]);
  });
  return [...groups.entries()];
};

/** แทนค่าเฉพาะที่อยู่ในกลุ่มนี้ — ค่าที่อยู่นอกกลุ่ม (รวม code / id เก่าที่ไม่อยู่ในรายการ) คงไว้ */
const replaceWithin = <T,>(current: T[], group: T[], picked: T[]) => [
  ...current.filter((value) => !group.includes(value)),
  ...picked,
];

const Legend: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = theme.useToken();
  return (
    <legend className="mb-1.5 text-xs" style={{ color: token.colorTextSecondary }}>
      {children}
    </legend>
  );
};

/** ใช้เป็น control ของ Form.Item ได้ (value / onChange) */
export const AccessPicker: React.FC<{ value?: string[]; onChange?: (codes: string[]) => void }> = ({
  value = [],
  onChange,
}) => (
  <div className="grid gap-4 md:grid-cols-3">
    {ACCESS_CODE_GROUPS.map((group) => {
      const codes = group.options.map((option) => option.value);
      return (
        <fieldset key={group.title}>
          <Legend>{group.title}</Legend>
          <Checkbox.Group
            className="flex flex-col gap-1.5"
            options={group.options}
            value={value.filter((code) => codes.includes(code))}
            onChange={(picked) => onChange?.(replaceWithin(value, codes, picked as string[]))}
          />
        </fieldset>
      );
    })}
  </div>
);

export interface ModelSelection {
  /** true = ทุก model ที่ active (บันทึกเป็น list ว่าง) */
  allModels: boolean;
  ids: number[];
}

export const selectionOf = (ids: number[] | undefined): ModelSelection => ({
  allModels: !ids?.length,
  ids: ids ?? [],
});

/** ค่าที่ส่งให้ backend — list ว่าง = ทุก model */
export const selectionIds = (selection: ModelSelection) => (selection.allModels ? [] : selection.ids);

export const ModelPicker: React.FC<{
  models: TMasterModelType[] | null;
  value: ModelSelection;
  onChange: (next: ModelSelection) => void;
  /** แสดงคำเตือนเพิ่มใต้รายการ (เช่น org ที่เปิด Photo Event) */
  warning?: string;
}> = ({ models, value, onChange, warning }) => {
  const groups = useMemo(() => groupModels(models ?? []), [models]);
  return (
    <div>
      <Radio.Group
        value={value.allModels ? "all" : "pick"}
        onChange={(event) => onChange({ ...value, allModels: event.target.value === "all" })}
        options={[
          { value: "all", label: "ทุก model ที่เปิดใช้งาน" },
          { value: "pick", label: "เลือกเอง" },
        ]}
      />
      {!value.allModels && (
        <div className="mt-3">
          {models === null ? (
            <Skeleton active paragraph={{ rows: 3 }} title={false} />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {groups.map(([type, group]) => {
                const ids = group.map((model) => model.id);
                return (
                  <fieldset key={type}>
                    <Legend>{MODEL_TYPE_LABELS[type] ?? type}</Legend>
                    <Checkbox.Group
                      className="flex flex-col gap-1.5"
                      options={group.map((model) => ({ value: model.id, label: modelLabel(model) }))}
                      value={value.ids.filter((id) => ids.includes(id))}
                      onChange={(picked) => onChange({ ...value, ids: replaceWithin(value.ids, ids, picked as number[]) })}
                    />
                  </fieldset>
                );
              })}
            </div>
          )}
          {value.ids.length === 0 && (
            <Alert className="!mt-3" type="error" showIcon message="ยังไม่ได้เลือก model — ถ้าบันทึกแบบนี้จะกลับเป็น 'ทุก model'" />
          )}
          {warning && <Alert className="!mt-3" type="warning" showIcon message={warning} />}
        </div>
      )}
    </div>
  );
};
