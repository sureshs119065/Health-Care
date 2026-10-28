type Prop = string | number | boolean | undefined | ((e: Event) => void);

export function $<T extends HTMLElement = HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

/** Builds elements with createElement and text nodes only, so sheet text can never become HTML. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, Prop> = {},
  ...kids: (Node | string | null)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === false) continue;
    if (typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "class") el.className = String(v);
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  for (const kid of kids) if (kid !== null) el.append(kid);
  return el;
}

/** Announces a message to screen readers through the aria-live region. */
export function announce(message: string): void {
  const live = document.getElementById("live");
  if (!live) return;
  live.textContent = "";
  window.setTimeout(() => (live.textContent = message), 50);
}
