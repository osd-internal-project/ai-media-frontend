"use client";

import React from "react";
import { DatePicker, Segmented, Select, Space, Typography } from "antd";
import type { Dayjs } from "dayjs";
import { GENERATION_TYPE_OPTIONS } from "@/app/common/generation-type";
import type { GenerationTypeKey } from "@/app/common/generation-type";
import {
  DATE_RANGE_LABEL,
  DATE_RANGE_PRESETS,
  type DashboardFilters,
  type DashboardMetric,
  type DateRangePreset,
} from "../../../hooks/use-dashboard-filters";

const { RangePicker } = DatePicker;

type OverviewFiltersProps = {
  filters: DashboardFilters;
  onChange: (patch: Partial<DashboardFilters>) => void;
  projectOptions: Array<{ value: string; label: string }>;
  disabled?: boolean;
};

const rangeOptions = DATE_RANGE_PRESETS.map((preset) => ({
  value: preset,
  label: DATE_RANGE_LABEL[preset],
}));

/**
 * Filter bar for the Overview tab.
 *
 * Date range, project and metric drive a server refetch; the type multi-select only toggles
 * series visibility in the trend chart, so it is applied client-side.
 */
export default function OverviewFilters({
  filters,
  onChange,
  projectOptions,
  disabled = false,
}: OverviewFiltersProps) {
  const handleRangeChange = (value: string | number) => {
    onChange({ range: value as DateRangePreset });
  };

  const handleCustomRangeChange = (
    values: [Dayjs | null, Dayjs | null] | null,
  ) => {
    onChange({
      customFrom: values?.[0] ?? null,
      customTo: values?.[1] ?? null,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Segmented
        value={filters.range}
        onChange={handleRangeChange}
        options={rangeOptions}
        disabled={disabled}
        size="small"
      />

      {filters.range === "custom" && (
        <RangePicker
          value={
            filters.customFrom && filters.customTo
              ? [filters.customFrom, filters.customTo]
              : null
          }
          onChange={handleCustomRangeChange}
          allowClear
          disabled={disabled}
          size="small"
        />
      )}

      <Space size={6}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Project
        </Typography.Text>
        <Select
          value={filters.projectId ?? undefined}
          onChange={(value?: string) => onChange({ projectId: value ?? null })}
          options={projectOptions}
          placeholder="All projects"
          allowClear
          showSearch
          optionFilterProp="label"
          disabled={disabled}
          size="small"
          style={{ minWidth: 180 }}
        />
      </Space>

      <Space size={6}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Types
        </Typography.Text>
        <Select
          mode="multiple"
          value={filters.types}
          onChange={(value: GenerationTypeKey[]) => onChange({ types: value })}
          options={[...GENERATION_TYPE_OPTIONS]}
          placeholder="All types"
          maxTagCount="responsive"
          allowClear
          disabled={disabled}
          size="small"
          style={{ minWidth: 200 }}
        />
      </Space>

      <Segmented
        value={filters.metric}
        onChange={(value) => onChange({ metric: value as DashboardMetric })}
        options={[
          { value: "count", label: "Generations" },
          { value: "credit", label: "Credits" },
        ]}
        disabled={disabled}
        size="small"
      />
    </div>
  );
}
