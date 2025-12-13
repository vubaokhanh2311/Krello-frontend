export function includesIgnoreCase(
  text: string | null | undefined,
  keyword: string
): boolean {
  if (!text) return false;
  const normalizedKeyword = keyword.toLowerCase().trim();
  if (!normalizedKeyword) return true;
  return text.toLowerCase().includes(normalizedKeyword);
}

export function normalizeKeyword(keyword: string): string {
  return keyword.toLowerCase().trim();
}
