# Convivia24: 1 November 2026 web launch

Scope: responsive customer website, admin desk, supplier portal, partner wholesale, events/venues, brands/campaigns, party planning, loyalty/rewards, referrals and trivia. Native iOS/Android builds are deferred. Initial delivery cities are Lagos, Abuja and Port Harcourt. Checkout requires an account. Couriers are booked externally and assigned by staff.

This is the release plan and the record of implemented changes. Passing code checks is not a claim that production accounts, stock, delivery coverage or business processes are ready. No live database migrations, cloud provisioning, payments or deployment were performed as part of this implementation.

## What changed

| Surface | Launch implementation | Required operational setup |
| --- | --- | --- |
| Storefront | Live catalog and product pages, unpublished SKU handling, dynamic product cart resolution, shared public footer and delivery/support links | Confirm products, prices, photographs, descriptions, minimum quantities and physical opening stock |
| Cart | Guest persistence and account cart merge; account cart loads before syncing updates | Rehearse account/device changes and price changes |
| Account | Safe sign-in redirects, password recovery/reset, verification controls, profile settings, saved addresses, marketing preference and deletion requests | Configure Neon Auth origins, email delivery, Google provider if offered; deletion requests require staff processing |
| Checkout | Account and signed age declaration required; enabled city/zone required; fee and server quote shown before payment; price-change guard; repeat submissions reuse an order | Enter actual coverage, fees and delivery promises; confirm contact/terms/returns copy |
| Payments | Buyer ownership checks; exact amount, currency and reference checks; server provider verification; duplicate callback ledger; closed-order payments go to exceptions | Configure Flutterwave keys, webhook and live account approval; rehearse successful, failed, duplicate and late callbacks |
| Inventory | Transactional reservation ledger; whole-basket rollback; supplier transfer releases previous hold; consume/release once | Count stock; reconcile historical reservations in Admin → Launch readiness; do not seed invented counts into production |
| Delivery | Admin zones/providers, manual booking reference, HTTPS tracking URL, cost, receipt and recipient age verification | Contract and test actual couriers; train staff to book externally; no automated courier booking integration |
| Fulfilment | Status, stock, loyalty receipt, timeline and notification queue commit together; delivery requires a receipt and adult handover confirmation | Rehearse packing, routing, unavailable supplier, missed handover and returns |
| Orders | Tracking, support link, resumable unpaid payment and printable order receipt | Verify receipt identity and amounts; tax invoice requirements need the business's approved tax details |
| Refunds | Pending/completed ledger, provider reconciliation, partial cash refund, full closure, gift-credit restoration, no automatic restock of delivered goods | Verify real provider statuses; bank refunds require external payment evidence; physical returns need a stock count |
| Staff | Owner, operations, finance and content permissions; owner staff management/audit; shared production password disabled by default | Create actual staff accounts, assign roles and test access boundaries |
| Support | Account/order-scoped tickets, admin replies and status, deletion-request queue | Staff the inbox; replies appear in the signed-in support page; establish response targets and deletion handling |
| Wholesale | Outlet approval; unpaid → paid → packed → dispatched → received; managed stock reserves on confirmed payment and consumes at dispatch; receipt credits outlet stock/points once; full bank refunds recorded | Confirm wholesale prices and stock before accepting bank funds; manual bank collection/refund; partial wholesale refund automation is deferred |
| Rewards | Atomic points spend, stock reservation for physical SKUs, admin fulfilled/cancelled flow, cancellation returns points once | Confirm reward stock and pickup/delivery instructions; fulfil physical rewards through the operations desk |
| Referral/perk gift cards | Atomic debit/payout and gift-card issuance; outlet-bound gift-card ownership; bank payout requires reference | Approve partners/rates; reconcile already-paid commission when a later refund occurs |
| Events/venues/circles | Existing publishing/discovery/follow/RSVP flows retained; navigation follows public feature flag | Enable events, publish real upcoming events and venues, confirm capacity/admission/perks; no paid ticketing system is represented |
| Brands/campaigns/trivia | Existing ownership approvals, campaign management and trivia operations retained with staff permission checks | Verify real brand claims, prizes, sponsor terms, campaign tasks and draw scheduling; rehearse each feature in staging |
| Party planning/AI | Existing shared plans and invites retained; optional Azure AI | Exercise actual invite links and privacy; disable unavailable AI offers and verify configured deployments if enabled |
| Notifications | Transactional order notice queue, leased retries, provider idempotency keys and admin retry desk | Configure Resend sender/DNS and admin inbox; run the Netlify scheduler and check real delivery |
| Platform | Production rate limits fail closed, secure cookies, security headers, narrowed image hosts, image MIME/signature/size checks, database health endpoint and readiness screen | Configure Redis, secrets, monitoring, image access and backups; rehearsal under concurrent usage |

