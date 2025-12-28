import {
  USE_FIREBASE_STORAGE_IMAGES,
  IMAGE_BASE_URL,
} from "@/scripts/DatabaseImports/Cars/seedConfig";

export function resolveImagePath(
  rel?: string | null
): string | undefined {
  if (!rel) return undefined;

  let clean = rel.trim();
  if (!clean) return undefined;

  clean = clean.replace(/^\/+/, "");

  if (!/^images\//i.test(clean)) {
    clean = `images/cars/${clean}`;
  }

  if (USE_FIREBASE_STORAGE_IMAGES) {
    return `/${clean}`;
  }

  if (IMAGE_BASE_URL) {
    const base = IMAGE_BASE_URL.replace(/\/+$/, "");
    return `${base}/${clean}`;
  }

  return `/${clean}`;
}