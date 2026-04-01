// Type guard for color detail
export function isColorDetail(detail: any): detail is { hex: string; type: string } {
  return detail && typeof detail.hex === 'string' && typeof detail.type === 'string';
}
