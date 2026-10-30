// Original illustrated pack tiles. Shown wherever a product has no photo yet
// (the Google Sheet "image" column replaces them automatically) and in the home hero.
// Pure string functions: safe to use at build time (Astro) and in the browser.

export type ArtKind = "soup" | "breakfast" | "snack" | "sweet" | "flour" | "leaf";

export function artKind(category: string): ArtKind {
  const c = category.toLowerCase();
  if (/soup/.test(c)) return "soup";
  if (/break|muesli|oat|dosa|chilla/.test(c)) return "breakfast";
  if (/snack|makhana|seed|chana|cookie/.test(c)) return "snack";
  if (/sweet|laddu|dessert/.test(c)) return "sweet";
  if (/flour|atta|millet|grain/.test(c)) return "flour";
  return "leaf";
}

const PALETTE: Record<ArtKind, { bg: [string, string]; ink: string; a: string; b: string }> = {
  soup: { bg: ["#FFE9D6", "#FFD2B0"], ink: "#7A2E12", a: "#E4572E", b: "#F7B267" },
  breakfast: { bg: ["#FFF3C9", "#FFE08A"], ink: "#6B4A00", a: "#E9A21A", b: "#F6D365" },
  snack: { bg: ["#E3F3D6", "#C4E4A8"], ink: "#1E4D2B", a: "#4C9A2A", b: "#A5D26B" },
  sweet: { bg: ["#FCE1E8", "#F8BFD0"], ink: "#7A1F3D", a: "#C2255C", b: "#F28CAB" },
  flour: { bg: ["#EFE6D2", "#DCCBA5"], ink: "#4D3A16", a: "#B08A3E", b: "#E6D3A3" },
  leaf: { bg: ["#DDF0E4", "#B9DEC6"], ink: "#0F3D27", a: "#1B5E3B", b: "#7CC49A" },
};

function glyph(kind: ArtKind, p: (typeof PALETTE)[ArtKind]): string {
  switch (kind) {
    case "soup":
      return `<g><path d="M110 150h180a90 90 0 0 1-180 0z" fill="${p.a}"/><path d="M120 150h160" stroke="${p.ink}" stroke-width="8" stroke-linecap="round"/><ellipse cx="200" cy="150" rx="86" ry="14" fill="${p.b}"/><g fill="none" stroke="${p.ink}" stroke-width="7" stroke-linecap="round" opacity=".55"><path d="M165 118c-12-14 12-22 0-38"/><path d="M200 112c-12-14 12-22 0-38"/><path d="M235 118c-12-14 12-22 0-38"/></g><rect x="150" y="250" width="100" height="12" rx="6" fill="${p.ink}" opacity=".25"/></g>`;
    case "breakfast":
      return `<g><circle cx="200" cy="120" r="46" fill="${p.b}"/><g stroke="${p.a}" stroke-width="8" stroke-linecap="round"><path d="M200 52v16M144 76l11 11M256 76l-11 11M126 120h16M274 120h-16"/></g><path d="M100 170h200a100 100 0 0 1-200 0z" fill="${p.a}"/><g fill="${p.b}"><circle cx="150" cy="170" r="9"/><circle cx="185" cy="164" r="9"/><circle cx="222" cy="168" r="9"/><circle cx="256" cy="164" r="9"/></g><path d="M268 150l46-60" stroke="${p.ink}" stroke-width="8" stroke-linecap="round"/></g>`;
    case "snack":
      return `<g><circle cx="150" cy="190" r="52" fill="${p.a}"/><circle cx="238" cy="170" r="46" fill="${p.b}"/><circle cx="200" cy="108" r="38" fill="${p.a}" opacity=".85"/><g fill="${p.ink}" opacity=".5"><circle cx="135" cy="180" r="5"/><circle cx="160" cy="205" r="5"/><circle cx="165" cy="172" r="5"/><circle cx="228" cy="160" r="5"/><circle cx="250" cy="182" r="5"/><circle cx="192" cy="100" r="5"/><circle cx="212" cy="120" r="5"/></g></g>`;
    case "sweet":
      return `<g><circle cx="140" cy="200" r="46" fill="${p.a}"/><circle cx="240" cy="200" r="46" fill="${p.b}"/><circle cx="190" cy="132" r="46" fill="${p.a}" opacity=".9"/><g fill="#FFF3F6" opacity=".85"><circle cx="124" cy="190" r="4"/><circle cx="150" cy="212" r="4"/><circle cx="226" cy="190" r="4"/><circle cx="252" cy="212" r="4"/><circle cx="176" cy="120" r="4"/><circle cx="202" cy="146" r="4"/></g></g>`;
    case "flour":
      return `<g><path d="M120 110h160l18 150a14 14 0 0 1-14 16H116a14 14 0 0 1-14-16z" fill="${p.b}"/><path d="M120 110c10-22 150-22 160 0z" fill="${p.a}"/><path d="M200 150v100" stroke="${p.ink}" stroke-width="6" stroke-linecap="round"/><g fill="${p.a}"><ellipse cx="180" cy="170" rx="9" ry="16" transform="rotate(-30 180 170)"/><ellipse cx="220" cy="170" rx="9" ry="16" transform="rotate(30 220 170)"/><ellipse cx="182" cy="206" rx="9" ry="16" transform="rotate(-30 182 206)"/><ellipse cx="218" cy="206" rx="9" ry="16" transform="rotate(30 218 206)"/></g></g>`;
    default:
      return `<g><path d="M120 280c0-90 60-150 160-160 0 100-60 160-150 160z" fill="${p.a}"/><path d="M120 280c24-50 60-90 110-120" stroke="${p.b}" stroke-width="8" fill="none" stroke-linecap="round"/></g>`;
  }
}

/** Square illustrated tile as SVG markup. */
export function artSvg(category: string, variant = 0): string {
  const kind = artKind(category);
  const p = PALETTE[kind];
  const id = `g${kind}${variant % 2}`;
  const [c1, c2] = variant % 2 ? [p.bg[1], p.bg[0]] : p.bg;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="400" height="400" fill="url(#${id})"/>${glyph(kind, p)}</svg>`;
}

/** Same tile as a data: URI for <img src>. */
export function artUri(category: string, seed = ""): string {
  let n = 0;
  for (const ch of seed) n = (n + ch.charCodeAt(0)) % 7;
  return `data:image/svg+xml,${encodeURIComponent(artSvg(category, n))}`;
}