## Release-critical setup, in order

1. Create an isolated Neon staging branch and a separate Netlify preview/site. Use staging-only provider credentials. Set `DATABASE_URL` explicitly to that branch before running `npm run db:migrate`. The migration loads local environment files if a variable is absent; never rely on guessing which database they point to.
2. Apply the migration to staging and verify existing orders, inventory, gift cards, supplier holds, wholesale and loyalty balances. Historical holds are backfilled only from recorded inventory movements; mismatches must be resolved against real counts. Existing wholesale records are labelled `legacy_completed`, not silently replayed into inventory.
3. Configure `.env.example` values in Netlify. Required: database, Neon Auth origin and 32+ character cookie secret, owner email allowlist, Flutterwave secret key/hash, public HTTPS URL, Redis credentials, Resend key/from and scheduler secret. Set `NEXT_PUBLIC_EVENTS_ENABLED=true` for the agreed full-platform scope. Supply a dedicated supplier session secret and admin notification address. Keep shared admin login disabled.
4. Configure Flutterwave's webhook to `/api/stripe/webhook` with the matching v3 `verif-hash`. Existing `/api/stripe/*` route names are retained for compatibility; the provider is Flutterwave. Test against the provider version configured in your account before live activation.
5. Add delivery zones for each city in Admin → Delivery, with agreed naira fees, coverage names and realistic estimates. Add actual courier providers/contacts. No example rates or courier agreements were inserted.
6. Set real stock and prices in the admin inventory/supplier desks. The historical `seed-inventory.ts` and `seed-suppliers.ts` scripts contain demonstration counts/prices: **do not run them against production**. Create package inventory records with correct component availability when using packages.
7. Establish support, failed-delivery, damaged/incorrect order, refund, age refusal, return inspection, privacy/deletion and staff escalation procedures. Confirm the business address, payment recipient/bank details and legal wording before publication.
8. Activate the Netlify `commerce-jobs` scheduled function (every five minutes). It calls `POST /api/cron/commerce` with `Authorization: Bearer <CRON_SECRET>`. Authenticate one staging call, confirm real email delivery and verify no failed/overdue queue entries remain.
9. Open Admin → Launch readiness. Resolve missing configuration, missing city zones/providers, stock-ledger mismatches, payment exceptions and notification failures. Also review overdue payment holds and pending refunds in Finance. A green configuration screen does not replace the rehearsals below.
10. Take a production backup and test restoring it into a separate branch. Schedule a short checkout pause for migration and historical stock reconciliation. Validate production after deployment, then re-enable checkout only after the release owner signs off.

## Acceptance rehearsals

Use real staging services as well as the isolated automated suite. Record order/payment IDs and expected ledger outcomes in a private release log.

- Customer: age gate → search/filter → product → cart → sign up/in → saved address → city/zone → review fee/discount/gift credit → Flutterwave → receipt/order tracker → support reply. Repeat on desktop, Android Chrome and iPhone Safari.
- Authentication: password recovery email/token, invalid/expired token, email verification, sign out/in, Google callback if offered, unsafe return URL, account with no email and revoked staff account.
- Payment: correct NGN amount; wrong currency/amount/reference; another buyer's order; retry initialization; duplicate browser verify and webhook; payment received after cancellation; provider/network outage; bank/manual confirmation only when explicitly enabled.
- Inventory: last bottle bought concurrently; one unavailable basket component; repeated reservation; reservation expiry/cancellation; supplier reassignment; repeated delivery and refund; unpublish SKU and confirm it disappears from catalog, URL and sitemap.
- Delivery: each supported city, disabled zone, changed fee after review, courier assignment/booking, tracking link, recipient age refusal, proof of delivery, address correction and a failed delivery raised through support.
- Refund: partial then full; asynchronous provider completion; ambiguous response requiring reconciliation; duplicate request; full gift-only order; mixed gift/cash order; bank return evidence; delivered return without automatically adding stock.
- Wholesale: pending outlet rejected; owner approval; live price; bank record/stock confirmation; dispatch consumes managed stock; outlet receipt credits stock/points once; cancelled unpaid order; full bank refund and inspected return count.
- Rewards/referrals: insufficient points/tier/stock, duplicate completion/cancellation, cancelled reward returns points; approved referral, cash payout reference, gift payout, failed issuance rollback and later-refund accounting review.
- Events/brands/trivia/party: real published listings, RSVP/follow capacity assumptions, ownership claim approval, campaign tasks, trivia round/draw and prize fulfilment, party share/invite persistence. Any unverified flow remains a launch gate for full-platform launch.
- Staff: content cannot refund/manage stock; operations cannot confirm bank payments or grant roles; finance cannot approve outlets/manage staff; suppliers can see only assigned orders; customers cannot read someone else's receipt/ticket/order.
- Reliability: provider timeout, Redis/database outage, scheduler overlap, mail outage/retry, live health alert, stock digest and restore rehearsal. Measure performance/accessibility with the actual production catalog and photos.

