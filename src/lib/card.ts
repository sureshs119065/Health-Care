import * as cart from "./cart";
import * as compare from "./compare";
import { h } from "./dom";
import { iconEl } from "./icons";
import { productImg } from "./media";
import { formatUnitPrice, offerInfo } from "./pricing";
import { openQuickView } from "./quickview";
import type { Product } from "./types";
import { toast } from "./ui";
import { formatMoney } from "./whatsapp";

function syncChecks(): void {
  document.querySelectorAll<HTMLInputElement>("input[data-compare]").forEach((box) => {
    box.checked = compare.has(box.dataset.compare ?? "");
  });
}
compare.subscribe(syncChecks);

/** One product card, used on the home page, shop, product page and recipe page. */
export function productCard(p: Product): HTMLElement {
  const href = `/product?id=${encodeURIComponent(p.id)}`;
  const offer = offerInfo(p);
  const img = productImg(p, "aspect-square w-full bg-cream-dark object-cover transition duration-300 group-hover:scale-[1.03]", 400);

  const quick = h("button", {
    type: "button",
    class: "absolute bottom-2 right-2 inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-full bg-surface/95 px-3 text-sm font-semibold text-leaf shadow-md transition hover:bg-surface focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100",
    "aria-label": `Quick view ${p.name}`,
    onclick: (e: Event) => openQuickView(p, e.currentTarget as HTMLElement),
  });
  quick.append(iconEl("eye", 18), h("span", { class: "hidden lg:inline" }, "Quick view"));

  const media = h("div", { class: "relative overflow-hidden" },
    h("a", { href, tabindex: "-1", "aria-hidden": "true", class: "block" }, img),
    quick);
  if (!p.inStock) {
    media.append(h("span", { class: "badge absolute left-2 top-2 bg-fg text-white" }, "Sold out"));
  } else if (offer) {
    media.append(h("span", { class: "badge absolute left-2 top-2 bg-berry text-white" }, p.tags.some((t) => t.toLowerCase() === "diwali") ? "Diwali offer" : `${offer.percent}% off`));
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
    class: "h-5 w-5 accent-[#1b5e3b]",
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

  return h("li", { class: "card group flex flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]" },
    media,
    h("div", { class: "flex flex-1 flex-col gap-1 p-3" },
      h("p", { class: "text-xs font-semibold text-leaf" }, p.category),
      h("h3", { class: "text-base font-bold leading-snug" },
        h("a", { href, class: "underline-offset-2 hover:underline" }, p.name)),
      h("p", { class: "flex items-center gap-1.5 text-sm text-muted" },
        p.weight || "",
        h("span", { class: p.inStock ? "ml-auto inline-flex items-center gap-1 font-semibold text-leaf" : "ml-auto font-semibold text-fg" },
          p.inStock ? h("span", { class: "h-2 w-2 rounded-full bg-leaf-soft", "aria-hidden": "true" }) : h("span"),
          p.inStock ? "In stock" : "Sold out")),
      h("p", { class: "mt-1 flex flex-wrap items-baseline gap-x-2 text-xl font-bold text-fg" }, formatMoney(p.price),
        ...(offer ? [h("s", { class: "text-sm font-medium text-muted" }, formatMoney(offer.mrp)), h("span", { class: "text-sm font-bold text-berry" }, `Save ${formatMoney(offer.save)}`)] : [])),
      h("p", { class: "min-h-5 text-sm text-muted" }, unit),
      h("div", { class: "mt-auto space-y-1 pt-2" },
        add,
        h("label", { class: "flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold" }, box, "Compare"))));
}
