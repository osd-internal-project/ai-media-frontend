// Extract font names from a prompt string (from Fonts: ... section)
export function extractFontNames(prompt: string): {name: string}[] {
  const fontsSection = prompt.split('Fonts:')[1] || '';
  // Match: FontName (type, weight)
  const fontMatches = [...fontsSection.matchAll(/([^,\n]+)\s*\([^)]+\)/g)];
  // Remove duplicates and trim
  const uniqueNames = Array.from(new Set(fontMatches.map(m => m[1].trim())));
  return uniqueNames.map(name => ({ name }));
}
