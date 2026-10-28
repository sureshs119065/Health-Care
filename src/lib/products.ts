import { CACHE_MINUTES } from "../config";
import { cleanClaims } from "./copy";
import { parseCsv } from "./csv";
import type { Product } from "./types";

export const COLUMNS = [
  "id", "name", "category", "price", "weight", "image", "shortDescription",
  "ingredients", "calories", "protein", "carbs", "fibre", "fat", "fssai",
  "inStock", "videoId", "tags",
] as const;

const CACHE_KEY = "products:v1";

export interface LoadResult {
  products: Product[];
  source: "live" | "cache" | "fallback";
  updatedAt: number;
}

/** Turns CSV rows into valid products. Invalid rows are skipped with a console warning. */
export function rowsToProducts(rows: string[][]): Product[] {
  if (rows.length === 0) return [];
  const head = rows[0].map((c) => c.trim().toLowerCase());
  const hasHeader = head.includes("id") && head.includes("name");
  const idx: Record<string, number> = {};
  COLUMNS.forEach((c, i) => {
    idx[c] = hasHeader ? head.indexOf(c.toLowerCase()) : i;
  });
  const data = hasHeader ? rows.slice(1) : rows;
  const out: Product[] = [];
  const seen = new Set<string>();

  data.forEach((r, n) => {
    const line = n + (hasHeader ? 2 : 1);
    const get = (k: (typeof COLUMNS)[number]) => (idx[k] >= 0 ? (r[idx[k]] ?? "").trim() : "");
    const id = get("id");
    const name = get("name");
    const priceText = get("price").replace(/[^0-9.]/g, "");
    const price = priceText === "" ? NaN : Number(priceText);

    if (!/^[\w-]+$/.test(id)) return void console.warn(`Row ${line} skipped: missing or invalid id`, r);
    if (seen.has(id)) return void console.warn(`Row ${line} skipped: duplicate id "${id}"`);
    if (!name) return void console.warn(`Row ${line} skipped: missing name (id ${id})`);
    if (!Number.isFinite(price) || price <= 0) {
      return void console.warn(`Row ${line} skipped: price is not a number (id ${id})`);
    }
    seen.add(id);

    const image = get("image");
    const videoId = get("videoId");
    out.push({
      id,
      name: cleanClaims(name),
      category: cleanClaims(get("category")) || "Other",
      price,
      weight: get("weight"),
      image: /^(https?:\/\/|\/)/i.test(image) ? image : "",
      shortDescription: cleanClaims(get("shortDescription")),
      ingredients: cleanClaims(get("ingredients")),
      calories: get("calories"),
      protein: get("protein"),
      carbs: get("carbs"),
      fibre: get("fibre"),
      fat: get("fat"),
      fssai: get("fssai"),
      inStock: /^true$/i.test(get("inStock")),
      videoId: /^[\w-]{11}$/.test(videoId) ? videoId : "",
      tags: cleanClaims(get("tags"))
        .split(/[,;|]/)
        .map((t) => t.trim())
        .filter(Boolean),
    });
  });
  return out;
}

function readCache(): { t: number; products: Product[] } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as { t?: number; products?: Product[] };
    if (typeof d.t !== "number" || !Array.isArray(d.products)) return null;
    return { t: d.t, products: d.products };
  } catch {
    return null;
  }
}

function writeCache(t: number, products: Product[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ t, products }));
  } catch {
    /* storage unavailable: ignore */
  }
}

/** Validates the saved-menu JSON with the same rules as the sheet. */
export function jsonToProducts(raw: Record<string, unknown>[]): Product[] {
  const rows = [[...COLUMNS] as string[], ...raw.map((o) => COLUMNS.map((c) => String(o[c] ?? "")))];
  return rowsToProducts(rows);
}

async function loadFallback(): Promise<LoadResult> {
  const res = await fetch("/data/products.json");
  if (!res.ok) throw new Error(`Saved menu failed: HTTP ${res.status}`);
  const products = jsonToProducts((await res.json()) as Record<string, unknown>[]);
  if (products.length === 0) throw new Error("Saved menu is empty");
  return { products, source: "fallback", updatedAt: Date.now() };
}

/** Live sheet (cached 5 minutes) with automatic fallback to /data/products.json. */
export async function loadProducts(force = false): Promise<LoadResult> {
  const url = import.meta.env.PUBLIC_SHEET_CSV_URL as string | undefined;
  if (url) {
    if (!force) {
      const c = readCache();
      if (c && Date.now() - c.t < CACHE_MINUTES * 60_000) {
        return { products: c.products, source: "cache", updatedAt: c.t };
      }
    }
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const products = rowsToProducts(parseCsv(await res.text()));
      if (products.length === 0) throw new Error("No valid products in sheet");
      const t = Date.now();
      writeCache(t, products);
      return { products, source: "live", updatedAt: t };
    } catch (err) {
      console.warn("Sheet load failed, using saved menu:", err);
    }
  } else {
    console.warn("PUBLIC_SHEET_CSV_URL is not set. Using saved menu.");
  }
  return loadFallback();
}
