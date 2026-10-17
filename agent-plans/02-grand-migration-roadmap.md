# Grand Website Migration Roadmap

This is the ordered implementation roadmap for `Website-migration`. Work one phase at a time, review the result with the user at each gate, and keep cPanel production unchanged until the final cutover is explicitly approved.

## North-star acceptance criteria

- The new site is deployed to a staging URL on the Cloudflare Free plan with no paid services or usage-based charges.
- Initial HTML for public pages contains useful content, correct page-specific title/description/canonical/Open Graph metadata, and a crawlable link structure.
- In repeatable mobile tests, key public URLs meet the agreed Core Web Vitals targets based on field and lab measurements; at minimum aim for p75 LCP ≤ 2.5 s, INP ≤ 200 ms, and CLS ≤ 0.1. Compare like-for-like runs against the baseline in `00-inspection-and-baseline.md`.
- Public properties, property details, maps, files, calculator, contact/inquiry, and the administrative content/auth flows work with the intended data and access rules.
- D1 and R2 schemas/data/media are reconciled against a safe source export; staging remains isolated and contains sample or approved sanitized data only.
- Security review, recovery/rollback rehearsal, accessibility, SEO, browser, and free-budget checks pass before a production cutover request.
- Existing AI Worker remains unchanged and available until a separate AI migration decision and cutover.

## Phase 0 — Protect production and establish migration rules

**Do first.**

1. Confirm the working branch is `Website-migration`; keep all migration commits/pushes there and never push them to `main`.
2. Keep the cPanel site, its MySQL DB, DNS, and existing `workers/ai-worker` untouched.
3. Rotate exposed credentials identified during inspection. Store all secrets only in local ignored variables or Cloudflare secret bindings; scan future commits for accidental secrets without printing them.
4. Inventory Cloudflare account plan/billing settings. Document how to avoid paid upgrades and charges; define alerts and hard application-side usage guards for R2.
5. Create no Cloudflare resources until the user approves the resource layout and the free-budget approach.

**Gate:** production remains live; secrets are rotated; branch and billing guardrails are written down.

## Phase 1 — Complete discovery and freeze contracts

1. Verify every public and admin URL, including route parameters, query strings, slug behavior, 404 behavior, redirects, canonical hostname, `robots.txt`, and sitemap.
2. Map frontend route → API endpoint → PHP handler → MySQL tables/relationships, including response shapes, pagination, filters, validation, mutations, file uploads, and auth/RBAC.
3. Review the actual SQL file definitions/indexes and calculator seed rules. Identify MySQL-specific SQL/types to translate and data constraints that matter to IDs, prices/decimals, dates, JSON/text, enums, and full-text search.
4. Inventory production data counts/size and cPanel media/PDF volume using owner-generated safe exports/reports. Do not connect a development Worker to production MySQL.
5. Reconcile docs with the current route tree, frontend behavior, deployment behavior, and live site. Record gaps instead of treating stale docs as implementation facts.
6. Record baseline performance and SEO for a defined URL set on desktop and mobile, with repeatable network/CPU settings. Include homepage, property listing, property detail, calculator, maps, and files.

**Gate:** reviewed endpoint/route/data mapping, URL redirect list, media inventory, and baseline report.

## Phase 2 — Technical spikes and detailed implementation design

1. Validate a JavaScript-only TanStack Start/Vite/Cloudflare Worker app locally and deploy a minimal non-production preview. Check SSR, prerender, generated metadata, D1/R2 bindings, and package compatibility without involving the current AI Worker.
2. Confirm the Cloudflare runtime APIs required by selected libraries. Avoid libraries requiring Node-only sockets, native add-ons, persistent servers, or unsupported APIs.
3. Verify `/api/*` compatibility can be served by the same Worker. If not, compare a separate JavaScript Worker/API deployment and its additional quota/ops cost.
4. Choose the final app directory, route/API module boundaries, migration tooling, cache policy, logging, auth/session design, email provider, and free-plan budgets.
5. Write the detailed app/data/auth/SEO design before implementation begins. Keep unresolved external-service/cost choices as explicit hold points.

