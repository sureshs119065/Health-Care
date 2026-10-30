import { BESTSELLER_TAG, BUNDLES, CATEGORY_IMAGES } from "../config";
import { artUri } from "../lib/art";
import { renderBundles } from "../lib/bundles";
import { renderDiwaliOffer } from "../lib/diwali";
import { initDiwaliFx } from "../lib/diwali-fx";
import { productCard } from "../lib/card";
import { arrowButton, initCarousel } from "../lib/carousel";
import { $, h } from "../lib/dom";
import { productImg } from "../lib/media";
import { reelCard } from "../lib/reels";
import { getProducts, loadMenu } from "../lib/store";
import type { Product } from "../lib/types";
import { setVisible } from "../lib/ui";

function renderCategories(): void {
  const groups = new Map<string, Product[]>();
  for (const p of getProducts()) groups.set(p.category, [...(groups.get(p.category) ?? []), p]);
  const top = [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])).slice(0, 6);
  $("#cat-tiles").replaceChildren(
    ...top.map(([name, items]) => {
      const photo = CATEGORY_IMAGES[name] || items.find((p) => p.image)?.image;
      return h("li", {},
        h("a", {
          href: `/shop?category=${encodeURIComponent(name)}`,
          class: "card group block overflow-hidden transition hover:-translate-y-0.5 hover:border-leaf hover:shadow-[var(--shadow-lift)]",
        },
          h("img", { src: photo || artUri(name, "cat"), alt: "", width: "240", height: "240", loading: "lazy", class: "aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.04]" }),
          h("span", { class: "block p-3" },
            h("span", { class: "block font-display text-lg font-bold leading-tight" }, name),
            h("span", { class: "text-sm text-muted" }, items.length === 1 ? "1 item" : `${items.length} items`))));
    }),
  );
}

function bestsellers(): Product[] {
  const inStock = getProducts().filter((p) => p.inStock);
  const tagged = inStock.filter((p) => p.tags.some((t) => t.toLowerCase() === BESTSELLER_TAG.toLowerCase()));
  return (tagged.length ? tagged : inStock).slice(0, 10);
}

function renderBest(): Product[] {
  const picks = bestsellers();
  const track = $("#best-track");
  track.replaceChildren(...picks.map((p) => {
    const li = productCard(p);
    li.classList.add("w-[46vw]", "max-w-[260px]", "shrink-0", "md:w-60");
    return li;
  }));
  const holder = $("#best-arrows");
  const prev = arrowButton("prev", "Previous products");
  const next = arrowButton("next", "Next products");
  holder.replaceChildren(prev, next);
  initCarousel(track, prev, next);
  return picks;
}

function renderReels(): void {
  const all = getProducts();
  const withVideo = all.filter((p) => p.videoId).slice(0, 8);
  const list = withVideo.length ? withVideo : all.filter((p) => p.inStock).slice(0, 6);
  if (withVideo.length === 0) {
    $("#reel-sub").textContent = "Product videos are on the way. Until then, tap any card to see the product.";
  }
  const track = $("#reel-track");
  track.replaceChildren(...list.map((p) => reelCard(p, true)));
  const holder = $("#reel-arrows");
  const prev = arrowButton("prev", "Previous videos");
  const next = arrowButton("next", "Next videos");
  holder.replaceChildren(prev, next);
  initCarousel(track, prev, next);
}

function renderUse(exclude: Set<string>): void {
  const withUse = getProducts().filter((p) => p.howToUse);
  const fresh = withUse.filter((p) => !exclude.has(p.id));
  const picks = [...fresh, ...withUse.filter((p) => exclude.has(p.id))].slice(0, 4);
  $("#use-grid").replaceChildren(
    ...picks.map((p) =>
      h("li", { class: "card flex flex-col overflow-hidden" },
        h("a", { href: `/product?id=${encodeURIComponent(p.id)}`, tabindex: "-1", "aria-hidden": "true" },
          productImg(p, "aspect-[16/10] w-full bg-cream-dark object-cover", 400)),
        h("div", { class: "flex flex-1 flex-col gap-2 p-4" },
          h("h3", { class: "text-lg font-bold" }, p.name),
          h("p", { class: "text-muted" }, p.howToUse),
          h("a", { href: `/product?id=${encodeURIComponent(p.id)}`, class: "link-more mt-auto" }, p.videoId ? "Watch and view product" : "View product")))),
  );
}

async function init(force = false): Promise<void> {
  setVisible($("#home-error"), false);
  try {
    await loadMenu(force);
    renderCategories();
    const dw = document.getElementById("diwali-offer");
    if (dw && !renderDiwaliOffer(dw)) document.getElementById("diwali")?.remove();
    const picks = renderBest();
    renderReels();
    renderUse(new Set(picks.map((p) => p.id)));
    const sets = document.getElementById("bundle-list");
    if (sets && BUNDLES.length) {
      const n = renderBundles(sets);
      if (n === 0) sets.closest("section")?.remove();
    }
  } catch (err) {
    console.error(err);
    for (const id of ["cat-tiles", "best-track", "reel-track", "use-grid", "bundle-list"]) document.getElementById(id)?.replaceChildren();
    setVisible($("#home-error"), true);
  }
}

$("#retry").addEventListener("click", () => void init(true));
initDiwaliFx();
void init();
