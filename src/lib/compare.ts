export const MAX_COMPARE = 3;
const KEY = "compare:v1";

function read(): string[] {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) ?? "null") as { v?: number; ids?: unknown } | null;
    if (!d || d.v !== 1 || !Array.isArray(d.ids)) return [];
    return d.ids.filter((x): x is string => typeof x === "string").slice(0, MAX_COMPARE);
  } catch {
    return [];
  }
}

let ids = read();
const listeners = new Set<() => void>();

function commit(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, ids }));
  } catch {
    /* storage unavailable: list still works for this visit */
  }
  listeners.forEach((fn) => fn());
}

export const getIds = (): string[] => [...ids];
export const has = (id: string): boolean => ids.includes(id);
export const subscribe = (fn: () => void): void => void listeners.add(fn);

/** Adds or removes an item. Returns "full" when three items are already selected. */
export function toggle(id: string): "added" | "removed" | "full" {
  if (ids.includes(id)) {
    ids = ids.filter((x) => x !== id);
    commit();
    return "removed";
  }
  if (ids.length >= MAX_COMPARE) return "full";
  ids.push(id);
  commit();
  return "added";
}

export function remove(id: string): void {
  ids = ids.filter((x) => x !== id);
  commit();
}

export function clear(): void {
  ids = [];
  commit();
}

export function pruneMissing(valid: Set<string>): void {
  const next = ids.filter((i) => valid.has(i));
  if (next.length !== ids.length) {
    ids = next;
    commit();
  }
}

export function reload(): void {
  ids = read();
  listeners.forEach((fn) => fn());
}
