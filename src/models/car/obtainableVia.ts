import { Schema } from "mongoose";

// ==============================
//   Enums & Types
// ==============================
export const OBTAIN_CATEGORIES = [
  "Multiplayer",
  "Special Event",
  "Daily Event",
  "Garage Level",   // GL15 => { category: "Garage Level", level: 15 }
  "Career",
  "Legend Pass",
  "Legend Store",
  "Other",
] as const;

export const OBTAIN_SUBTYPES = [
  "Car Hunt",
  "Legendary Car Hunt",
  "Grand Prix",     // lives under Special Event
  "Showroom",       // lives under Special Event
  "Event Pack",     // lives under Legend Store
  "Milestone",      // lives under Legend Store
  "Other",
] as const;

export type ObtainCategory = (typeof OBTAIN_CATEGORIES)[number];
export type ObtainSubtype  = (typeof OBTAIN_SUBTYPES)[number];

export interface ObtainMethod {
  category: ObtainCategory;
  subtype?: ObtainSubtype;
  level?: number;   // for "Garage Level"
  notes?: string;
}

// ==============================
//   Core Schema
// ==============================
export const obtainableViaSchema = new Schema<ObtainMethod>(
  {
    category: { type: String, enum: OBTAIN_CATEGORIES, required: true },
    subtype:  { type: String, enum: OBTAIN_SUBTYPES, required: false },
    level:    { type: Number, min: 1 }, // GL level
    notes:    { type: String },
  },
  { _id: false }
);

// Helpful index
obtainableViaSchema.index({ category: 1, subtype: 1, level: 1 });

// Guard common pairings (non-blocking business rules)
obtainableViaSchema.path("subtype").validate(function (this: any, sub: string | undefined) {
  if (!sub) return true;
  const cat = this.category as ObtainCategory;

  if (sub === "Showroom" || sub === "Grand Prix") return cat === "Special Event";
  if (sub === "Event Pack" || sub === "Milestone") return cat === "Legend Store";
  if (sub === "Car Hunt" || sub === "Legendary Car Hunt") return ["Special Event", "Daily Event"].includes(cat);
  return true;
}, "Inconsistent category/subtype pairing");

// ==============================
//   Transition Wrapper Field
// ==============================
// Accepts array, string, or null and normalizes.
export const obtainableViaField = {
  type: Schema.Types.Mixed,
  default: null,
  set(value: any) {
    if (value == null) return null;

    // Already array of structured objects?
    if (Array.isArray(value) && value.every(v => v && typeof v === "object" && "category" in v)) {
      return value;
    }

    // Array of strings (e.g., ["GL15","Multiplayer"])
    if (Array.isArray(value) && value.every(v => typeof v === "string")) {
      return (value as string[]).map(parseTokenToMethod).filter(Boolean);
    }

    // Single string ("GL14" or "Special Event - Car Hunt" or "A / B")
    if (typeof value === "string") {
      const tokens = value.split(/[\/|,]+/).map(s => s.trim()).filter(Boolean);
      return tokens.map(parseTokenToMethod).filter(Boolean);
    }

    return null;
  },
};

// ------------------------------
//   Helpers
// ------------------------------
function parseTokenToMethod(token: string): ObtainMethod | null {
  // GL15 -> Garage Level 15
  const gl = /^GL\s*(\d+)$/i.exec(token);
  if (gl) {
    return { category: "Garage Level", level: Number(gl[1]) };
  }

  // "Special Event - Car Hunt" style
  const [catRaw, subRaw] = token.split(/\s*-\s*/).map(s => s.trim());

  // direct category token like "Multiplayer"
  if (isExactCategory(token)) return { category: token as ObtainCategory };

  const category = normalizeCategory(catRaw);
  const subtype  = subRaw ? normalizeSubtype(subRaw) : undefined;

  if (category) return { category, subtype };

  // Fallback safety net
  return { category: "Other", notes: token };
}

function normalizeCategory(s: string): ObtainCategory | null {
  const t = s.toLowerCase();
  if (t === "multiplayer") return "Multiplayer";
  if (t === "special event" || t === "special events") return "Special Event";
  if (t === "daily event" || t === "daily events") return "Daily Event";
  if (t === "garage level" || /^gl\d+$/i.test(s)) return "Garage Level";
  if (t === "career") return "Career";
  if (t === "legend pass" || t === "lp" || t === "legendary pass") return "Legend Pass";
  if (t === "legend store") return "Legend Store";
  if (t === "other") return "Other";
  return null;
}

function normalizeSubtype(s: string): ObtainSubtype | undefined {
  const t = s.toLowerCase();
  if (t === "car hunt") return "Car Hunt";
  if (t === "legendary car hunt") return "Legendary Car Hunt";
  if (t === "grand prix") return "Grand Prix";
  if (t === "showroom") return "Showroom";
  if (t === "event pack") return "Event Pack";
  if (t === "milestone") return "Milestone";
  if (t === "other") return "Other";
  return undefined;
}

function isExactCategory(s: string): s is ObtainCategory {
  return (OBTAIN_CATEGORIES as readonly string[]).includes(s);
}