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

// ====================================================================
// Storefront content (Task 6 redesign). Everything below is optional and
// editable. Leave a list empty to hide the matching section. Write only
// what is true: nothing here is filled with made-up offers or claims.
// ====================================================================

// Slim bar above the header. Rotates if you add more than one message.
// Add `href` to make a message a link. Do not add discounts or delivery promises unless they are real.
export const ANNOUNCEMENTS: { text: string; href?: string }[] = [
  { text: "Order on WhatsApp. You pay by UPI only after we confirm your total.", href: "/how-to-order" },
];

// Real offers only (a discount you really run). Leave empty until you have one.
// Example: { title: "Festival week", text: "10% off Sweets until 20 Nov", href: "/shop?category=Sweets", cta: "Shop sweets" }
export const OFFERS: { title: string; text: string; href: string; cta: string }[] = [];

// Hero picture. Use a path under /public (for example "/images/hero.jpg"). Empty = illustrated pack tiles.
export const HERO_IMAGE = "/images/hero.png";

// Product tag that marks your "Bestsellers" in the Google Sheet tags column.
// The site has no sales data, so these are the items YOU mark with this tag.
export const BESTSELLER_TAG = "featured";

// Ready-made sets. Each set lists product ids from the sheet. The price shown is the plain sum of
// the items (no discount). Delete the sets, or the whole list, to hide the section.
export const BUNDLES: { title: string; text: string; ids: string[] }[] = [
  { title: "Breakfast set", text: "Muesli, dosa mix and chilla mix for a week of quick mornings.", ids: ["P003", "P004", "P005"] },
  { title: "Soup night set", text: "Both soup mixes in one go.", ids: ["P001", "P002"] },
  { title: "Snack box", text: "Ragi cookies, roasted chana and mixed seeds for the bag or the night shift.", ids: ["P006", "P008", "P012"] },
];

// "Shop by need" shortcuts. Each links to the shop with a filter. Edit the wording freely.
export const NEEDS: { title: string; text: string; href: string }[] = [
  { title: "Grab-and-go snacks", text: "Small packs you can keep in your bag.", href: "/shop?category=Snacks" },
  { title: "Quick breakfasts", text: "Mixes and muesli that are ready in minutes.", href: "/shop?category=Breakfast" },
  { title: "Family packs", text: "Packs of 400 g and above for the whole household.", href: "/shop?pack=large" },
  { title: "Everyday staples", text: "Flours for the daily roti, dosa and porridge.", href: "/shop?category=Flours" },
  { title: "Best price per 100 g", text: "Every product sorted by what you really pay.", href: "/shop?sort=unit-asc" },
];

// Footer social links. Leave empty to hide. Example: { label: "Instagram", href: "https://instagram.com/yourname" }
export const SOCIAL_LINKS: { label: string; href: string }[] = [];

// Business details shown at the bottom of the footer. Leave a line empty to hide it.
export const BUSINESS_NAME = "";
export const BUSINESS_ADDRESS = "";

// Policy text. Each line becomes one paragraph. The Returns page and its footer link appear only when this is filled in.
export const RETURNS_POLICY: string[] = [];
// Delivery text. If empty, the page explains the general WhatsApp confirmation steps and shows your delivery area.
export const DELIVERY_POLICY: string[] = [];

export const CAMPAIGNS: { title: string; text: string; cta: string; href: string; tone: "leaf" | "marigold" | "mist" | "berry"; art: string; image?: string }[] = [
 {
    title: "Breakfast, ready in minutes",
    text: "Muesli, dosa mix and chilla mix. Pick one and your morning is sorted.",
    cta: "Shop breakfast",
    href: "/shop?category=Breakfast",
    tone: "marigold",
    art: "Breakfast",
    image: "/images/banners/breakfast-banner.png"
  },
 {
  title: "Best price per 100 g",
  text: "Every product sorted by what you actually pay.",
  cta: "Compare prices",
  href: "/shop?sort=unit-asc",
  tone: "mist",
  art: "Flours",
  image: "/images/banners/best-price-banner.png"
},
  { title: "Snacks for your bag", text: "Roasted, wholesome and easy to carry.", cta: "Shop snacks", href: "/shop?category=Snacks", tone: "leaf", art: "Snacks", image: "/images/banners/snacks-banner.png" },
];


// Pictures for the "Shop by category" tiles on the home page.
// Left side = category name exactly as written in your sheet. Right side = image path (file inside /public) or https link.
// Example: "Snacks": "/images/categories/snacks.jpg"
// A category not listed here uses the photo of its first product, or an illustration if no photo exists yet.
export const CATEGORY_IMAGES: Record<string, string> = {
   "Snacks": "/images/categories/snacks.png",
  "Breakfast": "/images/categories/Breakfast.png",
  "Flours": "/images/categories/flours.png",
  "Soup Mixes": "/images/categories/soup-mixes.png",
  "Sweets": "/images/categories/sweets.png",
};
