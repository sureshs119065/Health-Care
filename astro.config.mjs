import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "static",
  // product.html, cart.html, 404.html: plain URLs like /product?id=P001 work on Netlify with no redirects
  build: { format: "file" },
  vite: { plugins: [tailwindcss()] },
});
