import { FSSAI_NUMBER, MAX_QTY, SITE_URL, STORE_NAME, WHATSAPP_NUMBER } from "../config";
import * as cart from "../lib/cart";
import * as compare from "../lib/compare";
import { formatUnitPrice, offerInfo } from "../lib/pricing";
import { videoPlayer } from "../lib/video";
import { $, h } from "../lib/dom";
import { getProduct, getProducts, loadMenu } from "../lib/store";
import type { Product } from "../lib/types";
import { setVisible, toast } from "../lib/ui";
import { productCard } from "../lib/card";
import { productImg } from "../lib/media";
import { formatMoney, productMessage, waUrl } from "../lib/whatsapp";

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
  return h("table", { class: "w-full max-w-md" },
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

function gallery(p: Product): HTMLElement {
  const count = Math.max(1, p.images.length);
  let cur = 0;
  const main = productImg(p, "aspect-square w-full rounded-[1.5rem] bg-cream-dark object-cover", 800, 0, true);
  main.setAttribute("fetchpriority", "high");
  const thumbs: HTMLButtonElement[] = [];
  const show = (i: number) => {
    cur = i;
    const t = productImg(p, "", 800, i, true);
    main.src = t.src;
    main.alt = t.alt;
    thumbs.forEach((b, n) => b.setAttribute("aria-current", String(n === i)));
  };
  const wrap = h("div", { class: "space-y-3" }, main);
  if (count > 1) {
    for (let i = 0; i < count; i++) {
      const b = h("button", {
        type: "button",
        class: "overflow-hidden rounded-xl border-2 border-line aria-[current=true]:border-leaf",
        "aria-label": `Show photo ${i + 1} of ${count}`,
        "aria-current": String(i === 0),
        onclick: () => show(i),
      }, productImg(p, "h-16 w-16 object-cover md:h-20 md:w-20", 160, i));
      thumbs.push(b);
    }
    wrap.append(h("div", { class: "flex flex-wrap gap-2" }, ...thumbs));
    void cur;
  }
  return wrap;
}

function quantityAndAdd(p: Product): HTMLElement {
  const wa = (text: string) => `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  if (!p.inStock) {
    return h("div", { class: "space-y-3" },
      h("p", { class: "font-semibold" }, "This item is sold out right now."),
      h("a", { href: wa(`Hello, when will ${p.name} be back in stock?`), target: "_blank", rel: "noopener", class: "btn btn-outline" }, "Ask when it is back"));
  }

  let qty = 1;
  const out = h("output", { class: "min-w-10 text-center text-xl font-bold", "aria-label": "Quantity" }, "1");
  const dec = h("button", { type: "button", class: "btn btn-outline px-0", "aria-label": "Decrease quantity", onclick: () => set(qty - 1) }, "−");
  const inc = h("button", { type: "button", class: "btn btn-outline px-0", "aria-label": "Increase quantity", onclick: () => set(qty + 1) }, "+");
  const total = h("span", {}, formatMoney(p.price));
  function set(n: number): void {
    qty = Math.min(MAX_QTY, Math.max(1, n));
    out.textContent = String(qty);
    total.textContent = formatMoney(p.price * qty);
    dec.disabled = qty <= 1;
    inc.disabled = qty >= MAX_QTY;
  }
  set(1);
  const order = h("a", { href: "#", target: "_blank", rel: "noopener", class: "btn btn-whatsapp btn-lg w-full sm:w-auto" }, "Order this on WhatsApp");
  order.addEventListener("click", () => order.setAttribute("href", waUrl(productMessage(p, qty))));
  order.addEventListener("focus", () => order.setAttribute("href", waUrl(productMessage(p, qty))));

  return h("div", { class: "space-y-4 rounded-2xl bg-cream-dark p-4" },
    h("div", { class: "flex flex-wrap items-center gap-3" },
      h("span", { class: "font-semibold" }, "Quantity"), dec, out, inc,
      h("span", { class: "ml-auto text-lg font-bold" }, "Total ", total)),
    h("div", { class: "flex flex-col gap-3 sm:flex-row" },
      h("button", {
        type: "button",
        class: "btn btn-accent btn-lg flex-1",
        onclick: () => {
          cart.add(p.id, qty);
          toast(`${qty} x ${p.name} added to cart.`);
        },
      }, "Add to cart"),
      order),
    h("p", { class: "text-sm text-muted" }, "WhatsApp opens with this item written for you. We confirm the total before you pay. ",
      h("a", { href: "/cart", class: "font-semibold text-leaf underline underline-offset-2" }, "View cart")));
}

function infoCard(id: string, title: string, ...kids: (Node | string)[]): HTMLElement {
  return h("section", { class: "card p-5", "aria-labelledby": id }, h("h2", { id, class: "mb-2 text-xl font-bold" }, title), ...kids);
}

function related(p: Product): HTMLElement | null {
  const others = getProducts().filter((x) => x.id !== p.id);
  const same = others.filter((x) => x.category === p.category);
  const rest = others.filter((x) => x.category !== p.category && x.inStock);
  const picks = [...same, ...rest].slice(0, 4);
  if (!picks.length) return null;
  return h("section", { class: "mt-12", "aria-labelledby": "rel-title" },
    h("h2", { id: "rel-title", class: "section-title" }, same.length ? "More from this range" : "You may also like"),
    h("ul", { class: "mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4" }, ...picks.map(productCard)));
}

function render(p: Product): void {
  setMeta(p);
  document.getElementById("crumb-cat")?.replaceChildren(h("a", { href: `/shop?category=${encodeURIComponent(p.category)}`, class: "underline-offset-2 hover:underline" }, p.category));
  document.getElementById("crumb-name")!.textContent = p.name;

  const nutrition = nutritionTable(p);
  const video = videoBlock(p);
  const unit = formatUnitPrice(p);
  const rel = related(p);

  const info = h("div", { class: "space-y-4" },
    h("p", {}, h("a", { href: `/shop?category=${encodeURIComponent(p.category)}`, class: "font-semibold text-leaf underline-offset-2 hover:underline" }, p.category)),
    h("h1", { class: "text-3xl font-bold md:text-4xl" }, p.name),
    h("p", { class: "flex flex-wrap items-baseline gap-x-3 text-3xl font-bold" }, formatMoney(p.price),
      ...(offerInfo(p) ? [h("s", { class: "text-xl font-medium text-muted" }, formatMoney(p.mrp)), h("span", { class: "badge bg-berry px-3 py-1 text-sm text-white" }, `Save ${formatMoney(p.mrp - p.price)}`)] : []),
      p.weight ? h("span", { class: "text-lg font-medium text-muted" }, `Pack size ${p.weight}`) : h("span")),
    unit ? h("p", { class: "text-sm text-muted" }, unit) : h("span"),
    h("p", {
      class: p.inStock ? "badge bg-tint px-3 py-1 text-sm text-leaf" : "badge bg-fg px-3 py-1 text-sm text-ink",
    }, p.inStock ? "In stock" : "Sold out"),
    p.shortDescription ? h("p", { class: "max-w-prose text-lg" }, p.shortDescription) : h("span"),
    quantityAndAdd(p),
    compareButton(p));

  const article = $("#product");
  article.replaceChildren(
    h("div", { class: "grid gap-6 md:grid-cols-2 md:gap-10" }, gallery(p), info),
    h("div", { class: "mt-10 grid gap-4 md:grid-cols-2" },
      infoCard("ing-title", "Ingredients", h("p", { class: "max-w-prose" }, p.ingredients || "Ask us on WhatsApp for the full ingredient list.")),
      nutrition
        ? infoCard("nut-title", "Nutrition", nutrition,
            h("p", { class: "mt-2 max-w-md text-sm text-muted" }, "Values are per 100 g, as supplied by the seller. Your portion may be smaller or larger."))
        : h("span"),
      p.howToUse ? infoCard("use-title", "How to use", h("p", { class: "max-w-prose" }, p.howToUse)) : h("span"),
      infoCard("q-title", "Quality information",
        h("dl", { class: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1" },
          h("dt", { class: "font-semibold" }, "FSSAI Lic. No."), h("dd", {}, p.fssai || FSSAI_NUMBER),
          h("dt", { class: "font-semibold" }, "Category"), h("dd", {}, p.category),
          ...(p.weight ? [h("dt", { class: "font-semibold" }, "Pack size"), h("dd", {}, p.weight)] : [])),
        h("p", { class: "mt-3 text-sm" }, h("a", { href: "/quality", class: "font-semibold text-leaf underline underline-offset-4" }, "What we check and what we do not claim")))),
    ...(video ? [video] : []),
    ...(rel ? [rel] : []),
    h("p", { class: "mt-8 max-w-prose text-sm text-muted" }, "Not a substitute for medical advice. Consult your doctor or dietitian."));
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
