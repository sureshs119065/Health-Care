import * as cart from "./cart";
import * as compare from "./compare";
import { loadProducts, type LoadResult } from "./products";
import type { CartLine, Product } from "./types";

let products: Product[] = [];
let byId = new Map<string, Product>();
const listeners = new Set<() => void>();

export const getProducts = (): Product[] => products;
export const getProduct = (id: string): Product | undefined => byId.get(id);
export const onMenuLoaded = (fn: () => void): void => void listeners.add(fn);

export function getLines(): CartLine[] {
  const lines: CartLine[] = [];
  for (const it of cart.getItems()) {
    const p = byId.get(it.id);
    if (p) lines.push({ p, qty: it.qty });
  }
  return lines;
}

function showStatus(r: LoadResult): void {
  const notice = document.getElementById("notice");
  if (notice) {
    notice.textContent = r.source === "fallback" ? "Showing saved menu. Prices may have changed. Confirm on WhatsApp." : "";
    notice.classList.toggle("hidden", r.source !== "fallback");
  }
  const updated = document.getElementById("updated");
  if (updated) {
    updated.textContent =
      r.source === "fallback"
        ? "saved copy"
        : new Date(r.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  }
}

/** Loads the menu (sheet or saved copy), updates footer and notice, and refreshes the cart. */
let inflight: Promise<LoadResult> | null = null;

export function loadMenu(force = false): Promise<LoadResult> {
  if (!inflight) {
    inflight = fetchMenu(force).finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

async function fetchMenu(force: boolean): Promise<LoadResult> {
  try {
    const r = await loadProducts(force);
    products = r.products;
    byId = new Map(products.map((p) => [p.id, p]));
    cart.pruneMissing(new Set(byId.keys()));
    compare.pruneMissing(new Set(byId.keys()));
    showStatus(r);
    listeners.forEach((fn) => fn());
    return r;
  } catch (err) {
    const updated = document.getElementById("updated");
    if (updated) updated.textContent = "not available";
    throw err;
  }
}
