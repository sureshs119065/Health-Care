# Owner guide: running your food website

You change prices and items in a Google Sheet. Only the WhatsApp number and a few settings need a file edit.

## 1. Set up your Google Sheet (once)
1. Go to sheets.google.com and create a new sheet.
2. File > Import > Upload > choose `docs/sample-products.csv` > "Replace spreadsheet".
3. Rename the tab at the bottom to **Products**.
4. Never rename or reorder the top row (the headings). Each item is one row.

## 2. Publish the sheet to the web (once)
1. In the sheet: File > Share > **Publish to web**.
2. First box: choose the **Products** tab. Second box: choose **Comma-separated values (.csv)**.
3. Click **Publish**, then copy the link. This link only lets people read the menu.

## 3. Connect the link to the website
Put the link in the setting called `PUBLIC_SHEET_CSV_URL`.
- **If the site is connected to GitHub on Netlify:** Netlify > Site configuration > Environment variables > Add a variable. Name: `PUBLIC_SHEET_CSV_URL`. Value: the link. Save, then Deploys > Trigger deploy.
- **If you deploy by drag and drop:** Netlify does not build the site, so it cannot read its settings. Put the link in the `.env` file (copy `.env.example`, paste the link after the `=`), run `npm run build`, then drag the `dist` folder to Netlify (see section 9).

After this, the site reads the sheet by itself. Changes in the sheet show on the website within about 5 to 10 minutes. No new deploy is needed.

## 4. Mark an item sold out
Change `inStock` for that row to `FALSE`. Change it back to `TRUE` when it is available. A "Sold out" badge appears and it cannot be added to a cart.

## 5. Add a new item
Add a new row at the bottom. Fill `id` (a short code that is not used by any other row, for example `P013`), `name`, `category`, `price` (numbers only, like 180) and `inStock`. Rows with a missing id, name or a non-number price are skipped.
Nutrition values are for **100 g**. Energy is in kcal; protein, carbs, fibre and fat are in grams. Use real values from a lab report or label calculation. The sample numbers are only examples.

## 5b. New in this version: tips, featured items and trust text
- **howToUse column:** one or two true sentences on how to use the product. It appears on the product page and the recipe sections.
- **featured tag:** add `featured` to the `tags` of products you want on the home page.
- **Small packs:** add a small pack (for example 50 g) as its own row so customers on a budget can try it. The site shows the price per 100 g for every pack.
- **Trust and About text:** edit `TRUST_POINTS`, `SELLER_NAME`, `ABOUT_STORY`, `HYGIENE_NOTE` and `PACKAGING_NOTE` in `src/config.ts`. Write only things that are true and that you could show to an inspector. Leave a note empty to hide it.

## 6. Add a photo
1. Resize the photo to about 800 x 800 pixels and keep it under 200 KB.
2. Save it in the project folder `public/images/` with a simple name, like `millet-soup.jpg`.
3. In the sheet, set `image` to `/images/millet-soup.jpg`.
4. Deploy again (section 9). A full link starting with `https://` also works if the photo is already online.
Items without a photo show a leaf picture.

## 7. Add a YouTube video
Open your video on YouTube. The link looks like `youtube.com/watch?v=aBcDeFgHiJk`. Copy the 11 characters after `v=` (here `aBcDeFgHiJk`) into the `videoId` column. The video only loads when a customer taps play.

## 8. Change your WhatsApp number or other settings
1. Open `src/config.ts` in Notepad or any text editor.
2. Change `WHATSAPP_NUMBER` (country code and number, no plus sign or spaces, like `919876543210`), `STORE_NAME` and `FSSAI_NUMBER`.
3. Save, then build and deploy again (section 9).
Leave `CLAIMS_APPROVED` as `false` until your wording has been checked (see the pre-launch checklist).

## 9. Deploy by drag and drop
1. Install Node.js (nodejs.org, the LTS version) once.
2. In the project folder, run `npm install` once, then `npm run build`.
3. Open app.netlify.com > Sites > your site > Deploys.
4. Drag the new **dist** folder onto the box that says to drag and drop.
5. Open your site and test one order.

## 10. Set your website address (for Google and WhatsApp previews)
After your first deploy, copy your site address (like `https://sunita-foods.netlify.app`) into `SITE_URL` in `src/config.ts`, with no slash at the end. Build and deploy again. This fixes the share preview picture, Google's page links and the sitemap.
The share picture is `public/og-image.png` (1200 x 630). Replace it with your own photo if you like.
Note: when someone shares a single product link on WhatsApp, the preview shows the shop picture and name, not that product. Google can still read each product page.

## 11. Optional: "Add to home screen" and offline browsing
In `src/config.ts` change `ENABLE_PWA` to `true`, build and deploy. Customers can then add the site to their phone's home screen, and can open the last menu they saw without internet. Prices are always fresh when they are online. If anything misbehaves, set it back to `false` and deploy again; the site removes it automatically.

## 12. Photo tips for a fast site
Use WebP or JPG, about 800 x 800 pixels, under 150 KB each.

## If something looks wrong
- A yellow message "Showing saved menu" means the sheet could not be read. Check the published link and that the Products tab is published.
- An item is missing: check its row has an id, a name and a numeric price.

## Diwali offer (added)

- The offer product is row P013 in the sheet (docs/sample-products.csv). Add a new column named `mrp` to your Google Sheet: `mrp` = price before the offer, `price` = the offer price. Add the P013 row to the sheet too.
- The price (₹499, was ₹610) is a placeholder. Change it to your real offer price before launch.
- Add a hamper photo at /images/products/diwali-snack-hamper.png and put that path in the image column.
- src/config.ts: `DIWALI` controls the home page section and the Offers page (set `enabled: false` to hide). `ANNOUNCEMENTS` controls the scrolling top bar. Add `validity` text only if it is true.
