// Generate CI Prompt string from colors and fonts
export function autoGenerateCIPrompt({ colors, fonts }: { colors: { name: string; hex: string; type: string }[]; fonts: { name: string; weight: number; type: string }[] }) {
  let colorDesc = "";
  if (colors.length > 0) {
    const colorList = colors.map(c => {
      const name = c.name && c.name.trim() ? c.name : c.type;
      const type = c.type ? `(${c.type})` : '';
      return `${name} ${type}: ${c.hex}`.replace(/ +/g, ' ');
    }).join(", ");
    colorDesc = `Brand colors: ${colorList}`;
  }
  let fontDesc = "";
  if (fonts.length > 0) {
    const fontList = fonts.map(f => {
      const fam = f.name && f.name.trim() ? f.name : 'sans-serif';
      const type = f.type ? `(${f.type})` : '';
      const weight = f.weight || 400;
      return `${fam} ${type}, weight ${weight}`.replace(/ +/g, ' ');
    }).join(", ");
    fontDesc = `Fonts: ${fontList}`;
  }
  return [colorDesc, fontDesc, "clean modern minimalist aesthetic, professional AI technology style, high-tech futuristic feel, crisp sharp edges, premium quality"].filter(Boolean).join(", ");
}
