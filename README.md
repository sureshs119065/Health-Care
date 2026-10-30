# WhatsApp Order Website (Phases 1 to 3)

```
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs to dist/
npm run preview    # test the built site, then run Lighthouse in Chrome
```

Settings: copy `.env.example` to `.env` and set `PUBLIC_SHEET_CSV_URL`. Edit `src/config.ts` for the WhatsApp number, store name, FSSAI number, `CLAIMS_APPROVED`, `SITE_URL` and `ENABLE_PWA`.

Pages: `/`, `/shop`, `/offers`, `/recipes`, `/about`, `/faq`, `/how-to-order`, `/delivery`, `/quality`, `/privacy`, `/terms`, `/compare`, `/product?id=ID`, `/cart` (desktop; phones use the drawer), `/404`, plus `/sitemap.xml`, `/robots.txt` and `/manifest.webmanifest`.

For the owner: `docs/OWNER-README.md`, `docs/PRE-LAUNCH-CHECKLIST.md`, `docs/sample-products.csv`.

UX update (Task 5): see `docs/UX-IMPROVEMENT-REPORT.md`.

Redesign (Task 6): see `docs/UI-REDESIGN-REPORT.md`. New owner settings are at the bottom of `src/config.ts`.
