import type { APIRoute } from "astro";
import { STORE_NAME } from "../config";

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: STORE_NAME,
        short_name: STORE_NAME.slice(0, 12),
        description: "Order healthy foods on WhatsApp.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#fbf6e9",
        theme_color: "#1f5d3a",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      null,
      2,
    ),
    { headers: { "Content-Type": "application/manifest+json; charset=utf-8" } },
  );
