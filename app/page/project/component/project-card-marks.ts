// Thai leading vowels are written before the consonant they follow in speech; an initial never starts with one.
const LEADING_VOWELS = new Set(["เ", "แ", "โ", "ใ", "ไ"]);
const LETTER = /^[\p{L}\p{N}]/u;

const letters = (word: string): string[] =>
  Array.from(new Intl.Segmenter("th", { granularity: "grapheme" }).segment(word), (s) => s.segment).filter(
    (g) => LETTER.test(g) && !LEADING_VOWELS.has(g),
  );

/** Two-letter mark for a project with no work: first letters of the first two words, else the first two letters. */
export function projectInitials(name: string): string {
  const words = name.trim().split(/\s+/).map(letters).filter((w) => w.length > 0);
  if (words.length === 0) return "?";
  const mark = words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2).join("");
  return mark.toUpperCase();
}

/** Picks one of the avatar colours from the name, so a person keeps the same colour on every card. */
export function pickByName<T>(name: string, palette: readonly [T, ...T[]]): T {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return palette[hash % palette.length];
}
