// src/models/car/obtainableVia.ts
export type ObtainInput = string | string[] | null | undefined;

/**
 * Always return a v1-safe display string.
 * - Accepts: string | string[] | null
 * - Splits "a / b, c" (or with |) into tokens when a string contains separators
 * - Keeps "Category - Subtype" as-is
 * - Treats "null" (string) as empty
 * - Joins with ", " for display
 */
export function formatObtainableViaDisplay(input: ObtainInput): string {
  const SEPARATOR = ", ";

  if (input == null) return "";

  const toTokens = (s: string) =>
    s
      .split(/[\/|,]+/)        // allow "A / B, C" or "A | B"
      .map(t => t.trim())
      .filter(Boolean);

  const arr =
    Array.isArray(input) ? input
    : typeof input === "string" ? toTokens(input)
    : [];

  const cleaned = arr
    .map(t => String(t).trim())
    .filter(t => t && t.toLowerCase() !== "null");

  return cleaned.join(SEPARATOR);
}