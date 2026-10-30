import { DIWALI } from "../config";
import * as cart from "./cart";
import { h } from "./dom";
import { productImg } from "./media";
import { formatUnitPrice, offerInfo } from "./pricing";
import { getProduct } from "./store";
import { toast } from "./ui";
import { formatMoney } from "./whatsapp";

/** Fills the container with the Diwali offer product. Returns false (and leaves it empty) when the product is not in the menu. */
export function renderDiwaliOffer(container: HTMLElement): boolean {
  const p = getProduct(DIWALI.productId);
  if (!DIWALI.enabled || !p) { container.replaceChildren(); return false; }
  const offer = offerInfo(p);
  const unit = formatUnitPrice(p);
  const href = `/product?id=${encodeURIComponent(p.id)}`;

  const add = h("button", {
    type: "button",
    class: "btn btn-accent btn-lg",
    disabled: !p.inStock,
    onclick: () => { if (p.inStock) { cart.add(p.id); toast(`${p.name} added to cart.`); } },
  }, p.inStock ? "Add to cart" : "Sold out");

  container.replaceChildren(
    h("div", { class: "grid overflow-hidden rounded-[1.75rem] border border-white/25 bg-white/10 text-left backdrop-blur-sm sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" },
      h("a", { href, class: "relative block bg-white/10", tabindex: "-1", "aria-hidden": "true" },
        productImg(p, "aspect-square h-full w-full object-cover", 600, 0, true),
        offer ? h("span", { class: "badge absolute left-3 top-3 bg-berry px-3 py-1 text-sm text-white" }, `${offer.percent}% off`) : h("span")),
      h("div", { class: "flex flex-col gap-2 p-5 md:p-7" },
        h("p", { class: "badge w-fit bg-accent text-ink" }, "Diwali special"),
        h("h3", { class: "text-2xl font-bold md:text-3xl" }, h("a", { href, class: "underline-offset-4 hover:underline" }, p.name)),
        p.shortDescription ? h("p", { class: "text-white/90" }, p.shortDescription) : h("span"),
        h("p", { class: "mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1" },
          h("span", { class: "text-4xl font-bold text-accent" }, formatMoney(p.price)),
          offer ? h("s", { class: "text-xl text-white/70" }, formatMoney(offer.mrp)) : h("span"),
          offer ? h("span", { class: "badge bg-white px-3 py-1 text-sm text-berry" }, `You save ${formatMoney(offer.save)}`) : h("span")),
        h("p", { class: "text-sm text-white/80" }, [p.weight, unit].filter(Boolean).join(" · ")),
        DIWALI.validity ? h("p", { class: "text-sm font-semibold text-accent" }, DIWALI.validity) : h("span"),
        h("div", { class: "mt-3 flex flex-wrap gap-3" },
          add,
          h("a", { href, class: "btn btn-ghost-light btn-lg" }, "View details")))));
  return true;
}
