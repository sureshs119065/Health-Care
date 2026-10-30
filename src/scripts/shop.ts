import { BESTSELLER_TAG } from "../config";
import { productCard } from "../lib/card";
import { $, h, announce } from "../lib/dom";
import { packSize, unitPrice } from "../lib/pricing";
import { getProducts, loadMenu } from "../lib/store";
import type { Product } from "../lib/types";
import { setVisible } from "../lib/ui";
import { formatMoney } from "../lib/whatsapp";

type Sort = "featured" | "price-asc" | "price-desc" | "unit-asc" | "name";
type Pack = "small" | "medium" | "large";
const SORTS: Sort[] = ["featured", "price-asc", "price-desc", "unit-asc", "name"];
const PACKS: [Pack, string][] = [["small", "Up to 200 g"], ["medium", "200 to 400 g"], ["large", "400 g and above"]];
const HIDDEN_TAGS = new Set(["featured", BESTSELLER_TAG.toLowerCase()]);

const url = new URLSearchParams(window.location.search);
const list = (k: string) => (url.get(k) ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const num = (k: string) => (url.get(k) && Number.isFinite(Number(url.get(k))) ? Number(url.get(k)) : null);

let queryText = (url.get("q") ?? "").trim();
let category = url.get("category") ?? "All";
let sort: Sort = SORTS.includes(url.get("sort") as Sort) ? (url.get("sort") as Sort) : "featured";
let stockOnly = url.get("stock") === "1";
let best = url.get("bestsellers") === "1";
let min: number | null = num("min");
let max: number | null = num("max");
let packs = new Set<Pack>(list("pack").filter((p): p is Pack => PACKS.some(([k]) => k === p)));
let tags = new Set<string>(list("tag"));

function syncUrl(): void {
  const p = new URLSearchParams();
  if (queryText) p.set("q", queryText);
  if (category !== "All") p.set("category", category);
  if (sort !== "featured") p.set("sort", sort);
  if (stockOnly) p.set("stock", "1");
  if (best) p.set("bestsellers", "1");
  if (min !== null) p.set("min", String(min));
  if (max !== null) p.set("max", String(max));
  if (packs.size) p.set("pack", [...packs].join(","));
  if (tags.size) p.set("tag", [...tags].join(","));
  const qs = p.toString();
  history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
}

function packOf(p: Product): Pack | null {
  const s = packSize(p.weight);
  if (!s) return null;
  return s.amount <= 200 ? "small" : s.amount < 400 ? "medium" : "large";
}

const isBest = (p: Product) => p.tags.some((t) => t.toLowerCase() === BESTSELLER_TAG.toLowerCase());

function matches(p: Product): boolean {
  if (category !== "All" && p.category !== category) return false;
  if (stockOnly && !p.inStock) return false;
  if (best && !isBest(p)) return false;
  if (min !== null && p.price < min) return false;
  if (max !== null && p.price > max) return false;
  if (packs.size) {
    const k = packOf(p);
    if (!k || !packs.has(k)) return false;
  }
  if (tags.size && !p.tags.some((t) => tags.has(t))) return false;
  const q = queryText.toLowerCase();
  if (!q) return true;
  const hay = [p.name, p.category, p.shortDescription, p.tags.join(" ")].join(" ").toLowerCase();
  return q.split(/\s+/).every((word) => hay.includes(word));
}

function sorted(items: Product[]): Product[] {
  const out = [...items];
  const unit = (p: Product) => unitPrice(p)?.per100 ?? Number.POSITIVE_INFINITY;
  if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
  else if (sort === "unit-asc") out.sort((a, b) => unit(a) - unit(b));
  else if (sort === "name") out.sort((a, b) => a.name.localeCompare(b.name));
  else out.sort((a, b) => Number(isBest(b)) - Number(isBest(a)) || Number(b.inStock) - Number(a.inStock));
  return out;
}

/* ---------- Filter panel ---------- */
function group(title: string, ...kids: (Node | string)[]): HTMLElement {
  return h("fieldset", { class: "min-w-0" }, h("legend", { class: "mb-2 font-display text-lg font-bold" }, title), ...kids);
}

function check(label: string, checked: boolean, onchange: (on: boolean) => void, count?: number): HTMLElement {
  const box = h("input", { type: "checkbox", class: "h-5 w-5 shrink-0 accent-[#1b5e3b]", onchange: () => onchange(box.checked) });
  box.checked = checked;
  return h("label", { class: "flex min-h-11 cursor-pointer items-center gap-3" }, box, h("span", { class: "flex-1" }, label),
    count === undefined ? h("span") : h("span", { class: "text-sm text-muted" }, String(count)));
}

function renderFilters(): void {
  const all = getProducts();
  const cats = Array.from(new Set(all.map((p) => p.category))).sort();
  const radio = (c: string) => {
    const n = c === "All" ? all.length : all.filter((p) => p.category === c).length;
    const r = h("input", { type: "radio", name: "cat", class: "h-5 w-5 shrink-0 accent-[#1b5e3b]", onchange: () => { category = c; renderGrid(); } });
    r.checked = c === category;
    return h("label", { class: "flex min-h-11 cursor-pointer items-center gap-3" }, r, h("span", { class: "flex-1" }, c === "All" ? "All products" : c), h("span", { class: "text-sm text-muted" }, String(n)));
  };

  const priceInput = (id: string, label: string, val: number | null, set: (n: number | null) => void) => {
    const i = h("input", {
      id, type: "number", inputmode: "numeric", min: "0", class: "input", placeholder: label,
      onchange: () => { set(i.value === "" ? null : Math.max(0, Number(i.value))); renderGrid(); },
    });
    i.value = val === null ? "" : String(val);
    return h("div", { class: "flex-1" }, h("label", { for: id, class: "mb-1 block text-sm font-semibold" }, label), i);
  };

  const allTags = Array.from(new Set(all.flatMap((p) => p.tags))).filter((t) => !HIDDEN_TAGS.has(t.toLowerCase())).sort();

  $("#filters-body").replaceChildren(
    group("Category", h("div", {}, radio("All"), ...cats.map(radio))),
    group("Price (₹)", h("div", { class: "flex items-end gap-2" }, priceInput("f-min", "Min", min, (n) => (min = n)), priceInput("f-max", "Max", max, (n) => (max = n)))),
    group("Availability", check("In stock only", stockOnly, (on) => { stockOnly = on; renderGrid(); })),
    group("Pack size", h("div", {}, ...PACKS.map(([k, label]) => check(label, packs.has(k), (on) => { on ? packs.add(k) : packs.delete(k); renderGrid(); },
      all.filter((p) => packOf(p) === k).length)))),
    ...(allTags.length ? [group("Features", h("div", {}, ...allTags.map((t) => check(t.charAt(0).toUpperCase() + t.slice(1), tags.has(t), (on) => { on ? tags.add(t) : tags.delete(t); renderGrid(); },
      all.filter((p) => p.tags.includes(t)).length))))] : []),
    h("button", { type: "button", class: "btn btn-outline w-full max-lg:hidden", onclick: reset }, "Clear all filters"),
  );
}

/* ---------- Active filter chips ---------- */
function activeChips(): { label: string; clear: () => void }[] {
  const out: { label: string; clear: () => void }[] = [];
  if (queryText) out.push({ label: `Search: ${queryText}`, clear: () => { queryText = ""; $<HTMLInputElement>("#site-search").value = ""; } });
  if (category !== "All") out.push({ label: category, clear: () => (category = "All") });
  if (best) out.push({ label: "Bestsellers", clear: () => (best = false) });
  if (min !== null || max !== null) {
    out.push({ label: `${min !== null ? formatMoney(min) : "₹0"} to ${max !== null ? formatMoney(max) : "any"}`, clear: () => { min = null; max = null; } });
  }
  if (stockOnly) out.push({ label: "In stock", clear: () => (stockOnly = false) });
  packs.forEach((k) => out.push({ label: PACKS.find(([x]) => x === k)![1], clear: () => packs.delete(k) }));
  tags.forEach((t) => out.push({ label: t, clear: () => tags.delete(t) }));
  return out;
}

function reset(): void {
  queryText = ""; category = "All"; stockOnly = false; best = false; min = null; max = null; packs = new Set(); tags = new Set();
  $<HTMLInputElement>("#site-search").value = "";
  refresh();
}

function heading(): void {
  const title = category !== "All" ? category : best ? "Bestsellers" : queryText ? `Results for “${queryText}”` : "Shop all products";
  $("#shop-title").textContent = title;
  $("#shop-desc").textContent = category !== "All"
    ? `Everything we make in ${category}. Every pack shows its price, size and price per 100 g.`
    : best ? "The seller’s favourites, marked in the product list."
    : "Search, filter and sort. Every pack shows its price, size and price per 100 g.";
  document.title = `${title} | ${document.title.split("|").pop()?.trim() ?? ""}`;
  const crumbs = [h("li", {}, h("a", { href: "/", class: "underline-offset-2 hover:underline" }, "Home")), h("li", { "aria-hidden": "true" }, "/")];
  if (category !== "All" || best) {
    crumbs.push(h("li", {}, h("a", { href: "/shop", class: "underline-offset-2 hover:underline" }, "Shop")), h("li", { "aria-hidden": "true" }, "/"),
      h("li", {}, h("span", { "aria-current": "page" }, title)));
  } else crumbs.push(h("li", {}, h("span", { "aria-current": "page" }, "Shop")));
  $("#crumbs").replaceChildren(...crumbs);
}

function renderGrid(): void {
  const items = sorted(getProducts().filter(matches));
  const grid = $("#grid");
  grid.replaceChildren(...items.map(productCard));
  setVisible(grid, items.length > 0, "grid");
  setVisible($("#empty"), items.length === 0);
  const text = items.length === 1 ? "1 product" : `${items.length} products`;
  $("#result-count").textContent = text;
  $("#filters-apply-count").textContent = text;
  announce(text);

  const chips = activeChips();
  const box = $("#active-filters");
  box.replaceChildren(
    ...chips.map((c) => h("button", { type: "button", class: "chip min-h-9 border-leaf bg-tint py-1 text-sm text-leaf", "aria-label": `Remove filter: ${c.label}`, onclick: () => { c.clear(); refresh(); } }, `${c.label} ✕`)),
    ...(chips.length > 1 ? [h("button", { type: "button", class: "min-h-11 px-2 font-semibold text-leaf underline underline-offset-4", onclick: reset }, "Clear all")] : []),
  );
  setVisible(box, chips.length > 0, "flex");
  const badge = $("#filters-badge");
  badge.textContent = String(chips.length);
  setVisible(badge, chips.length > 0, "inline-block");
  heading();
  syncUrl();
}

function refresh(): void {
  renderFilters();
  renderGrid();
}

/* ---------- Mobile filter sheet ---------- */
const sheet = $("#filters");
const overlay = $("#filters-overlay");
let opener: HTMLElement | null = null;
const mobile = () => window.matchMedia("(max-width: 1023px)").matches;

function setSheet(open: boolean): void {
  sheet.dataset.open = String(open);
  overlay.dataset.open = String(open);
  document.body.style.overflow = open ? "hidden" : "";
  if (open) {
    opener = document.activeElement as HTMLElement | null;
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-label", "Filters");
    window.setTimeout(() => $("#filters-close").focus(), 30);
  } else {
    sheet.removeAttribute("role");
    sheet.removeAttribute("aria-modal");
    opener?.focus();
  }
}
$("#filters-open").addEventListener("click", () => setSheet(true));
$("#filters-close").addEventListener("click", () => setSheet(false));
$("#filters-apply").addEventListener("click", () => setSheet(false));
$("#filters-clear-m").addEventListener("click", reset);
overlay.addEventListener("click", () => setSheet(false));
sheet.addEventListener("keydown", (e) => {
  if (!mobile() || sheet.dataset.open !== "true") return;
  if (e.key === "Escape") return setSheet(false);
  if (e.key !== "Tab") return;
  const f = Array.from(sheet.querySelectorAll<HTMLElement>("button, input, select, a[href]")).filter((el) => el.offsetParent !== null && !(el as HTMLButtonElement).disabled);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
window.addEventListener("resize", () => { if (!mobile() && sheet.dataset.open === "true") setSheet(false); });

/* ---------- Init ---------- */
async function init(force = false): Promise<void> {
  setVisible($("#skeleton"), true, "grid");
  setVisible($("#error"), false);
  setVisible($("#empty"), false);
  setVisible($("#grid"), false, "grid");
  try {
    await loadMenu(force);
    if (category !== "All" && !getProducts().some((p) => p.category === category)) category = "All";
    setVisible($("#skeleton"), false, "grid");
    refresh();
  } catch (err) {
    console.error(err);
    setVisible($("#skeleton"), false, "grid");
    setVisible($("#error"), true);
  }
}

$<HTMLSelectElement>("#sort").value = sort;
$("#sort").addEventListener("change", (e) => {
  sort = (e.target as HTMLSelectElement).value as Sort;
  renderGrid();
});
$("#reset").addEventListener("click", reset);
$("#retry").addEventListener("click", () => void init(true));
void init();
