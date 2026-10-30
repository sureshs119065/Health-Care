// Header behaviour: announcement bar, mobile menu, categories mega menu, and search with suggestions.
import { $, h } from "../lib/dom";
import { artUri } from "../lib/art";
import { getProducts, loadMenu } from "../lib/store";
import { formatMoney } from "../lib/whatsapp";
import { announce } from "../lib/dom";
import { BESTSELLER_TAG } from "../config";

/* ---------- Announcement bar ---------- */
const announceBar = document.getElementById("announce");
if (announceBar) {
  if (sessionStorage.getItem("announce:closed") === "1") announceBar.remove();
  else {
    document.getElementById("announce-close")?.addEventListener("click", () => {
      announceBar.remove();
      try { sessionStorage.setItem("announce:closed", "1"); } catch { /* ignore */ }
    });
    const marquee = document.getElementById("announce-marquee");
    const pause = document.getElementById("announce-pause");
    pause?.addEventListener("click", () => {
      const paused = marquee?.dataset.paused !== "true";
      if (marquee) marquee.dataset.paused = String(paused);
      pause.setAttribute("aria-pressed", String(paused));
      pause.setAttribute("aria-label", paused ? "Resume scrolling offers" : "Pause scrolling offers");
    });
  }
}

/* ---------- Categories (mega menu + mobile chips), filled once the menu has loaded ---------- */
function categories(): [string, number][] {
  const counts = new Map<string, number>();
  for (const p of getProducts()) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function picks() {
  const inStock = getProducts().filter((p) => p.inStock);
  const tagged = inStock.filter((p) => p.tags.some((t) => t.toLowerCase() === BESTSELLER_TAG.toLowerCase()));
  return (tagged.length ? tagged : inStock).slice(0, 4);
}

function fillMenus(): void {
  const cats = categories();
  if (cats.length === 0) return;
  $("#mega-cats").replaceChildren(
    ...cats.map(([c, n]) =>
      h("li", {}, h("a", {
        href: `/shop?category=${encodeURIComponent(c)}`,
        class: "flex min-h-11 items-center justify-between rounded-xl px-3 font-semibold hover:bg-tint hover:text-leaf",
      }, c, h("span", { class: "text-sm font-normal text-muted" }, String(n))))),
  );
  $("#mega-picks").replaceChildren(
    ...picks().map((p) =>
      h("li", {}, h("a", { href: `/product?id=${encodeURIComponent(p.id)}`, class: "flex items-center gap-3 rounded-xl p-2 hover:bg-tint" },
        h("img", { src: p.image || artUri(p.category, p.id), alt: "", width: "64", height: "64", loading: "lazy", class: "h-16 w-16 shrink-0 rounded-lg object-cover" }),
        h("span", {}, h("span", { class: "block font-semibold leading-snug" }, p.name),
          h("span", { class: "text-sm text-muted" }, `${formatMoney(p.price)}${p.weight ? ` · ${p.weight}` : ""}`))))),
  );
  document.getElementById("mobile-cats")?.replaceChildren(
    ...cats.map(([c]) => h("a", { href: `/shop?category=${encodeURIComponent(c)}`, class: "chip" }, c)),
  );
}
let menusLoaded = false;
function ensureMenus(): void {
  if (menusLoaded) return;
  menusLoaded = true;
  loadMenu().then(fillMenus).catch(() => { menusLoaded = false; });
}

/* ---------- Mobile menu ---------- */
const menuBtn = document.getElementById("menu-btn");
const mobileNav = document.getElementById("mobile-nav");

function setMenu(open: boolean): void {
  if (!menuBtn || !mobileNav) return;
  mobileNav.hidden = !open;
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  if (open) ensureMenus();
}
menuBtn?.addEventListener("click", () => setMenu(mobileNav?.hidden ?? false));
mobileNav?.addEventListener("click", (e) => {
  if ((e.target as HTMLElement).closest("a")) setMenu(false);
});

/* ---------- Mega menu (desktop) ---------- */
const megaBtn = document.getElementById("mega-btn");
const mega = document.getElementById("mega");
function setMega(open: boolean): void {
  if (!megaBtn || !mega) return;
  mega.hidden = !open;
  megaBtn.setAttribute("aria-expanded", String(open));
  if (open) ensureMenus();
}
megaBtn?.addEventListener("click", () => setMega(mega?.hidden ?? false));
megaBtn?.addEventListener("mouseenter", () => { if (window.matchMedia("(hover: hover)").matches) setMega(true); });
document.querySelector("header")?.addEventListener("mouseleave", () => { if (window.matchMedia("(hover: hover)").matches) setMega(false); });
document.addEventListener("click", (e) => {
  if (mega && !mega.hidden && !(e.target as HTMLElement).closest("#mega, #mega-btn")) setMega(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (mega && !mega.hidden) { setMega(false); megaBtn?.focus(); }
  else if (mobileNav && !mobileNav.hidden) { setMenu(false); menuBtn?.focus(); }
});

/* ---------- Search with suggestions ---------- */
interface Option {
  label: string;
  hint: string;
  href: string;
  img?: string;
  group?: string;
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
  list.querySelectorAll("[role=option]").forEach((li, n) => {
    li.setAttribute("aria-selected", String(n === i));
    if (n === i) (li as HTMLElement).scrollIntoView({ block: "nearest" });
  });
  if (i >= 0) input.setAttribute("aria-activedescendant", `so-${i}`);
  else input.removeAttribute("aria-activedescendant");
}

function build(q: string): { options: Option[]; empty: boolean } {
  const products = getProducts();
  const needle = q.toLowerCase();
  const hay = (p: (typeof products)[number]) => [p.name, p.category, p.shortDescription, p.tags.join(" ")].join(" ").toLowerCase();
  const words = needle.split(/\s+/);
  const byName = products
    .filter((p) => words.every((w) => hay(p).includes(w)))
    .sort((a, b) => Number(b.name.toLowerCase().startsWith(needle)) - Number(a.name.toLowerCase().startsWith(needle)))
    .slice(0, 5)
    .map((p): Option => ({
      label: p.name,
      hint: `${formatMoney(p.price)}${p.weight ? ` · ${p.weight}` : ""}${p.inStock ? "" : " · Sold out"}`,
      href: `/product?id=${encodeURIComponent(p.id)}`,
      img: p.image || artUri(p.category, p.id),
      group: "Products",
    }));
  const cats = Array.from(new Set(products.map((p) => p.category)))
    .filter((c) => c.toLowerCase().includes(needle))
    .slice(0, 2)
    .map((c): Option => ({ label: c, hint: "Category", href: `/shop?category=${encodeURIComponent(c)}`, group: "Categories" }));
  const empty = byName.length === 0 && cats.length === 0;
  const out = [...byName, ...cats];
  if (!empty) out.push({ label: `See all results for “${q}”`, hint: "Shop", href: `/shop?q=${encodeURIComponent(q)}` });
  return { options: out, empty };
}

function row(o: Option, i: number): HTMLElement {
  return h("li", {
    id: `so-${i}`,
    role: "option",
    "aria-selected": "false",
    class: "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-tint aria-selected:bg-tint",
    onmousedown: (e: Event) => {
      e.preventDefault();
      window.location.href = o.href;
    },
  },
  o.img ? h("img", { src: o.img, alt: "", width: "44", height: "44", loading: "lazy", class: "h-11 w-11 shrink-0 rounded-lg object-cover" }) : h("span"),
  h("span", { class: "min-w-0 flex-1" },
    h("span", { class: "block truncate font-semibold" }, o.label),
    h("span", { class: "block text-sm text-muted" }, o.hint)));
}

function render(): void {
  const q = input.value.trim();
  if (q.length < 2) {
    // Nothing typed yet: offer categories to browse.
    const cats = categories();
    if (cats.length === 0 || document.activeElement !== input) return close();
    options = cats.map(([c, n]) => ({ label: c, hint: `${n} ${n === 1 ? "item" : "items"}`, href: `/shop?category=${encodeURIComponent(c)}` }));
    list.replaceChildren(h("li", { role: "presentation", class: "px-3 pb-1 pt-2 text-sm font-semibold text-muted" }, "Browse by category"), ...options.map(row));
  } else {
    const res = build(q);
    options = res.options;
    if (res.empty) {
      const cats = categories().map(([c]) => c);
      options = cats.map((c) => ({ label: c, hint: "Category", href: `/shop?category=${encodeURIComponent(c)}` }));
      list.replaceChildren(
        h("li", { role: "presentation", class: "px-3 py-3" },
          h("p", { class: "font-semibold" }, `No products match “${q}”.`),
          h("p", { class: "text-sm text-muted" }, "Check the spelling or try a category:")),
        ...options.map(row));
      announce(`No products match ${q}.`);
    } else {
      list.replaceChildren(...options.map(row));
      announce(`${options.length - 1} suggestions available.`);
    }
  }
  list.hidden = false;
  input.setAttribute("aria-expanded", "true");
  active = -1;
}

function ensureMenu(): void {
  if (getProducts().length === 0) loadMenu().then(render).catch(() => {});
}

input.addEventListener("focus", () => {
  ensureMenu();
  render();
});
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
