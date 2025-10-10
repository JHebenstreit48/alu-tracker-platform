export type ObtainInput = string | string[] | null | undefined;

export function formatObtainableViaDisplay(input: ObtainInput): string {
  const SEPARATOR = ", ";
  try {
    if (input == null) return "";

    const toTokens = (s: string) =>
      String(s)
        .split(/[\/|,]+/) // support "A / B", "A|B", etc.
        .map(t => t.trim())
        .filter(Boolean);

    const arr =
      Array.isArray(input) ? input
      : typeof input === "string" ? toTokens(input)
      : [];

    const cleaned = arr
      .map(t => String(t ?? "").trim())
      .filter(t => t && t.toLowerCase() !== "null");

    return cleaned.join(SEPARATOR);
  } catch {
    try { return String(input ?? ""); } catch { return ""; }
  }
}