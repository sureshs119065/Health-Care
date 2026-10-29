// Header behaviour: collapsible mobile menu and search with suggestions.
import { $, h } from "../lib/dom";
import { getProducts, loadMenu } from "../lib/store";

/* ---------- Mobile menu ---------- */
const menuBtn = document.getElementById("menu-btn");
const mobileNav = document.getElementById("mobile-nav");

function setMenu(open: boolean): void {
  if (!menuBtn || !mobileNav) return;
  mobileNav.hidden = !open;
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
menuBtn?.addEventListener("click", () => setMenu(mobileNav?.hidden ?? false));
mobileNav?.addEventListener("click", (e) => {
  if ((e.target as HTMLElement).closest("a")) setMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileNav && !mobileNav.hidden) {
    setMenu(false);
    menuBtn?.focus();
  }
});

/* ---------- Search with suggestions ---------- */
interface Option {
  label: string;
  hint: string;
  href: string;
}

const form = $<HTMLFormElement>("#search-form");
const input = $<HTMLInputElement>("#site-search");
const list = $("#search-list");
let options: Option[] = [];
let active = -1;

const params = new URLSearchParams(window.location.search);
if (params.get("q")) input.value = params.get("q") ?? "";

function close(): void {
  list.hidden = true;
  input.setAttribute("aria-expanded", "false");
  input.removeAttribute("aria-activedescendant");
  active = -1;
}

function setActive(i: number): void {
  active = i;
  list.querySelectorAll("li").forEach((li, n) => li.setAttribute("aria-selected", String(n === i)));
  if (i >= 0) input.setAttribute("aria-activedescendant", `so-${i}`);
  else input.removeAttribute("aria-activedescendant");
}

function build(q: string): Option[] {
  const products = getProducts();
  const needle = q.toLowerCase();
  const byName = products
    .filter((p) => [p.name, p.category, p.tags.join(" ")].join(" ").toLowerCase().includes(needle))
    .sort((a, b) => Number(b.name.toLowerCase().startsWith(needle)) - Number(a.name.toLowerCase().startsWith(needle)))
    .slice(0, 5)
    .map((p) => ({ label: p.name, hint: p.weight || "Product", href: `/product?id=${encodeURIComponent(p.id)}` }));
  const cats = Array.from(new Set(products.map((p) => p.category)))
    .filter((c) => c.toLowerCase().includes(needle))
    .slice(0, 2)
    .map((c) => ({ label: c, hint: "Category", href: `/shop?category=${encodeURIComponent(c)}` }));
  return [
    ...byName,
    ...cats,
    { label: `See all results for “${q}”`, hint: "Shop", href: `/shop?q=${encodeURIComponent(q)}` },
  ];
}

function render(): void {
  const q = input.value.trim();
  if (q.length < 2) return close();
  options = build(q);
  list.replaceChildren(
    ...options.map((o, i) =>
      h("li", {
        id: `so-${i}`,
        role: "option",
        "aria-selected": "false",
        class: "flex min-h-11 cursor-pointer items-center justify-between gap-3 px-4 py-2 hover:bg-cream-dark",
        onmousedown: (e: Event) => {
          e.preventDefault();
          window.location.href = o.href;
        },
      }, h("span", { class: "font-semibold" }, o.label), h("span", { class: "text-sm" }, o.hint)),
    ),
  );
  list.hidden = false;
  input.setAttribute("aria-expanded", "true");
  active = -1;
}

function ensureMenu(): void {
  if (getProducts().length === 0) loadMenu().then(render).catch(() => {});
}

input.addEventListener("focus", ensureMenu);
input.addEventListener("input", () => {
  ensureMenu();
  render();
});
input.addEventListener("keydown", (e) => {
  if (list.hidden) return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setActive((active + 1) % options.length);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setActive(active <= 0 ? options.length - 1 : active - 1);
  } else if (e.key === "Enter" && active >= 0) {
    e.preventDefault();
    window.location.href = options[active].href;
  } else if (e.key === "Escape") {
    close();
  }
});
document.addEventListener("click", (e) => {
  if (!form.contains(e.target as Node)) close();
});
form.addEventListener("submit", () => close());
