import * as cart from "../lib/cart";
import { $, h } from "../lib/dom";
import { formatUnitPrice } from "../lib/pricing";
import { getProducts, loadMenu } from "../lib/store";
import { setVisible, toast } from "../lib/ui";
import { videoPlayer } from "../lib/video";
import { formatMoney } from "../lib/whatsapp";

async function init(force = false): Promise<void> {
  setVisible($("#skeleton"), true, "grid");
  setVisible($("#error"), false);
  setVisible($("#empty"), false);
  setVisible($("#video-grid"), false, "grid");
  try {
    await loadMenu(force);
    const list = getProducts().filter((p) => p.videoId);
    $("#video-grid").replaceChildren(
      ...list.map((p) =>
        h("article", { class: "card overflow-hidden" },
          videoPlayer(p),
          h("div", { class: "space-y-2 p-4" },
            h("h2", { class: "text-lg font-bold" }, p.name),
            h("p", { class: "text-sm font-semibold" },
              [formatMoney(p.price), p.weight, formatUnitPrice(p)].filter(Boolean).join(" · ")),
            p.howToUse ? h("p", {}, p.howToUse) : p.shortDescription ? h("p", {}, p.shortDescription) : h("span"),
            h("div", { class: "flex flex-wrap gap-2 pt-1" },
              h("a", { href: `/product?id=${encodeURIComponent(p.id)}`, class: "btn btn-outline" }, "View product"),
              p.inStock
                ? h("button", {
                    type: "button",
                    class: "btn btn-primary",
                    onclick: () => {
                      cart.add(p.id);
                      toast(`${p.name} added to cart.`);
                    },
                  }, "Add to cart")
                : h("span", { class: "inline-flex min-h-11 items-center font-semibold" }, "Sold out")))),
      ),
    );
    setVisible($("#skeleton"), false, "grid");
    setVisible($("#empty"), list.length === 0);
    setVisible($("#video-grid"), list.length > 0, "grid");
  } catch (err) {
    console.error(err);
    setVisible($("#skeleton"), false, "grid");
    setVisible($("#error"), true);
  }
}

$("#retry").addEventListener("click", () => void init(true));
void init();
