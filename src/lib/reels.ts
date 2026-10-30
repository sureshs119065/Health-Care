import * as cart from "./cart";
import { h } from "./dom";
import { iconEl } from "./icons";
import { productImg } from "./media";
import type { Product } from "./types";
import { toast } from "./ui";
import { formatMoney } from "./whatsapp";

const live = new Set<() => void>();
let observer: IntersectionObserver | null = null;

/** Vertical 9:16 video card. Nothing loads from YouTube until the visitor taps play; it stops when scrolled away. */
export function reelCard(p: Product, onDark = false): HTMLElement {
  const href = `/product?id=${encodeURIComponent(p.id)}`;
  const hasVideo = !!p.videoId;
  const stage = h("div", { class: "reel relative w-full overflow-hidden rounded-[1.25rem] bg-leaf-dark" });

  const poster = (): void => {
    const img = productImg(p, "absolute inset-0 h-full w-full object-cover", 360);
    const shade = h("div", { class: "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" });
    const title = h("p", { class: "pointer-events-none absolute inset-x-3 bottom-3 text-left text-white" },
      h("span", { class: "block font-display text-lg font-bold leading-tight" }, p.name),
      h("span", { class: "mt-0.5 block text-sm text-white/85" }, [formatMoney(p.price), p.weight].filter(Boolean).join(" · ")));
    if (hasVideo) {
      const play = h("button", {
        type: "button",
        class: "absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center",
        "aria-label": `Play video: ${p.name}`,
        onclick: () => start(),
      });
      const disc = h("span", { class: "flex h-16 w-16 items-center justify-center rounded-full bg-white/95 pl-1 text-leaf-dark shadow-lg transition group-hover:scale-105" });
      disc.append(iconEl("play", 30));
      play.append(disc);
      stage.replaceChildren(img, shade, play, title);
    } else {
      stage.replaceChildren(
        img, shade,
        h("span", { class: "badge absolute left-3 top-3 bg-white/95 text-leaf-dark" }, "Video coming soon"),
        title);
    }
  };

  function stop(): void {
    live.delete(stop);
    poster();
  }

  function start(): void {
    live.forEach((fn) => fn());
    live.clear();
    const frame = h("iframe", {
      src: `https://www.youtube-nocookie.com/embed/${p.videoId}?autoplay=1&rel=0&playsinline=1`,
      title: `Video: ${p.name}`,
      class: "absolute inset-0 h-full w-full",
      allow: "autoplay; encrypted-media; picture-in-picture",
      allowfullscreen: true,
      referrerpolicy: "strict-origin-when-cross-origin",
    });
    stage.replaceChildren(frame);
    frame.focus();
    live.add(stop);
  }

  poster();
  (observer ??= new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting && e.target.querySelector("iframe")) {
        (e.target as HTMLElement & { __stop?: () => void }).__stop?.();
      }
    }
  }, { threshold: 0.2 })).observe(stage);
  (stage as HTMLElement & { __stop?: () => void }).__stop = stop;

  return h("li", { class: "group w-[62vw] max-w-[260px] shrink-0 sm:w-56 lg:w-60" },
    stage,
    h("div", { class: "mt-2 flex items-center justify-between gap-2" },
      h("a", { href, class: onDark ? "inline-flex min-h-11 items-center font-semibold text-white underline underline-offset-4 hover:text-accent" : "link-more" }, hasVideo ? "View product" : "See product"),
      p.inStock
        ? h("button", {
            type: "button",
            class: "btn btn-accent min-h-11 px-3 py-1 text-sm",
            "aria-label": `Add ${p.name} to cart`,
            onclick: () => {
              cart.add(p.id);
              toast(`${p.name} added to cart.`);
            },
          }, "Shop now")
        : h("span", { class: "text-sm font-semibold" }, "Sold out")));
}
