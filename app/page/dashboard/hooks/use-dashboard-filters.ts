"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dayjs, { type Dayjs } from "dayjs";
import {
  GENERATION_TYPE_KEYS,
  isGenerationTypeKey,
  type GenerationTypeKey,
} from "@/app/common/generation-type";

export const DATE_RANGE_PRESETS = [
  "today",
  "7d",
  "month",
  "3m",
  "custom",
] as const;

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number];

export const DATE_RANGE_LABEL: Readonly<Record<DateRangePreset, string>> = {
  today: "Today",
  "7d": "7 days",
  month: "This month",
  "3m": "3 months",
  custom: "Custom range",
};

/** Which quantity the trend chart and donut plot. */
export type DashboardMetric = "count" | "credit";

export const DEFAULT_RANGE: DateRangePreset = "month";
export const DEFAULT_METRIC: DashboardMetric = "count";

export type DashboardTabKey = "overview" | "users" | "projects";

export interface DashboardFilters {
  tab: DashboardTabKey;
  range: DateRangePreset;
  /** Only meaningful when `range === "custom"`. */
  customFrom: Dayjs | null;
  customTo: Dayjs | null;
  projectId: string | null;
  /** Empty means "all types visible". */
  types: GenerationTypeKey[];
  metric: DashboardMetric;
}

/** Resolved, absolute range sent to the API. */
export interface ResolvedDateRange {
  from: string;
  to: string;
}

const TAB_KEYS: readonly DashboardTabKey[] = ["overview", "users", "projects"];

/**
 * Turns a preset (plus any custom boundaries) into the absolute UTC range the API expects.
 *
 * Boundaries are computed in the viewer's local time then converted to UTC, so "Today" means
 * the viewer's today. The backend buckets in UTC, which is documented on those endpoints.
 *
 * @param range The selected preset.
 * @param customFrom Start boundary, used only for the custom preset.
 * @param customTo End boundary, used only for the custom preset.
 * @returns Inclusive ISO 8601 `from`/`to` in UTC.
 */
export function resolveDateRange(
  range: DateRangePreset,
  customFrom: Dayjs | null,
  customTo: Dayjs | null,
): ResolvedDateRange {
  const now = dayjs();

  let start: Dayjs;
  let end: Dayjs = now.endOf("day");

  switch (range) {
    case "today":
      start = now.startOf("day");
      break;
    case "7d":
      start = now.subtract(6, "day").startOf("day");
      break;
    case "3m":
      start = now.subtract(2, "month").startOf("month");
      end = now.endOf("month");
      break;
    case "custom":
      // Fall back to this month if either boundary is missing or the range is reversed.
      if (customFrom?.isValid() && customTo?.isValid()) {
        const ordered = customFrom.isAfter(customTo)
          ? [customTo, customFrom]
          : [customFrom, customTo];
        start = ordered[0].startOf("day");
        end = ordered[1].endOf("day");
      } else {
        start = now.startOf("month");
        end = now.endOf("month");
      }
      break;
    case "month":
    default:
      start = now.startOf("month");
      end = now.endOf("month");
      break;
  }

  // toISOString() already yields UTC, so no dayjs utc plugin is needed here.
  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
}

/**
 * Reads and writes the Overview filter state in the URL query string.
 *
 * Filters live in the URL rather than component state so a filtered dashboard can be
 * bookmarked, refreshed and shared.
 *
 * @returns The parsed filters, the resolved API range, and a partial-update setter.
 */
export function useDashboardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Memoise on the serialised query string rather than the ReadonlyURLSearchParams object,
  // whose identity is not guaranteed stable across renders.
  const searchParamsKey = searchParams.toString();

  const filters = useMemo<DashboardFilters>(() => {
    const params = new URLSearchParams(searchParamsKey);
    const rawTab = params.get("tab");
    const rawRange = params.get("range");
    const rawMetric = params.get("metric");
    const rawTypes = params.get("types");

    const parseDate = (value: string | null): Dayjs | null => {
      if (!value) return null;
      const parsed = dayjs(value);
      return parsed.isValid() ? parsed : null;
    };

    return {
      tab: TAB_KEYS.includes(rawTab as DashboardTabKey)
        ? (rawTab as DashboardTabKey)
        : "overview",
      range: DATE_RANGE_PRESETS.includes(rawRange as DateRangePreset)
        ? (rawRange as DateRangePreset)
        : DEFAULT_RANGE,
      customFrom: parseDate(params.get("from")),
      customTo: parseDate(params.get("to")),
      projectId: params.get("project") || null,
      types: (rawTypes ? rawTypes.split(",") : []).filter(isGenerationTypeKey),
      metric: rawMetric === "credit" ? "credit" : DEFAULT_METRIC,
    };
  }, [searchParamsKey]);

  const setFilters = useCallback(
    (patch: Partial<DashboardFilters>) => {
      const next = { ...filters, ...patch };
      const params = new URLSearchParams();

      // Defaults are omitted so a pristine dashboard keeps a clean URL.
      if (next.tab !== "overview") params.set("tab", next.tab);
      if (next.range !== DEFAULT_RANGE) params.set("range", next.range);
      if (next.range === "custom") {
        if (next.customFrom?.isValid())
          params.set("from", next.customFrom.format("YYYY-MM-DD"));
        if (next.customTo?.isValid())
          params.set("to", next.customTo.format("YYYY-MM-DD"));
      }
      if (next.projectId) params.set("project", next.projectId);
      // All types selected is the same view as none selected — keep the URL short.
      if (next.types.length > 0 && next.types.length < GENERATION_TYPE_KEYS.length) {
        params.set("types", next.types.join(","));
      }
      if (next.metric !== DEFAULT_METRIC) params.set("metric", next.metric);

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [filters, pathname, router],
  );

  const dateRange = useMemo(
    () =>
      resolveDateRange(filters.range, filters.customFrom, filters.customTo),
    [filters.range, filters.customFrom, filters.customTo],
  );

  /**
   * Types the trend chart should draw. An empty selection means "show everything" rather
   * than "show nothing", which matches how the multi-select reads to a user.
   */
  const visibleTypes = useMemo<GenerationTypeKey[]>(
    () => (filters.types.length ? filters.types : [...GENERATION_TYPE_KEYS]),
    [filters.types],
  );

  return { filters, setFilters, dateRange, visibleTypes };
}
