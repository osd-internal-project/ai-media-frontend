export function formatNumber(
  arg0: string | number | undefined
): React.ReactNode {
  if (typeof arg0 !== "number") return "-";
  return arg0.toLocaleString();
}
export function formatStringToNumber(
  arg0: string | number | undefined
): React.ReactNode {
  if (!arg0) return "-";
  return Number(arg0).toLocaleString();
}
