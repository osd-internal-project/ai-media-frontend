// Extract hex color codes from a prompt string
export function extractHexColors(prompt: string): {hex: string}[] {
  const hexMatches = [...prompt.matchAll(/#([0-9a-fA-F]{3,8})/g)];
  // Remove duplicates
  const uniqueHexes = Array.from(new Set(hexMatches.map(m => '#' + m[1].toLowerCase())));
  return uniqueHexes.map(hex => ({ hex }));
}
