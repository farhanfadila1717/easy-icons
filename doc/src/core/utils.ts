export function iconChar(codepoint: number): string {
  return String.fromCodePoint(codepoint);
}

export function camelCase(str: string): string {
  return str
    .trim()
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (m) => m.toLowerCase());
}