**Gate:** minimal SSR preview works, no TypeScript introduced, runtime constraints are known, and cost model has no unapproved paid dependency.

## Phase 3 — Isolated staging foundation

1. Add the new JavaScript-only app in a separate migration directory so the existing client app remains usable as reference.
2. Configure separate local and staging environments. Bind a local D1 database first and a dedicated staging D1 database after approval; no binding may point to production MySQL.
3. Create a staging-only Worker name and preview URL. Do not bind the production hostname or edit current AI Worker configuration.
4. Add build/deploy preview workflow tied only to `Website-migration` after reviewing access tokens and repository permissions. Do not trigger production deploys from this branch.
5. Establish route-level logging, health checks, failure reporting, free quota measurement, and environment separation.

**Gate:** preview URL serves the new app; branch deployments cannot publish to production; staging data is isolated.

## Phase 4 — D1 schema, seeds, and migration tooling

1. Translate the 30-table MySQL schema and eight calculator tables into explicit SQLite/D1 migrations. Do not feed either MySQL SQL file directly to D1.
2. Decide which tables/features are needed in the first release; avoid importing unrelated legacy data or columns without consumers.
3. Recreate indexes for real query patterns, including property filtering/search, active records, slugs, relationships, leads/admin listings, and calculator scope/rules. Profile row reads to stay within D1 Free limits.
4. Create synthetic fixtures for common/edge cases and seed only approved calculator reference rules. Use stable keys and idempotent migrations.
5. Build a repeatable export-transform-import-verification process for a later, user-approved sanitized staging snapshot. Include counts, unique slugs, relationships, decimal values, and media references in reconciliation.
6. Define backup/restore steps and explicitly test rollback of schema changes against staging only.

**Gate:** local/staging D1 migrations are repeatable, seed data is isolated, and all required foreign relationships/queries are verified.

## Phase 5 — Backend/API migration in vertical slices

Migrate a domain together with its tests/consumer and acceptance checks rather than porting all PHP files mechanically.

1. Shared foundation: request routing, validation, errors, pagination, consistent response envelopes, D1 query helpers, role/permission checks, and security headers.
2. Public read domains: categories/locations/societies/phases, properties and detail relations, landing-page sections, maps/files metadata, and calculator public configuration.
3. User interactions: contact/inquiries and calculator operations. Add validation, spam/rate limits, safe logging, and email delivery with a verified no-cost route.
4. Authentication/admin foundations: users, roles, sessions, invitations, password reset, and permissions. Reassess legacy JWT/password hashes; do not expose tokens or secrets to browser storage/logs.
5. Admin CRUD: properties/media relations, locations, maps/files, landing content, calculator rules/configuration, inquiries, and users/roles.
6. AI integration: keep the PHP production bridge and existing AI Worker alone. If migration is approved, create a new JavaScript Worker in a new folder with its own secrets, prompt/knowledge source, URL, quota budget, and evaluation set. Test it through staging only.

**Gate per slice:** API contract and authorization checks pass; D1 row usage stays within budget; staging UI consumes the route; no production PHP route is altered.

## Phase 6 — SSR/prerendered frontend migration

1. Build the shared shell, responsive navigation/footer, design tokens, accessible focus states, and error/loading states in the new app.
2. Migrate SEO-critical public pages first: homepage, about/contact/privacy, property list, property detail, maps/files landing, and calculator landing. SSR current data where freshness matters; prerender stable editorial sections.
3. Put page-specific title, description, canonical, robots, social metadata, structured data, and visible content in the server-rendered/prerendered response.
4. Ensure property routes render title/price/location/images and meaningful fallback content without client JavaScript. Preserve slugs and create tested permanent redirects for changed URLs.
5. Keep calculator interactive but server-render explanatory/indexable content; verify formulas against provided seed rules and expected calculations.
6. Rebuild login/admin routes with server-enforced permissions; do not expose admin content in publicly cached HTML.
7. Preserve brand polish with small, purposeful animations, and honor `prefers-reduced-motion`. Remove or replace heavy preloader/scroll effects only when measurements show benefit.
8. Optimize above-fold media with correct dimensions, responsive image sizes, modern formats, discoverable hero markup, and high fetch priority only for the actual LCP image. Lazy-load below-fold content.

