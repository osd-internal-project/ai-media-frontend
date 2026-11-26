import type { TPlan, TPlanPrice } from "../../../common/plan.type";

const INTERVAL_LABEL: Record<string, string> = { DAY: "วัน", MONTH: "เดือน", YEAR: "ปี" };

/** "฿990 / เดือน" — สกุลอื่นใช้รหัสสกุลเงินต่อท้าย */
export const priceLabel = (price: Pick<TPlanPrice, "price" | "currency" | "interval" | "periodCount">) => {
  const amount = Number(price.price) || 0;
  const currency = (price.currency || "THB").toUpperCase();
  const value =
    currency === "THB"
      ? `฿${amount.toLocaleString("th-TH")}`
      : `${amount.toLocaleString("th-TH")} ${currency}`;
  const unit = INTERVAL_LABEL[price.interval?.toUpperCase()] ?? price.interval?.toLowerCase() ?? "";
  const count = price.periodCount && price.periodCount > 1 ? `${price.periodCount} ` : "";
  return unit ? `${value} / ${count}${unit}` : value;
};

/** ชื่อสำเนาที่ไม่ซ้ำ: "Pro (copy)", "Pro (copy 2)", ... */
export const copyName = (name: string, existingNames: string[]) => {
  const taken = new Set(existingNames);
  let candidate = `${name} (copy)`;
  for (let n = 2; taken.has(candidate); n += 1) candidate = `${name} (copy ${n})`;
  return candidate;
};

/**
 * body ของ POST /plans สำหรับทำสำเนาจาก GET /plans/:id — สำเนาปิดไว้ก่อน (ไม่ขาย ไม่เป็นค่าเริ่มต้น)
 * ไม่ส่ง id ของ price / feature เดิม เพื่อให้ backend สร้างแถวใหม่
 */
export const copyPayload = (plan: TPlan & { popular?: boolean }, existingNames: string[]) => ({
  name: copyName(plan.name, existingNames),
  description: plan.description,
  badge: plan.badge,
  borderColor: plan.borderColor,
  status: false,
  isDefault: false,
  popular: false,
  accessCodes: plan.accessCodes ?? [],
  allowedModelIds: plan.allowedModelIds ?? [],
  detailJson: plan.detailJson,
  prices: (plan.prices ?? []).map(({ id: _id, planId: _planId, plan: _plan, ...price }) => price),
  features: (plan.features ?? []).map(({ id: _id, featureId: _featureId, ...feature }) => feature),
});
