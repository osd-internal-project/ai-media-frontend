export function formatNumber(
  arg0: string | number | undefined,
): React.ReactNode {
  if (typeof arg0 !== "number") return "-";
  return arg0.toLocaleString();
}
export function formatStringToNumber(
  arg0: string | number | undefined,
): React.ReactNode {
  if (!arg0) return "-";
  return Number(arg0).toLocaleString();
}
export function formatCompactNumber(
  value: string | number | undefined,
): string {
  if (value === undefined || value === null) return "0";

  const num = Number(value);
  if (isNaN(num)) return "0";

  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
}
