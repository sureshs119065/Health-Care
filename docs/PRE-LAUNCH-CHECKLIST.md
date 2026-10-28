# Pre-launch checklist

Tick every item before sharing the website with customers.

## FSSAI licence type
- [ ] Confirm which FSSAI category applies to your business (registration, State licence or Central licence). The category depends on your annual turnover and kind of food business. Check the current limits on the FSSAI website (fssai.gov.in) or ask your FSSAI consultant.
- [ ] Put the 14-digit number in `FSSAI_NUMBER` in `src/config.ts`.
- [ ] Confirm the licence number is also printed on your packaging labels.
- [ ] Ask whether selling through your own website changes anything for your licence.

## Wording check: "diabetic friendly" and "organic"
- [ ] Keep `CLAIMS_APPROVED = false` until both claims are cleared. The site then shows "low sugar" and "wholesome" instead.
- [ ] "Organic": confirm you hold the certification needed to call products organic in India. Without it, do not use the word.
- [ ] "Diabetic friendly": confirm with your FSSAI consultant whether this claim is allowed for each product and what proof is needed under the FSSAI claims rules. Never say a food treats, cures or prevents a disease.
- [ ] Read every product name, description and tag in the Google Sheet for these words and for health promises. The site hides the two words automatically while claims are off, but check the wording still makes sense.
- [ ] Check the nutrition numbers come from a lab report or a proper calculation, not the sample file.
- [ ] Footer shows: "Not a substitute for medical advice. Consult your doctor or dietitian."

## Test order on a real Android phone
- [ ] Open the live site on an Android phone with mobile data (not Wi-Fi only).
- [ ] Add 2 items, change a quantity, remove one, and reload the page. The cart should still be there.
- [ ] Try a wrong phone number and an empty address. Error messages should appear.
- [ ] Send a test order. WhatsApp should open with the items, totals, address and the line "Please confirm the total and send the UPI QR."
- [ ] Check the total in the message is correct.
- [ ] Tap "I sent the order". The cart should clear.
- [ ] Mark one item `FALSE` in the sheet and confirm it shows "Sold out" within 10 minutes.
- [ ] Open a product page, and play a video if you added one.
- [ ] Open a wrong address (like `/abc`). The friendly 404 page should appear.

## UPI fee check with your bank
- [ ] Ask your bank whether receiving UPI payments into your account has any fee or limit, and whether a personal account is allowed for business sales.
- [ ] Ask about daily receiving limits for UPI.
- [ ] Keep a record of each order and payment for your accounts. Ask your accountant about GST and income records.

## Search and sharing
- [ ] `SITE_URL` in `src/config.ts` matches your live address, then deploy again.
- [ ] Open `your-site/sitemap.xml` and `your-site/robots.txt`. Both should load.
- [ ] Share the link in a WhatsApp chat to yourself. The green preview picture should appear.
- [ ] Submit the sitemap in Google Search Console (optional, helps new shops appear sooner).
- [ ] If you turned on `ENABLE_PWA`, test it: open the site, switch the phone to airplane mode, reload. The last menu should still open.

## Speed and accessibility check
- [ ] On a computer, open the live site in Chrome > right-click > Inspect > Lighthouse > Mobile > Analyze. Aim for 90 or more in Performance, Accessibility, Best Practices and SEO. Fix large photos first if Performance is low.

## Final
- [ ] WhatsApp number is correct and active on a phone you check during the hours shown in the Contact section.
- [ ] Delivery area and hours in `src/config.ts` are updated.