## October schedule

| Deadline | Outcome |
| --- | --- |
| 2–11 October | Merge reviewed implementation; migrate isolated staging; populate real catalog, coverage and staff; provider accounts configured |
| 12–18 October | Complete every business workflow rehearsal, resolve failures and verify finance/stock reconciliation |
| 19–25 October | Production-like device/accessibility/load testing; backup restore, provider outage and notification rehearsals |
| 26–29 October | Freeze scope; confirm content, support coverage, courier contacts and legal policies; release candidate approved |
| 30–31 October | Backup, production migration/reconciliation, controlled order and refund, monitoring/scheduler checks; go/no-go review |
| 1 November | Open checkout after sign-off; monitor orders, payment exceptions, stock holds, refund queue and inbox during the first operating shift |

## Azure resources

Keep Netlify hosting, Neon Postgres/Auth and Flutterwave for this release. The existing app already supports Azure Blob Storage and optional Azure OpenAI. A full hosting/database migration adds release work without fixing the commerce workflows.

For image uploads, use a StorageV2 account and a dedicated media container. Keep credentials server-side in Netlify. The existing `NEXT_PUBLIC_AZURE_DRINK_SAS` is browser-visible: it must provide **read-only access to public marketing media**, never write/delete/list permissions or access to customer evidence. Restrict the media container/account to marketing assets; store customer evidence separately with private access. The implemented delivery proof field is a staff text receipt, not a public evidence upload.

Microsoft recommends disallowing anonymous access for secure storage accounts; use appropriate authenticated access for private content: [Azure Blob security recommendations](https://learn.microsoft.com/en-us/azure/storage/blobs/secure-blobs). Azure's free account has time/usage limits; inspect your actual subscription eligibility and budget before creating resources: [Avoid charges with a free account](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/avoid-charges-free-account). No resources were provisioned and no cost assumption is made about your subscription.

If AI is enabled, provide a working deployment, endpoint and server key and test the existing feature calls. AI is optional for ordering and can be disabled if deployment/quota is unavailable. Existing Sentry support can provide error monitoring; verify actual alert delivery.

## Verification and limits

Run:

```sh
npm ci
npm run lint
npm run typecheck
npm test
npx playwright install chromium
npm run test:browser
npm run build -- --webpack
```

The database tests run the schema and transactional functions in isolated PGlite/Postgres, without reading the live `.env` database. Browser checks run with stubbed APIs, blank live credentials, desktop Chrome and an iPhone-sized Chromium viewport. They do not prove live Neon Auth, Flutterwave, Resend, Azure access, Safari compatibility or provider callbacks. The existing eight live-database integration tests remain opt-in and must be run against a designated staging database.

Webpack production build validation is used because this workstation denied a compiler subprocess port required by Turbopack. The application retains its standard build command; validate the default command on the target Netlify build environment too.

Outstanding product improvements that are outside the initial manual launch workflow: automated courier quotes/booking, wholesale partial refunds, tax invoices, automated personal-data deletion after retention review, private photo evidence uploads, notification channel preferences beyond marketing email, wider browser coverage and native mobile apps. These must not be advertised as delivered functionality.

Operational limitations: expiry does not cancel a Flutterwave order while provider verification is unavailable/ambiguous. Check overdue holds and reconcile with the provider dashboard. Refunds with an ambiguous external response are not automatically resubmitted. Previously paid referral commissions and points already spent before a refund need finance review; balances are not allowed to become negative automatically. Returns never add delivered stock without inspection/counting.

Local verification at implementation completion: 306 automated tests passed; eight live-database tests skipped; eight browser journeys passed; TypeScript passed; ESLint reported zero errors (existing warnings remain); Webpack production build passed. Dependency audit reports zero critical/high issues and three moderate issues in the deferred Capacitor CLI development dependency chain. Production/staging provider and operational checks above remain outstanding.
