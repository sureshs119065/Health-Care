import { artUri } from "./art";
import { h } from "./dom";
import type { Product } from "./types";

/** Photo URL for a product, or the illustrated tile when no photo exists yet. */
export function imgSrc(p: Product, i = 0): string {
  return p.images?.[i] || artUri(p.category, p.id);
}

/** <img> that falls back to the illustrated tile if the photo fails to load. */
export function productImg(p: Product, cls: string, size = 400, i = 0, eager = false): HTMLImageElement {
  const img = h("img", {
    src: imgSrc(p, i),
    alt: p.images?.[i] ? p.name : `${p.name} (illustration, photo coming soon)`,
    width: String(size),
    height: String(size),
    loading: eager ? "eager" : "lazy",
    decoding: "async",
    class: cls,
  });
  img.addEventListener("error", () => {
    const fallback = artUri(p.category, p.id);
    if (img.src !== fallback) img.src = fallback;
  });
  return img;
}
