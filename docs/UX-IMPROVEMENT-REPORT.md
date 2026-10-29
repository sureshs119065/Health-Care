# Task 5: UI/UX improvement report

Scope: competitor-informed update of the existing WhatsApp order website (Astro, Tailwind, TypeScript). The project was updated in place. No payment gateway was added; the manual WhatsApp and UPI workflow is unchanged.

## 1. What the competitor research says (and what it does not)
Source: the existing competitive analysis (Diabexy, BeatO/GudSwap, Healthy Master, Svasthyaa, Diabliss, Amazon.in) plus the added quick-commerce comparison. The live competitor sites were **not re-audited** in this task, so layout details of those sites are not claimed here.

| Finding from the existing analysis | Design decision |
|---|---|
| Big diabetes brands feel corporate and impersonal | A personal "Meet the seller" block, an About page, and "Made by a nurse" as the first trust point |
| Strong product claims can be regulated | Claims switch kept; plain facts only (ingredients, nutrition, FSSAI number); no health benefit or disease wording added |
| Marketplaces reach many people but claims are hard to trust | Every product page shows ingredients, nutrition per 100 g and the FSSAI number; the order flow states that the seller confirms the total |
| Competitors win on snack variety and search | Header search with suggestions, categories, filters, sorting, featured items |
| Quick-commerce apps win on speed | We do not compete on delivery speed. We compete on price transparency, trust and a one-message order for night-shift nurses |

## 2. Updated personas and empathy maps (preliminary)
Both personas come from two short friend conversations. Treat them as preliminary until real interviews confirm them.

**Persona 1: Budget-conscious family caregiver**
Looks after his father's food without adding pressure on the household budget. Cooks the same food for everyone, shops at local grocery stores and compares prices.

| | |
|---|---|
| Says | "We cook the same food for everyone." "Special healthy foods are costly." "We need to know what is good for him." |
| Thinks | Can we afford this every month? Is it worth the price? Can we trust an unfamiliar seller? |
| Does | Cooks home meals, shops locally, compares prices |
| Feels | Concerned about his father's diet, careful about spending, confused by nutrition labels |
| Pains | High prices, limited food knowledge, doubts about quality and hygiene, few affordable options |
| Gains | Affordable everyday food, trustworthy information, smaller packs, easy comparison |
| **Design response** | Price per 100 g everywhere, sort by price and by price per 100 g, a compare table (up to 3 items), nutrition per 100 g with a plain note, small packs listed as separate items |

**Persona 2: Night-shift nurse**
Needs convenient snacks during night shifts and already uses quick-commerce apps.

| | |
|---|---|
| Says | Healthy food is expensive. Why switch from Zepto? |
| Thinks | Is this seller genuine? Is the food clean and good quality? |
| Does | Looks for quick snacks during shifts, uses quick-commerce apps |
| Feels | Rushed, tired, unsure about new sellers |
| Pains | Price, hygiene and quality doubts, seller credibility, few convenient options at night |
| Gains | Affordable healthy snacks, verified quality, a trusted seller, quick ordering |
| **Design response** | Search always visible in the header, two-column mobile grid, one-tap add to cart, sticky "View Cart" bar, cart remembered on the phone, ready-written WhatsApp order, seller and FSSAI information one tap away |

## 3. Pain point to solution map

| Pain point | What was implemented | Main files |
|---|---|---|
| Healthy food feels expensive | Price, pack size and price per 100 g on every card, product page and compare table; sort by price and price per 100 g; "In stock only" filter | `lib/pricing.ts`, `lib/card.ts`, `scripts/shop.ts` |
| Doubts about hygiene, quality, seller credibility | Trust strip in the home hero, Meet the seller section, About page, FSSAI number in footer, product pages and About; optional hygiene and packaging notes that appear only when the owner fills in true text | `config.ts`, `pages/index.astro`, `pages/about.astro` |
| Nutrition and product information is confusing | Nutrition table per 100 g with a plain explanation, ingredient list, "How to use" section, same fields in the compare table | `scripts/product.ts`, `scripts/compare-page.ts` |
| Hard to discover affordable, convenient snacks | Header search with suggestions (products and categories), popular category tiles, Shop page with category filters and sorting, featured products (sheet tag `featured`) | `scripts/header.ts`, `pages/shop.astro`, `scripts/home.ts` |
| Family caregivers need budget-friendly everyday products | Compare page, unit price sorting, small packs shown beside large ones | `pages/compare.astro`, `lib/compare.ts` |
| Night-shift nurses need fast ordering | Visible search and cart on every screen size, 44 px targets, sticky cart bar, drawer cart, ready-written WhatsApp order | `components/Header.astro`, `scripts/shell.ts` |
| Need trustworthy information before trying an unfamiliar seller | All of the above, plus clear text on the home page, About page and cart that the seller confirms the total and shares a UPI QR separately, with no online payment | `pages/index.astro`, `pages/about.astro` |

