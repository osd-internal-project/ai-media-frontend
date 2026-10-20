import { useEffect, useMemo, useState } from "react";
import { axiosReport } from "@/app/lib/axios/axios";
import DashboardServices from "@/app/services/dashboard.service";
import type {
  GenerationLogStatus,
  IGenerationLogPage,
} from "@/app/common/dashbaord";

export type GenerationLogScope = {
  from?: string;
  to?: string;
  projectId?: string;
  userId?: string;
};

const EMPTY_PAGE: IGenerationLogPage = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 10,
};

/**
 * One page of generation logs for a fixed scope, refetched when the scope, filters or page
 * change. A stale response from an earlier request never overwrites a newer one.
 */
export default function useGenerationLogs(
  organizationId: string | undefined,
  scope: GenerationLogScope,
) {
  const dashboardServices = useMemo(() => DashboardServices(axiosReport), []);
  const [status, setStatus] = useState<GenerationLogStatus>("success");
  const [type, setType] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [result, setResult] = useState<IGenerationLogPage>(EMPTY_PAGE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const { from, to, projectId, userId } = scope;

  // A new scope or filter starts again from the first page.
  useEffect(() => {
    setPage(1);
  }, [from, to, projectId, userId, status, type]);

  useEffect(() => {
    if (!organizationId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    dashboardServices
      .findGenerationLogs(organizationId, {
        from,
        to,
        projectId,
        userId,
        status,
        type,
        page,
        pageSize,
      })
      .then((next) => {
        if (!cancelled) setResult(next ?? EMPTY_PAGE);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("Failed to load generation logs", err);
        setError("Could not load generation logs. The reporting service may be unavailable.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    dashboardServices,
    organizationId,
    from,
    to,
    projectId,
    userId,
    status,
    type,
    page,
    pageSize,
    reloadKey,
  ]);

  return {
    result,
    loading,
    error,
    status,
    setStatus,
    type,
    setType,
    page,
    pageSize,
    setPagination: (nextPage: number, nextPageSize: number) => {
      setPage(nextPageSize === pageSize ? nextPage : 1);
      setPageSize(nextPageSize);
    },
    reload: () => setReloadKey((key) => key + 1),
  };
}
