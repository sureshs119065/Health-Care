import type { Product } from "./types";
import { formatMoney } from "./whatsapp";

export interface UnitPrice {
  per100: number;
  unit: "g" | "ml";
}

const TO_BASE: Record<string, { f: number; unit: "g" | "ml" }> = {
  g: { f: 1, unit: "g" }, gm: { f: 1, unit: "g" }, gms: { f: 1, unit: "g" },
  gram: { f: 1, unit: "g" }, grams: { f: 1, unit: "g" },
  kg: { f: 1000, unit: "g" }, kgs: { f: 1000, unit: "g" },
  ml: { f: 1, unit: "ml" },
  l: { f: 1000, unit: "ml" }, ltr: { f: 1000, unit: "ml" }, litre: { f: 1000, unit: "ml" }, litres: { f: 1000, unit: "ml" },
};

/** Reads a pack size such as "200 g", "1 kg" or "2 x 100 g". Returns null when it cannot be understood. */
export function packSize(weight: string): { amount: number; unit: "g" | "ml" } | null {
  const m = weight.trim().match(/^(?:(\d+)\s*[x×]\s*)?(\d+(?:\.\d+)?)\s*([a-z]+)\b/i);
  if (!m) return null;
  const unit = TO_BASE[m[3].toLowerCase()];
  if (!unit) return null;
  const amount = Number(m[2]) * unit.f * (m[1] ? Number(m[1]) : 1);
  return amount > 0 ? { amount, unit: unit.unit } : null;
}

export function unitPrice(p: Product): UnitPrice | null {
  const size = packSize(p.weight);
  return size ? { per100: (p.price / size.amount) * 100, unit: size.unit } : null;
}

/** Text such as "₹90 / 100 g", or an empty string when the pack size is not in g, kg, ml or l. */
export function formatUnitPrice(p: Product): string {
  const u = unitPrice(p);
  return u ? `${formatMoney(Math.round(u.per100 * 100) / 100)} / 100 ${u.unit}` : "";
}
