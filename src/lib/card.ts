import * as cart from "./cart";
import * as compare from "./compare";
import { h } from "./dom";
import { formatUnitPrice } from "./pricing";
import type { Product } from "./types";
import { PLACEHOLDER, toast } from "./ui";
import { formatMoney } from "./whatsapp";

function syncChecks(): void {
  document.querySelectorAll<HTMLInputElement>("input[data-compare]").forEach((box) => {
    box.checked = compare.has(box.dataset.compare ?? "");
  });
}
compare.subscribe(syncChecks);

/** One product card, used on the home page, the shop page and the recipe page. */
export function productCard(p: Product): HTMLElement {
  const href = `/product?id=${encodeURIComponent(p.id)}`;
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

  const media = h("a", { href, tabindex: "-1", "aria-hidden": "true", class: "relative block" }, img);
  if (!p.inStock) {
    media.append(h("span", { class: "absolute left-2 top-2 rounded-md bg-ink px-2 py-1 text-sm font-bold text-white" }, "Sold out"));
  }

  const unit = formatUnitPrice(p);
  const add = h("button", {
    type: "button",
    class: "btn btn-primary w-full",
    disabled: !p.inStock,
    "aria-label": p.inStock ? `Add ${p.name} to cart` : `${p.name} is sold out`,
    onclick: () => {
      if (!p.inStock) return;
      cart.add(p.id);
      toast(`${p.name} added to cart.`);
    },
  }, p.inStock ? "Add to cart" : "Sold out");

  const box = h("input", {
    type: "checkbox",
    class: "h-5 w-5 accent-[#1f5d3a]",
    "data-compare": p.id,
    onchange: () => {
      const result = compare.toggle(p.id);
      if (result === "full") {
        box.checked = false;
        toast(`You can compare up to ${compare.MAX_COMPARE} items. Remove one first.`);
      }
    },
  });
  box.checked = compare.has(p.id);

  return h("li", { class: "card flex flex-col overflow-hidden" },
    media,
    h("div", { class: "flex flex-1 flex-col gap-1 p-3" },
      h("h3", { class: "text-base font-bold leading-snug" },
        h("a", { href, class: "underline-offset-2 hover:underline" }, p.name)),
      h("p", { class: "text-sm" }, [p.weight, p.inStock ? "In stock" : "Sold out"].filter(Boolean).join(" · ")),
      h("p", { class: "mt-1 text-xl font-bold text-ink" }, formatMoney(p.price)),
      h("p", { class: "min-h-5 text-sm text-ink/80" }, unit),
      h("div", { class: "mt-auto space-y-1 pt-2" },
        add,
        h("label", { class: "flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold" }, box, "Compare"))));
}
