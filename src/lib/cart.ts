import { MAX_QTY } from "../config";

const KEY = "cart:v1";

export interface CartItem {
  id: string;
  qty: number;
}

type Stored = { v?: number; items?: { id?: unknown; qty?: unknown }[] };

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const d = JSON.parse(raw) as Stored;
    if (d.v !== 1 || !Array.isArray(d.items)) return [];
    const items: CartItem[] = [];
    for (const i of d.items) {
      if (typeof i.id === "string" && Number.isInteger(i.qty) && (i.qty as number) > 0) {
        items.push({ id: i.id, qty: Math.min(i.qty as number, MAX_QTY) });
      }
    }
    return items;
  } catch {
    return [];
  }
}

let items: CartItem[] = read();
const listeners = new Set<() => void>();

function commit(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, items }));
  } catch {
    /* storage unavailable: cart still works for this visit */
  }
  listeners.forEach((fn) => fn());
}

export const getItems = (): CartItem[] => items.map((i) => ({ ...i }));
export const subscribe = (fn: () => void): void => void listeners.add(fn);

export function add(id: string, n = 1): void {
  const found = items.find((i) => i.id === id);
  if (found) found.qty = Math.min(found.qty + n, MAX_QTY);
  else items.push({ id, qty: Math.min(n, MAX_QTY) });
  commit();
}

export function setQty(id: string, qty: number): void {
  if (qty <= 0) items = items.filter((i) => i.id !== id);
  else {
    const found = items.find((i) => i.id === id);
    if (found) found.qty = Math.min(qty, MAX_QTY);
  }
  commit();
}

export function remove(id: string): void {
  setQty(id, 0);
}

export function clear(): void {
  items = [];
  commit();
}

/** Drops items that no longer exist in the menu. */
export function pruneMissing(validIds: Set<string>): void {
  const next = items.filter((i) => validIds.has(i.id));
  if (next.length !== items.length) {
    items = next;
    commit();
  }
}

/** Re-reads storage (used when another tab changes the cart). */
export function reload(): void {
  items = read();
  listeners.forEach((fn) => fn());
}
