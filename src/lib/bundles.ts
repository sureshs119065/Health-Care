import { BUNDLES } from "../config";
import * as cart from "./cart";
import { h } from "./dom";
import { productImg } from "./media";
import { getProduct } from "./store";
import type { Product } from "./types";
import { toast } from "./ui";
import { formatMoney } from "./whatsapp";

/** Renders the ready-made sets from config. Returns how many were shown. Price = plain sum of items (no discount). */
export function renderBundles(container: HTMLElement): number {
  const cards: HTMLElement[] = [];
  for (const b of BUNDLES) {
    const items = b.ids.map((id) => getProduct(id));
    if (items.length === 0 || items.some((p) => !p)) continue;
    const ps = items as Product[];
    const total = ps.reduce((s, p) => s + p.price, 0);
    const soldOut = ps.filter((p) => !p.inStock);
    cards.push(
      h("li", { class: "card flex flex-col gap-3 p-4" },
        h("div", { class: "flex -space-x-4", "aria-hidden": "true" },
          ...ps.slice(0, 4).map((p) => productImg(p, "h-20 w-20 rounded-2xl border-4 border-white bg-cream-dark object-cover", 160))),
        h("h3", { class: "text-xl font-bold" }, b.title),
        h("p", { class: "text-muted" }, b.text),
        h("ul", { class: "space-y-0.5 text-sm" },
          ...ps.map((p) => h("li", {}, h("a", { href: `/product?id=${encodeURIComponent(p.id)}`, class: "underline-offset-2 hover:underline" }, p.name), h("span", { class: "text-muted" }, ` · ${p.weight}`)))),
        h("div", { class: "mt-auto flex flex-wrap items-center justify-between gap-2 pt-2" },
          h("p", {}, h("span", { class: "block text-xs text-muted" }, "Set total (same as buying separately)"), h("span", { class: "text-2xl font-bold" }, formatMoney(total))),
          soldOut.length
            ? h("span", { class: "text-sm font-semibold" }, `${soldOut[0].name} is sold out`)
            : h("button", {
                type: "button",
                class: "btn btn-accent",
                onclick: () => {
                  ps.forEach((p) => cart.add(p.id));
                  toast(`${b.title} added to cart.`);
                },
              }, "Add set to cart"))),
    );
  }
  container.replaceChildren(...cards);
  return cards.length;
}
