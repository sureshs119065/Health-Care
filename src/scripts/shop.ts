import { $, h } from "../lib/dom";
import { productCard } from "../lib/card";
import { unitPrice } from "../lib/pricing";
import { getProducts, loadMenu } from "../lib/store";
import type { Product } from "../lib/types";
import { setVisible } from "../lib/ui";

type Sort = "featured" | "price-asc" | "price-desc" | "unit-asc" | "name";
const SORTS: Sort[] = ["featured", "price-asc", "price-desc", "unit-asc", "name"];

const url = new URLSearchParams(window.location.search);
let query = (url.get("q") ?? "").trim().toLowerCase();
let queryText = (url.get("q") ?? "").trim();
let category = url.get("category") ?? "All";
let sort: Sort = SORTS.includes(url.get("sort") as Sort) ? (url.get("sort") as Sort) : "featured";
let stockOnly = url.get("stock") === "1";

function syncUrl(): void {
  const p = new URLSearchParams();
  if (queryText) p.set("q", queryText);
  if (category !== "All") p.set("category", category);
  if (sort !== "featured") p.set("sort", sort);
  if (stockOnly) p.set("stock", "1");
  const qs = p.toString();
  history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
}

function matches(p: Product): boolean {
  if (category !== "All" && p.category !== category) return false;
  if (stockOnly && !p.inStock) return false;
  if (!query) return true;
  const hay = [p.name, p.category, p.shortDescription, p.tags.join(" ")].join(" ").toLowerCase();
  return query.split(/\s+/).every((word) => hay.includes(word));
}

function sorted(list: Product[]): Product[] {
  const out = [...list];
  const unit = (p: Product) => unitPrice(p)?.per100 ?? Number.POSITIVE_INFINITY;
  if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
  else if (sort === "unit-asc") out.sort((a, b) => unit(a) - unit(b));
  else if (sort === "name") out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

function renderChips(): void {
  const all = getProducts();
  const cats = Array.from(new Set(all.map((p) => p.category))).sort();
  const chips = $("#chips");
  chips.replaceChildren(
    ...["All", ...cats].map((c) => {
      const n = c === "All" ? all.length : all.filter((p) => p.category === c).length;
      return h("button", {
        type: "button",
        class: "chip",
        "aria-pressed": String(c === category),
        onclick: () => {
          category = c;
          renderChips();
          renderGrid();
        },
      }, `${c} (${n})`);
    }),
  );
}

function renderGrid(): void {
  const list = sorted(getProducts().filter(matches));
  const grid = $("#grid");
  grid.replaceChildren(...list.map(productCard));
  setVisible(grid, list.length > 0, "grid");
  setVisible($("#empty"), list.length === 0);
  $("#result-count").textContent = list.length === 1 ? "1 item" : `${list.length} items`;

  const banner = $("#active-search");
  $("#active-search-text").textContent = queryText ? `Results for “${queryText}”` : "";
  setVisible(banner, queryText !== "", "flex");
  syncUrl();
}

async function init(force = false): Promise<void> {
  setVisible($("#skeleton"), true, "grid");
  setVisible($("#error"), false);
  setVisible($("#empty"), false);
  setVisible($("#grid"), false, "grid");
  try {
    await loadMenu(force);
    if (category !== "All" && !getProducts().some((p) => p.category === category)) category = "All";
    setVisible($("#skeleton"), false, "grid");
    renderChips();
    renderGrid();
  } catch (err) {
    console.error(err);
    setVisible($("#skeleton"), false, "grid");
    setVisible($("#error"), true);
  }
}

$<HTMLSelectElement>("#sort").value = sort;
$<HTMLInputElement>("#f-stock").checked = stockOnly;
$("#sort").addEventListener("change", (e) => {
  sort = (e.target as HTMLSelectElement).value as Sort;
  renderGrid();
});
$("#f-stock").addEventListener("change", (e) => {
  stockOnly = (e.target as HTMLInputElement).checked;
  renderGrid();
});
$("#reset").addEventListener("click", () => {
  query = "";
  queryText = "";
  category = "All";
  stockOnly = false;
  $<HTMLInputElement>("#f-stock").checked = false;
  $<HTMLInputElement>("#site-search").value = "";
  renderChips();
  renderGrid();
});
$("#retry").addEventListener("click", () => void init(true));
void init();
