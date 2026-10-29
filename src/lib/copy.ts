import { CLAIMS_APPROVED } from "../config";

/** Replaces restricted claims anywhere (including sheet text) until claims are approved. */
export function cleanClaims(text: string): string {
  if (CLAIMS_APPROVED) return text;
  return text
    .replace(/diabetic[\s-]*friendly/gi, "low sugar")
    .replace(/organic/gi, "wholesome");
}

export const wording = CLAIMS_APPROVED
  ? {
      title: "Organic, diabetic-friendly foods made with care",
      valueProp: "Affordable, home-style healthy food from a nurse you can trust, ordered in one WhatsApp message.",
      metaDescription:
        "Organic, diabetic-friendly foods from a nurse's kitchen. Choose your items and send your order on WhatsApp.",
    }
  : {
      title: "Wholesome, low sugar foods made with care",
      valueProp: "Affordable, home-style healthy food from a nurse you can trust, ordered in one WhatsApp message.",
      metaDescription:
        "Wholesome, low sugar foods from a nurse's kitchen. Choose your items and send your order on WhatsApp.",
    };
