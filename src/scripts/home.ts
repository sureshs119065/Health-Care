import * as cart from "../lib/cart";
import { $, h } from "../lib/dom";
import { getProducts, loadMenu } from "../lib/store";
import type { Product } from "../lib/types";
import { PLACEHOLDER, setVisible, toast } from "../lib/ui";
import { formatMoney } from "../lib/whatsapp";

let category = "All";
let query = "";

function renderChips(): void {
  const chips = $("#chips");
  chips.replaceChildren();
  const cats = ["All", ...Array.from(new Set(getProducts().map((p) => p.category))).sort()];
  for (const c of cats) {
    chips.append(
      h("button", {
        type: "button",
        class: "chip",
        "aria-pressed": String(c === category),
        onclick: () => {
          category = c;
          renderChips();
          renderGrid();
        },
      }, c),
    );
  }
}

function matches(p: Product): boolean {
  if (category !== "All" && p.category !== category) return false;
  if (!query) return true;
  const hay = [p.name, p.category, p.shortDescription, p.tags.join(" ")].join(" ").toLowerCase();
  return query.split(/\s+/).every((word) => hay.includes(word));
}

function card(p: Product): HTMLElement {
  const img = h("img", {
    src: p.image || PLACEHOLDER,
    alt: p.name,
    width: "400",
    height: "400",
    loading: "lazy",
    decoding: "async",
    class: "aspect-square w-full bg-cream-dark object-cover",
  });
  img.addEventListener("error", () => {
    if (!img.src.endsWith(PLACEHOLDER)) img.src = PLACEHOLDER;
  });

  const media = h("div", { class: "relative" }, img);
  if (!p.inStock) {
    media.append(h("span", { class: "absolute left-2 top-2 rounded-md bg-ink px-2 py-1 text-sm font-bold text-white" }, "Sold out"));
  }

  const add = h("button", {
    type: "button",
    class: "btn btn-primary mt-auto w-full",
    disabled: !p.inStock,
    "aria-label": p.inStock ? `Add ${p.name} to cart` : `${p.name} is sold out`,
    onclick: () => {
      if (!p.inStock) return;
      cart.add(p.id);
      toast(`${p.name} added to cart.`);
    },
  }, p.inStock ? "Add to cart" : "Sold out");

  return h("li", { class: "flex flex-col overflow-hidden rounded-xl border border-line bg-white" },
    media,
    h("div", { class: "flex flex-1 flex-col gap-1 p-3" },
      h("h3", { class: "text-base font-bold" },
        h("a", { href: `/product?id=${encodeURIComponent(p.id)}`, class: "underline-offset-2 hover:underline" }, p.name)),
      h("p", { class: "text-sm" }, p.weight),
      h("p", { class: "mb-2 text-lg font-bold text-leaf" }, formatMoney(p.price)),
      add));
}

function renderGrid(): void {
  const grid = $("#grid");
  const list = getProducts().filter(matches);
  grid.replaceChildren(...list.map(card));
  setVisible(grid, list.length > 0, "grid");
  setVisible($("#empty"), list.length === 0);
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

$("#retry").addEventListener("click", () => void init(true));
$<HTMLInputElement>("#search").addEventListener("input", (e) => {
  query = (e.target as HTMLInputElement).value.trim().toLowerCase();
  renderGrid();
});

void init();
