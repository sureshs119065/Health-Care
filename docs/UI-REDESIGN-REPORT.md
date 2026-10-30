# Task 6: Premium storefront redesign

The existing Astro + Tailwind + TypeScript project was redesigned in place. The Google Sheet catalogue, cart,
WhatsApp checkout, manual UPI workflow, claims guard (`CLAIMS_APPROVED`), compare page and Netlify setup are unchanged.
No payment gateway and no new backend were added.

## What changed
- **Design system** (`src/styles/global.css`): tokens for colour, type, radius, shadow; buttons, cards, chips, badges.
  Palette: white pages, deep leaf green (trust), marigold (the buy action), berry (real offers only).
  Headings use Bricolage Grotesque (self-hosted via `@fontsource-variable/bricolage-grotesque`, the only new dependency).
- **Header**: announcement bar (`ANNOUNCEMENTS`), wide search with thumbnails, prices, category results and an empty state,
  WhatsApp button, cart with live count badge, Categories mega menu, full navigation, compact mobile header with menu, search and cart.
- **Home** (12 sections): hero, ordering facts, category tiles, campaign banners (`PromoBanner.astro`), bestsellers carousel,
  shop by need, video reels, trust, how-to-use cards, ready-made sets, brand story, ordering steps, contact, footer.
- **Reels** (`lib/reels.ts`): 9:16 cards, arrows on desktop, swipe on phones, click-to-load YouTube (nothing is requested until play),
  only one plays at a time, playback stops when scrolled out of view. Until real videos exist, cards say "Video coming soon".
- **Shop**: breadcrumbs, category title, count, sort, filters (category, price range, availability, pack size, features, bestsellers),
  active-filter chips, phone filter sheet, URL-shareable state.
- **Product cards and pages**: illustrated tile when there is no photo, stock status, quick view dialog, gallery (several photos in the
  sheet `image` column separated by `|`), WhatsApp "Order this" button, quality block, related products.
- **Cart and drawer**: product thumbnails, subtotal, delivery note. WhatsApp message now says "Subtotal".
- **Footer**: 4 columns (collapsible on phones), business details, FSSAI number, social links when set.
- **New pages**: `/offers`, `/faq`, `/how-to-order`, `/delivery`, `/quality`, `/privacy`, `/terms` (and `/returns` when `RETURNS_POLICY` is filled in).

## Owner-editable content (`src/config.ts`)
`ANNOUNCEMENTS`, `OFFERS`, `CAMPAIGNS`, `NEEDS`, `BUNDLES`, `HERO_IMAGE`, `BESTSELLER_TAG`, `SOCIAL_LINKS`,
`BUSINESS_NAME`, `BUSINESS_ADDRESS`, `DELIVERY_POLICY`, `RETURNS_POLICY`.

## Honesty rules kept
No made-up discounts, timers, scarcity, reviews, testimonials, certifications or health claims. "Offers" shows only items listed in `OFFERS`
(empty by default). Set prices are the plain sum of the items. "Bestsellers" are the products the owner tags `featured` (there is no sales data).

## Needs real business data
Product photos (sheet `image` column), recipe video ids (`videoId`), real WhatsApp number, FSSAI number, site URL, seller story, hygiene and packaging notes,
delivery and returns wording, social links, storage instructions (the sheet has no storage column yet).
Read the privacy and terms pages once before launch.
