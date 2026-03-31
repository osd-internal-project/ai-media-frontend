// Type guard for typography detail
export function isTypographyDetail(detail: any): detail is { weight?: number|string; type?: string } {
  return detail && (typeof detail.weight === 'number' || typeof detail.weight === 'string' || typeof detail.type === 'string');
}
