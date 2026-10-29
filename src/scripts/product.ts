import { FSSAI_NUMBER, MAX_QTY, SITE_URL, STORE_NAME, WHATSAPP_NUMBER } from "../config";
import * as cart from "../lib/cart";
import * as compare from "../lib/compare";
import { formatUnitPrice } from "../lib/pricing";
import { videoPlayer } from "../lib/video";
import { $, h } from "../lib/dom";
import { getProduct, loadMenu } from "../lib/store";
import type { Product } from "../lib/types";
import { PLACEHOLDER, setVisible, toast } from "../lib/ui";
import { formatMoney } from "../lib/whatsapp";

const id = new URLSearchParams(window.location.search).get("id") ?? "";

function setTag(selector: string, attr: string, value: string): void {
  document.querySelector(selector)?.setAttribute(attr, value);
}

/** Per-product title, description, share preview, canonical link and Product structured data. */
function setMeta(p: Product): void {
  const title = `${p.name} | ${STORE_NAME}`;
  const desc = p.shortDescription || `${p.name} from ${STORE_NAME}.`;
  const url = `${SITE_URL}/product?id=${encodeURIComponent(p.id)}`;
  const image = p.image ? new URL(p.image, SITE_URL).href : `${SITE_URL}/og-image.png`;

  document.title = title;
  setTag('meta[name="description"]', "content", desc);
  setTag('meta[name="robots"]', "content", "index,follow");
  setTag('link[rel="canonical"]', "href", url);
  setTag('meta[property="og:title"]', "content", title);
  setTag('meta[property="og:description"]', "content", desc);
  setTag('meta[property="og:url"]', "content", url);
  setTag('meta[property="og:image"]', "content", image);
  setTag('meta[name="twitter:title"]', "content", title);
  setTag('meta[name="twitter:description"]', "content", desc);
  setTag('meta[name="twitter:image"]', "content", image);

  let ld = document.getElementById("ld-product");
  if (!ld) {
    ld = document.createElement("script");
    ld.id = "ld-product";
    ld.setAttribute("type", "application/ld+json");
    document.head.append(ld);
  }
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: desc,
    image: [image],
    sku: p.id,
    category: p.category,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: p.price,
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  });
}

const withUnit = (v: string, unit: string): string => (/[a-z]/i.test(v) ? v : `${v} ${unit}`);

function tableRow(label: string, value: string): HTMLElement {
  return h("tr", { class: "border-b border-line last:border-0" },
    h("th", { scope: "row", class: "py-2 pr-4 text-left font-semibold" }, label),
    h("td", { class: "py-2 text-right" }, value));
}

function nutritionTable(p: Product): HTMLElement | null {
  const rows: [string, string, string][] = [
    ["Energy", p.calories, "kcal"],
    ["Protein", p.protein, "g"],
    ["Carbohydrates", p.carbs, "g"],
    ["Fibre", p.fibre, "g"],
    ["Fat", p.fat, "g"],
  ];
  const filled = rows.filter(([, v]) => v !== "");
  if (filled.length === 0) return null;
  return h("table", { class: "w-full max-w-md rounded-lg border border-line bg-white px-3" },
    h("caption", { class: "pb-2 text-left font-semibold" }, "Nutrition (per 100 g)"),
    h("tbody", {}, ...filled.map(([l, v, u]) => tableRow(l, withUnit(v, u)))));
}

function videoBlock(p: Product): HTMLElement | null {
  if (!p.videoId) return null;
  return h("section", { class: "mt-8", "aria-labelledby": "video-title" },
    h("h2", { id: "video-title", class: "mb-3 text-xl font-bold" }, "Recipe video"),
    h("div", { class: "max-w-2xl" }, videoPlayer(p)));
}

function compareButton(p: Product): HTMLElement {
  const btn = h("button", { type: "button", class: "btn btn-outline", onclick: () => {
    if (compare.toggle(p.id) === "full") toast(`You can compare up to ${compare.MAX_COMPARE} items. Remove one first.`);
  } });
  const sync = () => {
    btn.textContent = compare.has(p.id) ? "Remove from compare" : "Add to compare";
  };
  compare.subscribe(sync);
  sync();
  return btn;
}

function quantityAndAdd(p: Product): HTMLElement {
  if (!p.inStock) {
    const ask = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello, when will ${p.name} be back in stock?`)}`;
    return h("div", { class: "space-y-3" },
      h("p", { class: "font-semibold" }, "This item is sold out right now."),
      h("a", { href: ask, target: "_blank", rel: "noopener", class: "btn btn-outline" }, "Ask when it is back"));
  }

  let qty = 1;
  const out = h("output", { class: "min-w-10 text-center text-xl font-bold", "aria-label": "Quantity" }, "1");
  const dec = h("button", { type: "button", class: "btn btn-outline px-0", "aria-label": "Decrease quantity", onclick: () => set(qty - 1) }, "−");
  const inc = h("button", { type: "button", class: "btn btn-outline px-0", "aria-label": "Increase quantity", onclick: () => set(qty + 1) }, "+");
  function set(n: number): void {
    qty = Math.min(MAX_QTY, Math.max(1, n));
    out.textContent = String(qty);
    dec.disabled = qty <= 1;
    inc.disabled = qty >= MAX_QTY;
  }
  set(1);

  return h("div", { class: "space-y-3" },
    h("div", { class: "flex items-center gap-3" }, h("span", { class: "font-semibold" }, "Quantity"), dec, out, inc),
    h("button", {
      type: "button",
      class: "btn btn-primary w-full md:w-auto md:min-w-56",
      onclick: () => {
        cart.add(p.id, qty);
        toast(`${qty} x ${p.name} added to cart.`);
      },
    }, "Add to cart"),
    h("p", {}, h("a", { href: "/cart", class: "font-semibold text-leaf underline underline-offset-2" }, "View cart")));
}

