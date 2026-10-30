// Text for the support and policy pages. Written from how this site really works
// (no accounts, no online payment, orders confirmed on WhatsApp). The owner should read
// every page once before launch and edit anything that is not true for the business.
import { DELIVERY_POLICY, FSSAI_NUMBER, ORDER_HOURS, RETURNS_POLICY, SERVICE_AREA, STORE_NAME, WHATSAPP_NUMBER } from "../config";

export interface Section { heading?: string; paras?: string[]; list?: string[] }
export interface InfoPage { slug: string; title: string; intro: string; sections: Section[] }

const phone = `+${WHATSAPP_NUMBER.replace(/\D/g, "")}`;

export const FAQS: [string, string][] = [
  ["How do I place an order?", "Add items to your cart, fill in your details and tap “Send Order on WhatsApp”. Your order is written for you. Just press send in WhatsApp."],
  ["Do I pay on this website?", "No. There is no online payment here. After we confirm your total on WhatsApp, we send a UPI QR code and you pay from your own UPI app."],
  ["Is the total on the website final?", "The total shown is an estimate. We confirm the final total, including delivery if any, on WhatsApp before you pay."],
  ["How does delivery work?", "We confirm delivery options and timing for your address on WhatsApp after you send your order."],
  ["Can I change or cancel my order?", "Yes, before you pay. Message us on WhatsApp and we will update the order."],
  ["Can these foods replace medical advice?", "No. Our foods are not a substitute for medical advice. Please consult your doctor or dietitian about your diet."],
];

const pages: InfoPage[] = [
  {
    slug: "how-to-order",
    title: "Ordering guide",
    intro: "Five steps, all in one WhatsApp conversation. No account and no online payment.",
    sections: [
      { list: [
        "Browse the shop. Every pack shows its price, size and price per 100 g so you can compare.",
        "Add what you want to your cart and change quantities any time.",
        "Enter your name, phone number and delivery address. Add notes if you need to.",
        "Tap “Send Order on WhatsApp”. WhatsApp opens with your order already written. Press send.",
        "We reply to confirm your total and delivery. We then share a UPI QR code and you pay from your own UPI app.",
      ] },
      { heading: "Good to know", list: [
        "The total on the website is an estimate until we confirm it on WhatsApp.",
        "Your order is not confirmed until we reply to you.",
        ORDER_HOURS + ".",
      ] },
    ],
  },
  {
    slug: "delivery",
    title: "Shipping and delivery",
    intro: "We confirm delivery for your address on WhatsApp after you send your order.",
    sections: [
      DELIVERY_POLICY.length
        ? { paras: DELIVERY_POLICY }
        : { paras: [
            "Delivery options, timing and any delivery charge depend on your address. We confirm all of this with you on WhatsApp before you pay.",
            SERVICE_AREA + ".",
          ] },
    ],
  },
  {
    slug: "returns",
    title: "Returns and refunds",
    intro: `How ${STORE_NAME} handles problems with an order.`,
    sections: [{ paras: RETURNS_POLICY }],
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    intro: "What this website does with your information, in plain words.",
    sections: [
      { heading: "What we collect", list: [
        "The name, phone number, address and notes you type into the order form. They are used only to write your WhatsApp order message.",
        "Nothing is sent to our servers. This website has no accounts and no database.",
      ] },
      { heading: "What stays on your device", list: [
        "Your cart and compare list are saved in your browser so they survive a reload. Clearing your browser data removes them.",
        "A saved copy of the product list, so pages load faster.",
      ] },
      { heading: "WhatsApp", paras: [
        `When you send your order, the message goes to us on WhatsApp (${phone}) and is handled under WhatsApp’s own privacy terms. We use your details only to confirm and deliver your order.`,
      ] },
      { heading: "Videos", paras: ["Recipe videos load from YouTube only after you press play."] },
      { heading: "Questions", paras: ["Message us on WhatsApp if you would like us to delete an order conversation."] },
    ],
  },
  {
    slug: "terms",
    title: "Terms and conditions",
    intro: "The simple rules for ordering from this website.",
    sections: [
      { heading: "Orders", list: [
        "Sending an order on WhatsApp is a request to buy. It is confirmed only when we reply and confirm your total.",
        "Prices and availability shown here can change. We confirm the final price on WhatsApp.",
      ] },
      { heading: "Payment", paras: ["There is no online payment on this website. After we confirm your total we share a UPI QR code. Please pay only after that confirmation."] },
      { heading: "Changes and cancellations", paras: ["You can change or cancel an order before you pay by messaging us on WhatsApp."] },
      { heading: "Product information", paras: [
        "Ingredients and nutrition values are supplied by the seller and may differ slightly between batches. Check the pack label for the latest details.",
        "Our foods are not a substitute for medical advice. Consult your doctor or dietitian about your diet.",
      ] },
    ],
  },
  {
    slug: "quality",
    title: "Quality and ingredients",
    intro: "What you can check on every product, and what we do not claim.",
    sections: [
      { heading: "On every product page", list: [
        "The ingredient list.",
        "A nutrition table per 100 g, as supplied by the seller.",
        "The pack size, price and price per 100 g.",
        `Our FSSAI licence number: ${FSSAI_NUMBER}.`,
      ] },
      { heading: "What we do not claim", paras: ["We describe what is in each product. We do not claim that any food treats, cures or prevents a disease."] },
    ],
  },
];

export const INFO_PAGES = pages.filter((p) => p.slug !== "returns" || RETURNS_POLICY.length > 0);
