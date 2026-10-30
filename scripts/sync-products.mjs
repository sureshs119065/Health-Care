// Builds public/data/products.json (the "saved menu" the site shows when no Google Sheet is connected,
// or when the sheet cannot be reached) from docs/sample-products.csv.
// Runs automatically before `npm run dev` and `npm run build`, so editing the CSV is enough.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SRC = "docs/sample-products.csv";
const OUT = "public/data/products.json";

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((v) => v.trim() !== "")) rows.push(row);
  return rows;
}

if (!existsSync(SRC)) {
  console.warn(`[sync-products] ${SRC} not found. Keeping ${OUT} as it is.`);
  process.exit(0);
}
const rows = parseCsv(readFileSync(SRC, "utf8"));
const head = rows[0].map((h) => h.trim());
if (!head.includes("id") || !head.includes("name")) {
  console.error(`[sync-products] ${SRC} needs a header row with at least "id" and "name". ${OUT} was not changed.`);
  process.exit(0);
}
const products = rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? "").trim()])));
writeFileSync(OUT, JSON.stringify(products, null, 1) + "\n");
const withImage = products.filter((p) => p.image).length;
console.log(`[sync-products] ${products.length} products written to ${OUT} (${withImage} with an image).`);