## 4. UI and navigation changes
- **Header:** logo and brand name, Home, Shop, Categories, Recipe Videos, About Us, Contact, a prominent search bar with suggestions, and a cart button with item count. On phones and tablets the menu collapses into a labelled button with large touch targets.
- **Home page:** hero with the value proposition and Shop Now and Explore Products buttons, trust points, popular categories, featured products, recipe videos, Meet the seller, How ordering works (5 steps), FAQ, contact.
- **New pages:** `/shop` (filters, sorting, search results), `/recipes`, `/about`, `/compare`.
- **Visual design:** off-white page background, white cards with thin borders and a light shadow, one green brand colour, an amber accent for the main calls to action, one set of radii and spacing, system fonts.
- **Measured contrast** (WCAG ratios, all above the 4.5:1 minimum): body text 14.5:1, text on cards 15.0:1, green on white 7.8:1, white on the green button 7.8:1, white on the amber button 5.0:1 (the lowest), placeholder text 6.2:1.

## 5. Owner actions for the new features
- Add the tag `featured` to products that should appear on the home page.
- Fill the new `howToUse` column with practical, true tips. Add `videoId` values to fill the recipe sections.
- List small packs as separate rows (for example a 50 g trial pack) so customers can compare.
- Edit `TRUST_POINTS`, `SELLER_NAME`, `ABOUT_STORY`, `HYGIENE_NOTE` and `PACKAGING_NOTE` in `src/config.ts`. Write only statements that are true and can be shown to a regulator. Empty notes stay hidden.

## 6. Files changed or added
**Changed:** `src/config.ts`, `src/styles/global.css`, `src/layouts/Shop.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/pages/index.astro`, `src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts`, `src/scripts/home.ts`, `src/scripts/product.ts`, `src/scripts/shell.ts`, `src/lib/copy.ts`, `src/lib/products.ts`, `src/lib/store.ts`, `src/lib/types.ts`, `public/data/products.json`, `docs/sample-products.csv`.

**Added:** `src/pages/shop.astro`, `recipes.astro`, `about.astro`, `compare.astro`; `src/scripts/shop.ts`, `recipes.ts`, `compare-page.ts`, `compare-tray.ts`, `header.ts`; `src/lib/pricing.ts`, `compare.ts`, `card.ts`, `video.ts`.

## 7. Validation
**Done:** TypeScript syntax check of every `.ts` file; a check that every element id used by each page script exists in that page's markup; tests of the pack-size parser (200 g, 1 kg, 2 x 100 g, 500 ml, 1.5 L, non-weight sizes); the earlier CSV and row-validation tests; measured contrast ratios.

**Not done (no network or browser in the authoring environment):** `npm install`, a build, testing on real screen sizes, console-error checks and Lighthouse. Run `npm run build && npm run preview` and the checklist below before sharing.

**Manual test checklist**
1. At 360 px, 768 px and 1440 px: header, menu button, search and cart all visible and usable.
2. Type "mil" in the search box: suggestions appear; arrow keys and Enter work; Enter without a choice opens `/shop?q=mil`.
3. Shop: choose a category, tick In stock only, sort by price per 100 g; the URL updates and a reload keeps the state.
4. Tick Compare on 3 products; the Compare bar appears; the fourth shows a message; the Compare page lists them side by side.
5. Add items, change quantities, reload, send the order; check the WhatsApp text and that the cart clears only after "I sent the order".
6. Recipes page: with no `videoId` values the "coming soon" message shows; with a value the video loads only after tapping play.
7. Keyboard only: Tab through the header, open and close the menu with Escape, and check focus outlines.

## 8. Remaining limitations
- There are no customer reviews or ratings. None were invented; real reviews can be added later with the owner's customers' permission.
- Price per 100 g appears only when the pack size is in g, kg, ml or l.
- Search is simple text matching (no spelling correction).
- No reorder-last-order shortcut yet for night-shift customers.
- No delivery fee or delivery time calculation; the seller confirms these on WhatsApp.
- Hygiene, packaging and "about the seller" details must come from the owner; until then those sections show only neutral facts.
- Compare allows at most three products.
- Competitor sites were not re-audited live; the findings come from the existing analysis.
