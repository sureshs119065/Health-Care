import { MAX_QTY } from "../config";
import * as cart from "./cart";
import { h } from "./dom";
import { iconEl } from "./icons";
import { productImg } from "./media";
import { formatUnitPrice } from "./pricing";
import type { Product } from "./types";
import { toast } from "./ui";
import { formatMoney } from "./whatsapp";

let dlg: HTMLDialogElement | null = null;
let opener: HTMLElement | null = null;

function ensure(): HTMLDialogElement {
  if (dlg) return dlg;
  dlg = h("dialog", { class: "qv", "aria-labelledby": "qv-title" });
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg?.close();
  });
  dlg.addEventListener("close", () => opener?.focus());
  document.body.append(dlg);
  return dlg;
}

/** Native <dialog> quick view: focus is trapped and Escape closes it. */
export function openQuickView(p: Product, from?: HTMLElement): void {
  const d = ensure();
  opener = from ?? (document.activeElement as HTMLElement | null);
  let qty = 1;
  const out = h("output", { class: "min-w-10 text-center text-xl font-bold", "aria-label": "Quantity" }, "1");
  const dec = h("button", { type: "button", class: "btn btn-outline px-0", "aria-label": "Decrease quantity", onclick: () => set(qty - 1) }, "−");
  const inc = h("button", { type: "button", class: "btn btn-outline px-0", "aria-label": "Increase quantity", onclick: () => set(qty + 1) }, "+");
  function set(n: number): void {
    qty = Math.min(MAX_QTY, Math.max(1, n));
    out.textContent = String(qty);
    dec.disabled = qty <= 1;
    inc.disabled = qty >= MAX_QTY;
  }
  set(1);

  const href = `/product?id=${encodeURIComponent(p.id)}`;
  const close = h("button", {
    type: "button",
    class: "absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-fg shadow-md hover:bg-cream-dark",
    "aria-label": "Close quick view",
    onclick: () => d.close(),
  });
  close.append(iconEl("close", 22));

  const unit = formatUnitPrice(p);
  d.replaceChildren(
    h("div", { class: "relative grid max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-[1.5rem] bg-surface shadow-[var(--shadow-pop)] md:grid-cols-2" },
      close,
      productImg(p, "aspect-square w-full bg-cream-dark object-cover", 640, 0, true),
      h("div", { class: "flex flex-col gap-3 p-5 md:p-7" },
        h("p", { class: "text-sm font-semibold text-leaf" }, p.category),
        h("h2", { id: "qv-title", class: "text-2xl font-bold" }, p.name),
        h("p", { class: "text-3xl font-bold" }, formatMoney(p.price), h("span", { class: "ml-2 text-base font-medium text-muted" }, p.weight)),
        unit ? h("p", { class: "text-sm text-muted" }, unit) : h("span"),
        h("p", { class: p.inStock ? "badge w-fit bg-tint text-leaf" : "badge w-fit bg-fg text-white" }, p.inStock ? "In stock" : "Sold out"),
        p.shortDescription ? h("p", {}, p.shortDescription) : h("span"),
        p.inStock
          ? h("div", { class: "mt-1 flex flex-wrap items-center gap-3" },
              h("div", { class: "flex items-center gap-2" }, dec, out, inc),
              h("button", {
                type: "button",
                class: "btn btn-accent flex-1",
                onclick: () => {
                  cart.add(p.id, qty);
                  toast(`${qty} x ${p.name} added to cart.`);
                  d.close();
                },
              }, "Add to cart"))
          : h("p", { class: "font-semibold" }, "This item is sold out right now."),
        h("a", { href, class: "link-more" }, "See full details, ingredients and nutrition"))),
  );
  d.showModal();
}