**Gate per route:** SSR/prerender HTML, metadata, responsive appearance, key interactions, URLs, and client hydration are verified on staging.

## Phase 7 — Media, email, AI, and content parity

1. Prepare an asset manifest for images, thumbnails, map PDFs, logos, and video/embed references. Match all old paths to new asset keys.
2. Before R2 migration, compare media footprint and expected read/write operations with the free allowance. Use Standard storage only; implement file type/size/total-cap limits and suspend uploads when the no-charge budget is reached.
3. Migrate a sample asset set to a staging R2 bucket and verify image variants, PDFs, authorization, caching, URL stability, and cleanup.
4. Migrate email interactions only after confirming delivery, sender verification, rate/anti-abuse behavior, reset/invite token handling, and no-cost limits.
5. If needed, create and evaluate the new AI Worker separately. Use a test knowledge set and staging URL. Do not reuse/print the current Worker secret, and do not alter current production route/config.

**Gate:** content/media/communication parity verified; quota guard has been exercised; existing AI chatbot remains available.

## Phase 8 — Parity, security, SEO, and performance validation

1. Browser-check all public routes on mobile/desktop: no console errors, broken images, inaccessible controls, layout regressions, or hydration failures.
2. Test CRUD, authentication, RBAC, invitation/reset flows, contact submissions, upload failure limits, calculator edge cases, pagination/filtering, and error behavior with sample users/data.
3. Verify SSR response source, crawler metadata, structured data, internal links, canonical URLs, sitemap, robots rules, redirects, and noindex on staging.
4. Run Lighthouse SEO/accessibility/best practices and Chrome performance traces on the same test profile/settings used for baseline. Compare LCP/INP/CLS, TTFB, JS payload, image bytes, API count, caching, long tasks, and DOM size.
5. Validate caching separately for immutable static assets, public SSR/API content, authenticated content, and mutations. Check that no private response is shared-cacheable.
6. Run security review: secret scan, auth/role bypass checks, injection/XSS, CSRF/session policy, upload validation, rate limits, PII-safe logs, and least-privilege bindings.
7. Simulate Workers/D1 limits and R2 guard thresholds. Confirm static content fallback behavior and clear errors when dynamic calls or uploads are unavailable.
8. Reconcile imported data/assets against source manifest. Do not use production user records for testing.

**Gate:** acceptance criteria met, zero unexpected charges, and all critical failures resolved or explicitly accepted by the user.

## Phase 9 — Cutover readiness and production migration

This phase is not authorized by approving the plan. It requires a new explicit release approval.

1. Decide the production snapshot/import window and whether cPanel admin changes must briefly pause for a final delta import. Never dual-write by default.
2. Take/verify recoverable cPanel files and MySQL backups. Freeze writes only with owner coordination; import final content/media via audited tooling.
3. Confirm Cloudflare usage budgets, domain verification, TLS, DNS/redirect plan, contact-email delivery, search-engine sitemap, monitoring, and on-call rollback instructions.
4. Keep cPanel deployment/database intact. Prefer a controlled DNS/route change that is reversible; retain old code, DB, and domain mapping for rollback.
5. Switch production only after explicit approval, monitor user-visible routes/forms/auth/AI and resource use, and roll back promptly if critical flows or free budget fail.
6. Do not delete cPanel or the old PHP backend until the stabilization window has passed and a separate archive/decommission decision is approved.

**Gate:** explicit user go-live approval after review of a concrete staging result and rollback rehearsal.

## First implementation slice after plan approval

Start with Phase 0 and Phase 1 only: secure credentials, confirm branch/deploy isolation, finish route/API/data/media inventory, and record a repeatable performance baseline. Then review the resulting technical-spike design before creating Cloudflare resources or replacing any application code.
