import { useEffect, useMemo, useState } from "react";
import { axiosCore } from "@/app/lib/axios/axios";
import MasterModelTypeServices from "@/app/services/master-model-type.service";
import type { TMasterModelType } from "@/app/common/master-model-type.type";

/** Display names for stored model ids (`master_model_type.model_type` → `name`). */
export default function useModelNames() {
  const [models, setModels] = useState<TMasterModelType[]>([]);

  useEffect(() => {
    let cancelled = false;
    MasterModelTypeServices(axiosCore)
      .findAll()
      .then((next) => {
        if (!cancelled) setModels(next ?? []);
      })
      // Names are cosmetic: on failure the raw model id is shown instead.
      .catch((err: unknown) => console.error("Failed to load model names", err));
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => {
    const names = new Map<string, string>();
    for (const model of models) {
      if (model.modelType) names.set(model.modelType, model.name);
    }
    return {
      models,
      nameOf: (id: string | null | undefined) => (id ? names.get(id) ?? id : "Unknown model"),
    };
  }, [models]);
}