function render(p: Product): void {
  setMeta(p);
  const img = h("img", {
    src: p.image || PLACEHOLDER,
    alt: p.name,
    width: "800",
    height: "800",
    fetchpriority: "high",
    class: "aspect-square w-full rounded-xl bg-cream-dark object-cover",
  });
  img.addEventListener("error", () => {
    if (!img.src.endsWith(PLACEHOLDER)) img.src = PLACEHOLDER;
  });

  const details: [string, string][] = [
    ["Category", p.category],
    ["Weight", p.weight],
    ["FSSAI Lic. No.", p.fssai || FSSAI_NUMBER],
  ];
  const nutrition = nutritionTable(p);
  const video = videoBlock(p);

  const info = h("div", { class: "space-y-4" },
    h("p", { class: "font-semibold text-leaf" }, p.category),
    h("h1", { class: "text-3xl font-bold" }, p.name),
    h("p", { class: "text-2xl font-bold text-leaf" }, formatMoney(p.price), p.weight ? ` / ${p.weight}` : ""),
    formatUnitPrice(p) ? h("p", { class: "text-sm" }, `Price per 100 g or ml: ${formatUnitPrice(p)}`) : h("span"),
    h("p", {
      class: p.inStock
        ? "inline-block rounded-md border-2 border-leaf px-3 py-1 font-semibold text-leaf"
        : "inline-block rounded-md bg-ink px-3 py-1 font-semibold text-white",
    }, p.inStock ? "In stock" : "Sold out"),
    p.shortDescription ? h("p", { class: "max-w-prose text-lg" }, p.shortDescription) : h("span"),
    quantityAndAdd(p),
    compareButton(p),
    h("p", { class: "text-sm" }, "The total is confirmed by the owner on WhatsApp before you pay."));

  const article = $("#product");
  article.replaceChildren(
    h("div", { class: "grid gap-6 md:grid-cols-2 md:gap-10" }, img, info),
    h("div", { class: "mt-8 grid gap-8 md:grid-cols-2" },
      h("section", { "aria-labelledby": "ing-title" },
        h("h2", { id: "ing-title", class: "mb-2 text-xl font-bold" }, "Ingredients"),
        h("p", { class: "max-w-prose" }, p.ingredients || "Ask us on WhatsApp for the full ingredient list.")),
      nutrition
        ? h("section", { "aria-labelledby": "nut-title" },
            h("h2", { id: "nut-title", class: "mb-2 text-xl font-bold" }, "Nutrition"), nutrition,
            h("p", { class: "mt-2 max-w-md text-sm" }, "Values are per 100 g, as supplied by the seller. Your portion may be smaller or larger."))
        : h("span")),
    ...(p.howToUse
      ? [h("section", { class: "mt-8", "aria-labelledby": "use-title" },
          h("h2", { id: "use-title", class: "mb-2 text-xl font-bold" }, "How to use"),
          h("p", { class: "max-w-prose" }, p.howToUse))]
      : []),
    h("dl", { class: "mt-8 grid max-w-md grid-cols-[auto_1fr] gap-x-4 gap-y-1" },
      ...details.flatMap(([k, v]) => (v ? [h("dt", { class: "font-semibold" }, k), h("dd", {}, v)] : []))),
    ...(video ? [video] : []),
    h("p", { class: "mt-8 max-w-prose text-sm" }, "Not a substitute for medical advice. Consult your doctor or dietitian."));
}

async function init(force = false): Promise<void> {
  setVisible($("#skeleton"), true, "grid");
  for (const sel of ["#error", "#notfound", "#product"]) setVisible($(sel), false);
  try {
    await loadMenu(force);
    setVisible($("#skeleton"), false, "grid");
    const p = id ? getProduct(id) : undefined;
    if (!p) {
      document.title = `Item not found | ${STORE_NAME}`;
      setTag('meta[name="robots"]', "content", "noindex,follow");
      setVisible($("#notfound"), true);
      return;
    }
    render(p);
    setVisible($("#product"), true);
  } catch (err) {
    console.error(err);
    setVisible($("#skeleton"), false, "grid");
    setVisible($("#error"), true);
  }
}

$("#retry").addEventListener("click", () => void init(true));
void init();
