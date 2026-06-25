export function normalizeSlug(text: string): string {
  if (!text) {
    return "";
  }

  return text
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\u0131/g, "i")
    .replace(/\u011f/g, "g")
    .replace(/\u00fc/g, "u")
    .replace(/\u015f/g, "s")
    .replace(/\u00f6/g, "o")
    .replace(/\u00e7/g, "c")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function toTurkishTitleCase(text: string | null | undefined): string {
  if (!text) return "";
  const normalized = text.trim().toLocaleLowerCase("tr-TR");
  if (!normalized) {
    return "";
  }

  return normalized
    .split(/\s+/)
    .map((word) => {
      if (!word) return "";
      return `${word.charAt(0).toLocaleUpperCase("tr-TR")}${word.slice(1)}`;
    })
    .join(" ");
}
