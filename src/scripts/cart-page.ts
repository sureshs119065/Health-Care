import * as cart from "../lib/cart";
import { readForm, resetForm, sendOrder } from "../lib/checkout";
import { $ } from "../lib/dom";
import { getLines, loadMenu, onMenuLoaded } from "../lib/store";
import { cartRow, setVisible, toast } from "../lib/ui";
import { formatMoney, grandTotal } from "../lib/whatsapp";

// On phones the cart is a drawer on the home page.
if (window.matchMedia("(max-width: 767px)").matches) {
  window.location.replace("/?cart=1");
}

let loaded = false;
let sent = false;

function render(): void {
  if (!loaded) return;
  const lines = getLines();
  const has = lines.length > 0;
  setVisible($("#empty"), !has);
  setVisible($("#content"), has, "grid");
  if (!has) {
    sent = false;
    return;
  }

  const list = $("#cart-list");
  list.replaceChildren(...lines.map(cartRow));

  const total = formatMoney(grandTotal(lines));
  $("#cart-total").textContent = total;
  $("#p-total").textContent = total;

  const soldOut = lines.filter((l) => !l.p.inStock);
  const warn = $("#cart-warning");
  warn.textContent = soldOut.length ? `Remove sold out items to continue: ${soldOut.map((l) => l.p.name).join(", ")}.` : "";
  setVisible(warn, soldOut.length > 0);
  $<HTMLButtonElement>("#p-submit").disabled = soldOut.length > 0;

  setVisible($("#checkout-wrap"), !sent);
  setVisible($("#sent"), sent);
}

$("#p-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const lines = getLines();
  if (lines.length === 0 || lines.some((l) => !l.p.inStock)) return;
  const data = readForm("p");
  if (!data) return;
  $<HTMLAnchorElement>("#reopen").href = sendOrder(lines, data);
  sent = true;
  render();
  $("#sent-done").focus();
});

$("#sent-done").addEventListener("click", () => {
  cart.clear();
  resetForm("p");
  sent = false;
  render();
  toast("Thank you. We will confirm your total on WhatsApp.");
});

$("#sent-back").addEventListener("click", () => {
  sent = false;
  render();
  $("#p-name").focus();
});

async function init(force = false): Promise<void> {
  setVisible($("#skeleton"), true, "grid");
  setVisible($("#error"), false);
  setVisible($("#empty"), false);
  setVisible($("#content"), false, "grid");
  try {
    await loadMenu(force);
    loaded = true;
    setVisible($("#skeleton"), false, "grid");
    render();
  } catch (err) {
    console.error(err);
    setVisible($("#skeleton"), false, "grid");
    setVisible($("#error"), true);
  }
}

cart.subscribe(render);
onMenuLoaded(render);
$("#retry").addEventListener("click", () => void init(true));
void init();
