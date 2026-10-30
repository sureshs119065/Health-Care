import { h } from "./dom";
import type { Product } from "./types";

/** Click-to-load YouTube player. Nothing is requested from YouTube until the visitor taps play. */
export function videoPlayer(p: Product): HTMLElement {
  const box = h("div", { class: "relative aspect-video overflow-hidden rounded-xl bg-leaf-dark" });
  const play = h("button", {
    type: "button",
    class: "absolute inset-0 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-lg font-semibold text-white",
    "aria-label": `Play video: ${p.name}`,
    onclick: () => {
      const frame = h("iframe", {
        src: `https://www.youtube-nocookie.com/embed/${p.videoId}?autoplay=1&rel=0`,
        title: `Video: ${p.name}`,
        class: "absolute inset-0 h-full w-full",
        allow: "autoplay; encrypted-media; picture-in-picture",
        allowfullscreen: true,
        referrerpolicy: "strict-origin-when-cross-origin",
      });
      box.replaceChildren(frame);
      frame.focus();
    },
  },
    h("span", { class: "flex h-14 w-14 items-center justify-center rounded-full bg-surface text-2xl text-leaf-dark", "aria-hidden": "true" }, "▶"),
    "Play video",
    h("span", { class: "px-4 text-center text-sm font-normal" }, "Loads from YouTube only when you tap play."));
  box.append(play);
  return box;
}
