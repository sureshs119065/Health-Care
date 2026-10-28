import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import { SITE_URL } from "../config";
import { parseCsv } from "../lib/csv";
import { jsonToProducts, rowsToProducts } from "../lib/products";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Product ids at build time: from the published sheet if reachable, otherwise the saved menu. */
async function productIds(): Promise<string[]> {
  const url = import.meta.env.PUBLIC_SHEET_CSV_URL as string | undefined;
  if (url) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (res.ok) return rowsToProducts(parseCsv(await res.text())).map((p) => p.id);
    } catch (err) {
      console.warn("Sitemap: sheet not reachable, using saved menu.", err);
    }
  }
  try {
    const raw = JSON.parse(await readFile("public/data/products.json", "utf8")) as Record<string, unknown>[];
    return jsonToProducts(raw).map((p) => p.id);
  } catch {
    return [];
  }
}

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [`${SITE_URL}/`, ...(await productIds()).map((id) => `${SITE_URL}/product?id=${encodeURIComponent(id)}`)];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${esc(u)}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
    `\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
