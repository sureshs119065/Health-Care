import { $ } from "./dom";
import type { CartLine, CheckoutData } from "./types";
import { setVisible } from "./ui";
import { buildMessage, normalizePhone, waUrl } from "./whatsapp";

function fieldError(prefix: string, id: string, message: string): void {
  const input = $<HTMLInputElement>(`#${prefix}-${id}`);
  const err = $(`#${prefix}-e-${id}`);
  err.textContent = message;
  setVisible(err, message !== "");
  input.setAttribute("aria-invalid", String(message !== ""));
}

/** Validates the checkout form with the given id prefix. Returns null (and shows errors) if invalid. */
export function readForm(prefix: string): CheckoutData | null {
  const name = $<HTMLInputElement>(`#${prefix}-name`).value.trim();
  const phone = normalizePhone($<HTMLInputElement>(`#${prefix}-phone`).value);
  const address = $<HTMLTextAreaElement>(`#${prefix}-address`).value.trim();
  const notes = $<HTMLTextAreaElement>(`#${prefix}-notes`).value.trim();

  fieldError(prefix, "name", name ? "" : "Please enter your name.");
  fieldError(prefix, "phone", phone ? "" : "Enter a 10 digit phone number.");
  fieldError(prefix, "address", address ? "" : "Please enter your delivery address.");

  if (!name || !phone || !address) {
    const bad = ["name", "phone", "address"].find((k) => $(`#${prefix}-${k}`).getAttribute("aria-invalid") === "true");
    if (bad) $(`#${prefix}-${bad}`).focus();
    return null;
  }
  return { name, phone, address, notes };
}

export function resetForm(prefix: string): void {
  $<HTMLFormElement>(`#${prefix}-form`).reset();
}

/** Opens WhatsApp with the order message and returns the link (for "Open WhatsApp again"). */
export function sendOrder(lines: CartLine[], data: CheckoutData): string {
  const url = waUrl(buildMessage(lines, data));
  window.open(url, "_blank", "noopener");
  return url;
}
