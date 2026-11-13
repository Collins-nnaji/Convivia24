# Storefront redesign — plan

Reference sites: The Whisky Exchange (home merchandising, editorial), Master of Malt (best-seller
rail, badges), Majestic (faceted search with counts). Market: **Nigeria** — NGN pricing, Lagos/Abuja-first
delivery, Paystack, WhatsApp support, owambe/birthday/corporate occasions, 18+.

The principle: **everything a merchandiser would change weekly is edited in the admin desk**, never in code.
The static `lib/drinks/catalog.ts` stays as the seed/fallback only.

---

## 1. What we take from the references

| Pattern | Source | Convivia24 version |
|---|---|---|
| Announcement bar ("Free UK delivery") | TWE | Admin-edited strip: delivery promise, promo codes, cut-off times |
| Utility row + centred logo + big search | TWE | Logo, search with live typeahead (bottles, brands, categories), account, basket with ₦ subtotal |
| Category nav row (NEW IN · WHISKY · … · BLACK FRIDAY) | TWE | New in · Deals · Champagne · Whisky · Cognac · Wine · Spirits · Cocktails · Mixers · Party packs · highlighted campaign link |
| Full-bleed hero banner with CTA + sub-links | TWE | Admin hero carousel (image, headline, CTA, link, theme, schedule window) |
| "Handpicked for you" grid, SAVE badges, Load more | TWE | Featured bottles (admin `featured` flag), SAVE ₦X from admin compare-at price, badge ribbons |
| "Looking for inspiration?" icon tiles + bottle finder | TWE | Tiles (Top picks, Party packs, Gifts, Under ₦50k, Deals, New in) + 3-step finder: style → brand → budget |
| Highlights mosaic | TWE | Admin highlight tiles (2 large + 4 small), image or brand gradient |
| Shop by brand | TWE | Brand wordmark strip from houses we stock |
| Best sellers rail with Add to basket, ratings | MoM | Computed from paid orders (last 90 days), fallback to featured |
| Get inspired articles | TWE | Admin editorial cards linking to Discover / guides / campaigns |
| What people are saying | TWE/Trustpilot | Real published product reviews + live average |
| Faceted filter sidebar with counts, chips, clear, sort, per-page, pagination | Majestic | Offers · Type · Brand · Country · Price (₦ bands) · Strength · Size · Rating & up |

## 2. Data model (migration `lib/db/storefront.sql`)

`inventory` gains merchandising columns (all optional, admin-edited):

- `compare_at_ngn` — the "was" price. `compare_at_ngn > price_ngn` ⇒ product is **on offer** and shows SAVE ₦X.
- `featured` — "Handpicked for you" + recommended sort.
- `badge` — one of `new`, `best-seller`, `staff-pick`, `exclusive`, `limited`, `gift`.
- `origin` — country (powers the Country facet).
- `merch_rank` — manual ordering within Recommended.
- `created_at` — powers "New in".

`storefront_blocks` — one table for every editorial slot:

- `kind`: `hero` · `announcement` · `highlight` · `editorial`
- `title`, `subtitle`, `cta_label`, `href`, `image_url`, `theme` (`ember`, `night`, `palm`, `gold`, `cream`), `position`, `published`, `starts_at`, `ends_at`.
- Scheduled blocks only render inside their window (Black Friday, Detty December, Valentine's).
- When the table is empty the site renders built-in defaults, so the home page is never blank.

## 3. Admin desk changes

- **New "Storefront" tab** (permission `content`): panes for Hero banners, Announcement bar, Highlights, Editorial.
  Each pane: list with publish toggle + reorder, modal form, image upload to Azure Blob, schedule window, live preview chip.
- **Drinks desk → Merchandising** on every SKU row: Featured toggle, Badge, Compare-at price (shows the live
  saving), Country, Rank. Saved through the existing `adjust` action, so it is audited and invalidates the catalog cache.

## 4. Storefront UI

- **Header**: announcement bar → main row (logo · search typeahead · account · basket) → category row (desktop).
  Mobile keeps the tab bar; search becomes a full-width row under the logo.
- **Home** (server-rendered, cached 60s in Redis): hero carousel → quick links → Handpicked grid (load more) →
  Inspiration (tiles + bottle finder) → Highlights mosaic → Shop by brand → Best sellers rail → Party planner band →
  Get inspired → Reviews wall → Trust strip (delivery cities, Paystack, authentic stock, 18+) → footer.
- **Shop**: Majestic-style facet sidebar with live counts, URL-synced multi-select (shareable links),
  active filter chips, sort (Recommended, Best selling, Price, Newest, Top rated, Biggest saving),
  per-page + pagination, mobile bottom-sheet filters with "Show N results".
- **Product card**: cream image well, SAVE circle, badge ribbon, brand eyebrow, name, size · ABV, stars, price with
  struck-through compare-at, full-width Add to basket.
- **Product page**: compare-at price + saving, badge.
- **Footer**: four columns (Shop, Help, Company, Account), delivery cities, payment + 18+ notice.

## 5. Phasing

1. **Foundation** — migration, catalog merge, admin merchandising, storefront blocks API + admin tab. ✅ this pass
2. **Home + header + footer** rebuilt against admin data. ✅ this pass
3. **Shop** faceted search rewrite + new product card. ✅ this pass
4. Next: wishlist hearts on cards, recently viewed rail, "Frequently bought together" on PDP, gift message/
   gift wrap at checkout, delivery-date picker per city, price-drop alerts (reuse restock_alerts), WhatsApp order
   share, Paystack instalments for party packs, structured data (Product/Offer/AggregateRating) on PDP.

## 6. After deploying

Run `npx tsx lib/db/migrate.ts` (adds the columns + table; idempotent). Then in the desk:
Storefront → add a hero banner and announcement; Drinks → mark featured bottles, set compare-at prices for deals.
