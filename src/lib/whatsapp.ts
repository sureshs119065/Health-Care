import { CURRENCY, STORE_NAME, WHATSAPP_NUMBER } from "../config";
import type { CartLine, CheckoutData } from "./types";

export const formatMoney = (n: number): string =>
  `${CURRENCY}${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const lineTotal = (l: CartLine): number => l.p.price * l.qty;
export const grandTotal = (lines: CartLine[]): number => lines.reduce((s, l) => s + lineTotal(l), 0);

export function buildMessage(lines: CartLine[], d: CheckoutData): string {
  const items = lines.map(
    (l, i) =>
      `${i + 1}. ${l.p.name}${l.p.weight ? ` (${l.p.weight})` : ""}: ${l.qty} x ${formatMoney(l.p.price)} = ${formatMoney(lineTotal(l))}`,
  );
  return [
    `Hello ${STORE_NAME}, I would like to order:`,
    "",
    ...items,
    "",
    `Grand total: ${formatMoney(grandTotal(lines))}`,
    "(This total will be confirmed by the owner, including delivery if any.)",
    "",
    `Name: ${d.name}`,
    `Phone: ${d.phone}`,
    `Address: ${d.address}`,
    `Notes: ${d.notes || "None"}`,
    "",
    "Please confirm the total and send the UPI QR.",
  ].join("\n");
}

export const waUrl = (message: string): string =>
  `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

/** Accepts 10 digits, with optional +91 / 91 / 0 prefix and spaces or dashes. Returns 10 digits or null. */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^\d{10}$/.test(digits) ? digits : null;
}
