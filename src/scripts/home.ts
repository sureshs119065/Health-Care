import { $, h } from "../lib/dom";
import { productCard } from "../lib/card";
import { getProducts, loadMenu } from "../lib/store";
import { setVisible } from "../lib/ui";
import { videoPlayer } from "../lib/video";
import * as cart from "../lib/cart";
import { toast } from "../lib/ui";

function renderCategories(): void {
  const counts = new Map<string, number>();
  for (const p of getProducts()) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 6);
  $("#cat-tiles").replaceChildren(
    ...top.map(([name, n]) =>
      h("li", {},
        h("a", {
          href: `/shop?category=${encodeURIComponent(name)}`,
          class: "card flex min-h-24 flex-col justify-center p-4 transition-shadow hover:shadow-md",
        },
          h("span", { class: "font-serif text-lg font-bold text-leaf" }, name),
          h("span", { class: "text-sm" }, n === 1 ? "1 item" : `${n} items`))),
    ),
  );
}

function renderFeatured(): void {
  const inStock = getProducts().filter((p) => p.inStock);
  const tagged = inStock.filter((p) => p.tags.some((t) => t.toLowerCase() === "featured"));
  const picks = (tagged.length ? tagged : inStock).slice(0, 8);
  $("#featured-grid").replaceChildren(...picks.map(productCard));
}

function renderVideos(): void {
  const withVideo = getProducts().filter((p) => p.videoId).slice(0, 3);
  $("#video-grid").replaceChildren(
    ...withVideo.map((p) =>
      h("article", { class: "card overflow-hidden" },
        videoPlayer(p),
        h("div", { class: "space-y-2 p-4" },
          h("h3", { class: "font-bold" }, p.name),
          p.howToUse ? h("p", { class: "text-sm" }, p.howToUse) : h("span"),
          h("div", { class: "flex flex-wrap gap-2" },
            h("a", { href: `/product?id=${encodeURIComponent(p.id)}`, class: "btn btn-outline" }, "View product"),
            p.inStock
              ? h("button", {
                  type: "button",
                  class: "btn btn-primary",
                  onclick: () => {
                    cart.add(p.id);
                    toast(`${p.name} added to cart.`);
                  },
                }, "Add to cart")
              : h("span")))),
    ),
  );
  setVisible($("#video-empty"), withVideo.length === 0);
  setVisible($("#video-grid"), withVideo.length > 0, "grid");
}

async function init(force = false): Promise<void> {
  setVisible($("#home-skeleton"), true);
  setVisible($("#home-error"), false);
  setVisible($("#home-content"), false);
  try {
    await loadMenu(force);
    renderCategories();
    renderFeatured();
    renderVideos();
    setVisible($("#home-skeleton"), false);
    setVisible($("#home-content"), true);
  } catch (err) {
    console.error(err);
    setVisible($("#home-skeleton"), false);
    setVisible($("#home-error"), true);
  }
}

$("#retry").addEventListener("click", () => void init(true));
void init();
