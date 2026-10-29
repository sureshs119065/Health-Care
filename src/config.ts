// The only file the owner edits besides the Google Sheet.

// WhatsApp number with country code, digits only (91 = India). Example: 919876543210
export const WHATSAPP_NUMBER = "919999999999";

export const STORE_NAME = "Nurse's Kitchen";

// Your 14-digit FSSAI licence/registration number.
export const FSSAI_NUMBER = "00000000000000";

// Keep false until your claims wording is approved (see pre-launch checklist).
// While false, "diabetic friendly" and "organic" are never shown on the site.
export const CLAIMS_APPROVED = false;

export const CURRENCY = "₹";
export const CACHE_MINUTES = 5;
export const MAX_QTY = 20;

// Shown in the Contact section. Edit freely.
export const SERVICE_AREA = "Delivery area: add your city or area here";
export const ORDER_HOURS = "We reply to WhatsApp orders from 9 am to 7 pm, Monday to Saturday";

// Your website address once deployed (no trailing slash). Used for share previews and the sitemap.
export const SITE_URL = "https://your-site.netlify.app";

// Offline-friendly "Add to home screen" support. Leave false until you have tested it (see docs).
export const ENABLE_PWA = false;

// ---- About and trust information (shown on the home page and the About page) ----
// Short statements shown in the trust strip on the home page. Keep every line true.
export const TRUST_POINTS: { title: string; text: string }[] = [
  { title: "Made by a nurse", text: "Small batches, sold directly by the person who makes them." },
  { title: "Know what is inside", text: "Ingredients and nutrition are listed on every product page." },
  { title: "FSSAI number shown", text: "Our licence number is in the footer and on every product page." },
  { title: "Pay only after we confirm", text: "No online payment. We confirm your total on WhatsApp, then send a UPI QR." },
];

// Optional text for the About page. Leave a line empty to hide it. Write only what is true.
export const SELLER_NAME = "";
export const ABOUT_STORY = "";
export const PACKAGING_NOTE = "";
export const HYGIENE_NOTE = "";
