import * as cart from "../lib/cart";
import * as compare from "../lib/compare";
import { $, h } from "../lib/dom";
import { formatUnitPrice, unitPrice } from "../lib/pricing";
import { getProducts, loadMenu } from "../lib/store";
import type { Product } from "../lib/types";
import { PLACEHOLDER, setVisible, toast } from "../lib/ui";
import { formatMoney } from "../lib/whatsapp";

// A shared link carries the ids in the address; otherwise use this device's compare list.
const urlIds = (new URLSearchParams(window.location.search).get("ids") ?? "").split(",").filter(Boolean);
const fromLink = urlIds.length > 0;

function selected(): Product[] {
  const ids = (fromLink ? urlIds : compare.getIds()).slice(0, compare.MAX_COMPARE);
  const all = getProducts();
  return ids.map((id) => all.find((p) => p.id === id)).filter((p): p is Product => !!p);
}

const withUnit = (v: string, unit: string): string => (v === "" ? "Not given" : /[a-z]/i.test(v) ? v : `${v} ${unit}`);

function render(): void {
  const items = selected();
  setVisible($("#empty"), items.length === 0);
  setVisible($("#wrap"), items.length > 0);
  if (items.length === 0) return;

  const units = items.map((p) => unitPrice(p));
  const lowest = Math.min(...units.map((u) => u?.per100 ?? Number.POSITIVE_INFINITY));

  const row = (label: string, cell: (p: Product, i: number) => Node | string) =>
    h("tr", { class: "border-t border-line align-top" },
      h("th", { scope: "row", class: "w-36 bg-cream-dark px-3 py-3 font-semibold" }, label),
      ...items.map((p, i) => h("td", { class: "px-3 py-3" }, cell(p, i))));

  $("#compare-table").replaceChildren(
    h("thead", {},
      h("tr", {},
        h("th", { scope: "col", class: "px-3 py-3" }, h("span", { class: "sr-only" }, "Feature")),
        ...items.map((p) =>
          h("th", { scope: "col", class: "px-3 py-3" },
            h("img", { src: p.image || PLACEHOLDER, alt: p.name, width: "120", height: "120", class: "mb-2 h-24 w-24 rounded-lg bg-cream-dark object-cover" }),
            h("a", { href: `/product?id=${encodeURIComponent(p.id)}`, class: "block font-bold underline-offset-2 hover:underline" }, p.name)))))
    ,
    h("tbody", {},
      row("Price", (p) => formatMoney(p.price)),
      row("Pack size", (p) => p.weight || "Not given"),
      row("Price per 100 g or ml", (p, i) => {
        const text = formatUnitPrice(p) || "Not available";
        return units[i] && units[i]!.per100 === lowest && items.length > 1 ? `${text} (lowest here)` : text;
      }),
      row("Availability", (p) => (p.inStock ? "In stock" : "Sold out")),
      row("Energy (per 100 g)", (p) => withUnit(p.calories, "kcal")),
      row("Protein", (p) => withUnit(p.protein, "g")),
      row("Carbohydrates", (p) => withUnit(p.carbs, "g")),
      row("Fibre", (p) => withUnit(p.fibre, "g")),
      row("Fat", (p) => withUnit(p.fat, "g")),
      row("Ingredients", (p) => p.ingredients || "Ask us on WhatsApp"),
      row("Order", (p) =>
        h("div", { class: "flex flex-col gap-2" },
          p.inStock
            ? h("button", {
                type: "button",
                class: "btn btn-primary",
                onclick: () => {
                  cart.add(p.id);
                  toast(`${p.name} added to cart.`);
                },
              }, "Add to cart")
            : h("span", { class: "font-semibold" }, "Sold out"),
          fromLink
            ? h("span")
            : h("button", { type: "button", class: "btn btn-outline", onclick: () => compare.remove(p.id) }, "Remove")))),
  );
}

async function init(force = false): Promise<void> {
  setVisible($("#skeleton"), true);
  setVisible($("#error"), false);
  setVisible($("#empty"), false);
  setVisible($("#wrap"), false);
  try {
    await loadMenu(force);
    setVisible($("#skeleton"), false);
    render();
  } catch (err) {
    console.error(err);
    setVisible($("#skeleton"), false);
    setVisible($("#error"), true);
  }
}

if (!fromLink) compare.subscribe(() => getProducts().length > 0 && render());
$("#retry").addEventListener("click", () => void init(true));
void init();
