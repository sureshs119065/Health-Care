// Runs on every page: cart counts, mobile cart bar, and the slide-in cart drawer.
import "./header";
import "./compare-tray";
import { ENABLE_PWA } from "../config";
import * as cart from "../lib/cart";
import { readForm, resetForm, sendOrder } from "../lib/checkout";
import { $ } from "../lib/dom";
import { getLines, onMenuLoaded } from "../lib/store";
import { cartRow, setVisible, toast } from "../lib/ui";
import { formatMoney, grandTotal } from "../lib/whatsapp";

const byId = (id: string) => document.getElementById(id);
const drawer = byId("drawer");

function renderShell(): void {
  const items = cart.getItems();
  const count = items.reduce((s, i) => s + i.qty, 0);
  const lines = getLines();
  const total = formatMoney(grandTotal(lines));

  for (const id of ["header-count", "bar-count"]) {
    const el = byId(id);
    if (el) el.textContent = String(count);
  }
  const bar = byId("cart-bar");
  if (bar) {
    setVisible(bar, count > 0);
    byId("bar-total")!.textContent = lines.length ? total : "";
  }
  if (drawer) renderDrawer(items.length, lines, total);
}

function renderDrawer(itemCount: number, lines: ReturnType<typeof getLines>, total: string): void {
  const list = $("#cart-list");
  list.replaceChildren(...lines.map(cartRow));
  setVisible(list, lines.length > 0);

  const empty = $("#cart-empty");
  empty.textContent = itemCount > 0 ? "Loading your cart…" : "Your cart is empty. Add something from the menu.";
  setVisible(empty, lines.length === 0);

  const soldOut = lines.filter((l) => !l.p.inStock);
  const warn = $("#cart-warning");
  warn.textContent = soldOut.length ? `Remove sold out items to continue: ${soldOut.map((l) => l.p.name).join(", ")}.` : "";
  setVisible(warn, soldOut.length > 0);

  $("#cart-total").textContent = total;
  $("#d-total").textContent = total;
  $<HTMLButtonElement>("#to-checkout").disabled = lines.length === 0 || soldOut.length > 0;

  if (isOpen() && itemCount === 0 && $("#view-sent").hidden) setView("cart");
}

/* ---------- Drawer ---------- */

type View = "cart" | "checkout" | "sent";
let lastFocus: HTMLElement | null = null;
const isOpen = (): boolean => !!drawer && !drawer.hasAttribute("inert");

function setView(view: View): void {
  setVisible($("#view-cart"), view === "cart", "flex");
  setVisible($("#view-checkout"), view === "checkout");
  setVisible($("#view-sent"), view === "sent");
  $("#drawer-title").textContent = { cart: "Your cart", checkout: "Your details", sent: "Almost done" }[view];
  $("#view-" + view).scrollTo(0, 0);
}

function openDrawer(): void {
  if (!drawer) return;
  lastFocus = document.activeElement as HTMLElement | null;
  setView("cart");
  drawer.removeAttribute("inert");
  drawer.classList.remove("pointer-events-none");
  $("#overlay").classList.replace("opacity-0", "opacity-100");
  $("#panel").classList.remove("translate-x-full");
  document.body.style.overflow = "hidden";
  window.setTimeout(() => $("#close").focus(), 50);
}

function closeDrawer(): void {
  if (!drawer) return;
  drawer.setAttribute("inert", "");
  drawer.classList.add("pointer-events-none");
  $("#overlay").classList.replace("opacity-100", "opacity-0");
  $("#panel").classList.add("translate-x-full");
  document.body.style.overflow = "";
  lastFocus?.focus();
}

if (drawer) {
  const panel = $("#panel");

  drawer.addEventListener("keydown", (e) => {
    if (e.key === "Escape") return closeDrawer();
    if (e.key !== "Tab") return;
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input, textarea"),
    ).filter((el) => !el.closest("[hidden]") && el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  byId("bar-btn")?.addEventListener("click", openDrawer);
  byId("header-cart")?.addEventListener("click", (e) => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      e.preventDefault();
      openDrawer();
    }
  });
  $("#close").addEventListener("click", closeDrawer);
  $("#overlay").addEventListener("click", closeDrawer);
  $("#to-checkout").addEventListener("click", () => {
    setView("checkout");
    $("#d-name").focus();
  });
  $("#d-back").addEventListener("click", () => setView("cart"));
  $("#sent-back").addEventListener("click", () => setView("cart"));

  $("#d-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const lines = getLines();
    if (lines.length === 0 || lines.some((l) => !l.p.inStock)) return setView("cart");
    const data = readForm("d");
    if (!data) return;
    $<HTMLAnchorElement>("#reopen").href = sendOrder(lines, data);
    setView("sent");
    $("#sent-done").focus();
  });

  $("#sent-done").addEventListener("click", () => {
    cart.clear();
    resetForm("d");
    closeDrawer();
    toast("Thank you. We will confirm your total on WhatsApp.");
  });

  // The cart page sends mobile visitors here with ?cart=1
  const url = new URL(window.location.href);
  if (url.searchParams.get("cart") === "1") {
    url.searchParams.delete("cart");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
    openDrawer();
  }
}

cart.subscribe(renderShell);
onMenuLoaded(renderShell);
window.addEventListener("storage", (e) => {
  if (e.key === "cart:v1") cart.reload();
});
renderShell();

// Optional offline support. When ENABLE_PWA is false, any old service worker is removed.
if ("serviceWorker" in navigator) {
  if (ENABLE_PWA) {
    navigator.serviceWorker.register("/sw.js").catch((err) => console.warn("Service worker failed:", err));
  } else {
    navigator.serviceWorker
      .getRegistrations()
      .then((list) => list.forEach((r) => void r.unregister()))
      .catch(() => {});
  }
}
