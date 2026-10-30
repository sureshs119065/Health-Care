import { iconEl } from "./icons";
import { h } from "./dom";

/** Wires a horizontally scrolling track to previous/next buttons (arrows stay in sync with scroll position). */
export function initCarousel(track: HTMLElement, prev: HTMLButtonElement, next: HTMLButtonElement): void {
  const step = (dir: 1 | -1) => {
    const first = track.firstElementChild as HTMLElement | null;
    const w = (first?.getBoundingClientRect().width ?? 240) + 12;
    const n = Math.max(1, Math.floor(track.clientWidth / w) - 0);
    track.scrollBy({ left: dir * w * n, behavior: "smooth" });
  };
  const sync = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
    const scrollable = max > 0;
    prev.hidden = next.hidden = !scrollable;
  };
  prev.addEventListener("click", () => step(-1));
  next.addEventListener("click", () => step(1));
  track.addEventListener("scroll", () => window.requestAnimationFrame(sync), { passive: true });
  window.addEventListener("resize", sync);
  new ResizeObserver(sync).observe(track);
  sync();
}

/** Round arrow button used by carousels. */
export function arrowButton(dir: "prev" | "next", label: string): HTMLButtonElement {
  const b = h("button", {
    type: "button",
    class: "hidden h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-leaf shadow-[var(--shadow-card)] transition hover:bg-tint active:scale-95 disabled:opacity-35 md:inline-flex",
    "aria-label": label,
  });
  b.append(iconEl(dir === "prev" ? "chevronLeft" : "chevronRight", 22));
  return b;
}
