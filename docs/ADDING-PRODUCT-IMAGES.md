# How to add product images

The site shows a product photo from the `image` field of each product. If that field is empty, it shows an illustrated
placeholder, so nothing breaks while you collect photos.

## Option A: photos stored inside the website (simplest)
1. Take or export a square photo. Best: 800 x 800 pixels, JPG or WebP, under 150 KB. Plain light background works well.
2. Name it in lowercase with dashes, for example `ragi-cookies.jpg`.
3. Copy it into this folder: `public/images/products/`
4. Put the path in the product's **image** value (it must start with a slash). Where you do it depends on how your site gets its products:
   - **Connected to a Google Sheet** (`PUBLIC_SHEET_CSV_URL` is set): edit the **image** column in the sheet. The files in this project are not read for product data.
   - **Not connected to a sheet yet** (the site says "Showing saved menu"): edit the **image** column in `docs/sample-products.csv`.
     Every `npm run dev` and `npm run build` copies that CSV into `public/data/products.json`, which is what the site actually reads.
     You can also run `npm run sync:products` by hand.
     Do not edit `products.json` directly, it is overwritten from the CSV.
5. Save, then restart `npm run dev` (it syncs the CSV on start) and press Ctrl+Shift+R. For the live site run `npm run build` and deploy again;
   photos inside the project go live only after a new deploy.

## Option B: photos hosted elsewhere
Put the full link in the **image** column, for example `https://your-host.com/ragi-cookies.jpg`.
The link must start with `https://`. No redeploy is needed if you only change the sheet.

## Several photos for one product
Put more than one path or link in the same cell, separated by a vertical bar `|`:
`/images/products/ragi-cookies.jpg|/images/products/ragi-cookies-pack.jpg`
The first one is the main photo. The product page then shows small thumbnails to switch between them.

## Things to know
- If a photo path is wrong or the file is missing, the card quietly shows the illustration instead of a broken image. Open the path in the browser (for example `http://localhost:4321/images/products/ragi-cookies.png`) to check it loads.
- The file name in the sheet must match the file name in the folder exactly, including capital letters and the extension.
- Photos you take on a phone can be 4 MB or more. Shrink them first (for example with squoosh.app) so the site stays fast.
- After changing the sheet, the site may keep the old list for a few minutes (see `CACHE_MINUTES` in `src/config.ts`).
  If you still see the old picture, press Ctrl+Shift+R.
- Use only photos you took or have permission to use.
- The home page hero picture is set with `HERO_IMAGE` in `src/config.ts`, for example `HERO_IMAGE = "/images/hero.jpg"`.

## Category pictures (home page "Shop by category" tiles)
1. Make a square picture for the category, 800 x 800 pixels, JPG or WebP. Example name: `snacks.jpg`.
2. Copy it into `public/images/categories/`.
3. Open `src/config.ts`, scroll to `CATEGORY_IMAGES` at the bottom and add one line per category:

       export const CATEGORY_IMAGES = {
         "Snacks": "/images/categories/snacks.jpg",
         "Breakfast": "/images/categories/breakfast.jpg",
       };

   The name on the left must match the category name in your sheet exactly (capitals and spaces too).
4. Save. With `npm run dev` the tile changes at once (press Ctrl+Shift+R). For the live site run `npm run build` and deploy again.

A category that is not listed uses the photo of its first product. If that product has no photo either, the illustration is shown.

## Promo banners on the home page ("Breakfast, ready in minutes", "Best price per 100 g", "Snacks for your bag")
1. Make a square or slightly tall photo, 1000 x 1000 pixels, JPG or WebP. The photo fills the right side of the banner, so keep the subject in the middle.
2. Copy it into `public/images/banners/`, for example `breakfast.jpg`.
3. Open `src/config.ts`, find `CAMPAIGNS`, and add an `image` value to the banner (add a comma after the previous value):

       { title: "Breakfast, ready in minutes", text: "...", cta: "Shop breakfast", href: "/shop?category=Breakfast",
         tone: "marigold", art: "Breakfast", image: "/images/banners/breakfast.jpg" },

4. Save. With `npm run dev` it updates at once (Ctrl+Shift+R). For the live site run `npm run build` and deploy again.

A banner without `image` keeps its illustration. To change the banner words or the page it links to, edit `title`, `text`, `cta` and `href` in the same place.
