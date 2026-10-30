import { MAX_QTY } from "../config";
import * as cart from "./cart";
import { announce, h } from "./dom";
import { productImg } from "./media";
import type { CartLine } from "./types";
import { formatMoney, lineTotal } from "./whatsapp";

export const PLACEHOLDER = "/images/placeholder.svg";

/** Show or hide an element. `display` is the Tailwind display class the element uses when visible. */
export function setVisible(el: HTMLElement, on: boolean, display?: string): void {
  el.classList.toggle("hidden", !on);
  if (display) el.classList.toggle(display, on);
  el.hidden = !on;
}

let toastTimer = 0;
/** Small confirmation message that is also read out to screen readers. */
export function toast(message: string): void {
  announce(message);
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = message;
  t.classList.remove("hidden");
  t.dataset.show = "false";
  void t.offsetWidth;
  t.dataset.show = "true";
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    t.dataset.show = "false";
    window.setTimeout(() => t.classList.add("hidden"), 220);
  }, 2600);
}

export function cartRow(l: CartLine): HTMLElement {
  const { p, qty } = l;
  const step = (delta: number, label: string, symbol: string) =>
    h("button", {
      type: "button",
      class: "btn btn-outline min-h-11 px-0",
      "aria-label": `${label} ${p.name}`,
      disabled: delta > 0 && qty >= MAX_QTY,
      onclick: () => {
        cart.setQty(p.id, qty + delta);
        announce(`${p.name}: quantity ${Math.max(qty + delta, 0)}.`);
      },
    }, symbol);

  return h(
    "li",
    { class: "flex gap-3 py-4" },
    h("a", { href: `/product?id=${encodeURIComponent(p.id)}`, class: "shrink-0", tabindex: "-1", "aria-hidden": "true" },
      productImg(p, "h-20 w-20 rounded-xl bg-cream-dark object-cover", 160)),
    h("div", { class: "min-w-0 flex-1" },
      h("div", { class: "flex justify-between gap-3" },
        h("a", { href: `/product?id=${encodeURIComponent(p.id)}`, class: "font-semibold leading-snug underline-offset-2 hover:underline" },
          p.name, p.weight ? ` (${p.weight})` : ""),
        h("p", { class: "font-bold" }, formatMoney(lineTotal(l)))),
      h("p", { class: "text-sm text-muted" }, `${formatMoney(p.price)} each${p.inStock ? "" : " (sold out)"}`),
      h("div", { class: "mt-2 flex items-center gap-2" },
        step(-1, "Decrease quantity of", "−"),
        h("span", { class: "min-w-8 text-center text-lg font-bold", "aria-label": `Quantity ${qty}` }, String(qty)),
        step(1, "Increase quantity of", "+"),
        h("button", {
          type: "button",
          class: "btn ml-auto px-2 text-red-800 underline",
          "aria-label": `Remove ${p.name}`,
          onclick: () => {
            cart.remove(p.id);
            announce(`${p.name} removed from cart.`);
          },
        }, "Remove"))),
  );
}
