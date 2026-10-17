# Current Project State

**Updated:** 2026-10-18
**Workstream:** isolated synthetic API and homepage visual-parity slices
**Expected branch:** `Website-migration` (verify with Git at session start)
**Phase:** Isolated synthetic public slice implemented and SSR/runtime spike deployed to a separate Workers.dev preview. No production domain/routes, data, or DNS are connected.

## Current position

- The user approved the planning direction: JavaScript-first migration targeting Cloudflare Workers, SSR/prerendering, a hard zero-monthly-cost requirement, separate staging, and preservation of the live cPanel site. ADR-012 narrowly permits the TanStack-generated route-tree TypeScript file when required; authored application logic remains JavaScript/JSX.
- TanStack Start with Cloudflare Workers, D1, and R2 is the recommended target for validation. D1/R2 usage and runtime compatibility must be verified before provisioning or implementation.
- The user explicitly requires that `workers/ai-worker/` remain untouched. If AI is migrated, use a new parallel Worker.
- The user approved this Markdown continuity system. Root `AGENTS.md` defines the handoff workflow.
- Planning documents: `agent-plans/00-inspection-and-baseline.md`, `01-architecture-direction.md`, and `02-grand-migration-roadmap.md`.
- The repository contains a 30-table MySQL structure dump with no production rows and an eight-table calculator schema file with seed inserts. No live DB connection or production data export was used.
- A browser baseline was recorded for the live homepage. See the inspection document; treat it as a single dated baseline, not a universal performance guarantee.
- A repository-derived route/API/table inventory now records the current client surface, PHP resources, source data domains, and discovery gaps. See `agent-plans/03-route-api-data-inventory.md`; it is not yet a production URL or API contract.
- The required read-only `wrangler whoami` check succeeds through the pinned, repo-local CLI with account identity output suppressed when the process can read the globally authenticated profile. Use `npm run cf:whoami` from `apps/ssr-spike/`; no global PATH change is needed and no account mutation was performed.
- A handler-level inventory now records observed API access behavior, special action paths, and contract work still needed. See `agent-plans/04-handler-contract-inventory.md`; it is evidence for design, not approval to reproduce the legacy API/security behavior.
- Read-only public checks now confirm HTTP-to-HTTPS redirects on both hosts, `robots.txt`, an apex-host sitemap (31 URLs), public primary routes, duplicate HTTPS apex/`www` accessibility, sitemap-to-canonical trailing-slash mismatches, missing About/Contact canonicals, and an SPA-shell HTTP `200` for an unknown URL that renders a client-side 404. See `agent-plans/05-live-url-observations.md`.
- `agent-plans/06-phase-0-1-owner-actions-and-proposed-contracts.md` contains a secret-safe owner rotation/inventory request and proposed per-domain contracts. It makes no implementation decision.
- The user-approved property API contract is implemented as a local-only prototype in `apps/ssr-spike/`, using synthetic fixtures and JavaScript. It adds `/api/v1/properties` list and slug-detail GET routes with hidden/file-only exclusion, taxonomy/query filters, default-20/max-50 cursor pagination, page-field allowlisting, visible image ordering/thumbnail, dual-public video checks, and HTMLRewriter allowlist sanitization. Responses use `no-cache, must-revalidate` with SHA-256 ETags and `304` when unchanged; errors use `no-store`. User clarified freshness is required on next navigation/refetch only; no push/poll is in scope. ADR-016 records the bounded implementation authorization. The acceptance matrix has local HTTP and direct synthetic checks.
- The user approved a JavaScript repository adapter seam for property reads. `createPropertyApi` now depends on `hasPublicTaxonomySlug`, `listPublicProperties`, and `findPublicPropertyBySlug`; an in-memory synthetic implementation supplies those methods. This isolates filtering/order/cursor/lookup reads so a later D1 adapter can be developed without changing HTTP projection or the live site. No D1 adapter, binding, or database has been configured.
- The active `apps/staging-web/` entry is now a separate JavaScript TanStack Start + Cloudflare Vite frontend, with no API routes, bindings, deploy script, or production data source. Its homepage imports the existing `src/components/home/HeroSection.jsx` directly and reuses `src/index.css` plus the same Google Fonts families; the Start loader supplies empty sample collections and never imports the legacy API client. The app has its own synthetic-preview header, noindex metadata, and explicit deferred-content routes. The earlier hand-built React replica remains in `src/App.jsx`/`src/styles.css` but is no longer mounted. The root PHP-backed frontend and its files were not modified for this conversion.
- The prior local replica's typography/motion approximation remains only in its now-inactive files. The active homepage uses the source hero's Playfair Display/Syne and Inter/Plus Jakarta Sans stacks, gold gradient, rotating headline and animation, trust counters, tabbed search, and source Tailwind component styles. This is a first source-component reuse pilot, not complete homepage or route parity; the shared source `Navbar` and lower homepage sections have not yet been reused.
- `apps/staging-web/` builds with TanStack Start and Cloudflare's local Workers runtime. The synthetic homepage server-renders with noindex metadata, its local navigation/search uses Start routes only, and an unknown path returns HTTP `404`. Its separate `wrangler.jsonc` has no bindings; no staging Worker has been deployed.
- The user approved the isolated staging-app design direction, successor URL policy, later session/RBAC boundary, deferred email/password migration, and no legacy API bridge. The local `apps/staging-web/` public slice now uses synthetic fixtures only; it has not been deployed or connected to a backend.
- `apps/ssr-spike/` demonstrates local TanStack Start SSR inside the Cloudflare Vite plugin's local Workers runtime. Initial HTML contains route-specific metadata and synthetic content; unknown routes and unknown fixture slugs return HTTP 404. It has no bindings or deploy script. Authored pages and runtime code remain JavaScript/JSX; the generated TanStack route tree is the only permitted TypeScript artifact and is ignored by Git under ADR-012.
- The spike pins Wrangler as a local dependency and provides `npm run cf:whoami`. Its Vite wrapper directs local generated config/log files into an ignored app directory; the build no longer emits the prior log-directory permission warning. Starting local servers in this managed shell may require elevated loopback permission; that is a sandbox restriction, not a project or production runtime requirement.
- With explicit user approval, deployed `zalmi-ssr-spike-local` to `https://zalmi-ssr-spike-local.thezalmimarkettingsajidmahmood.workers.dev`. The deployed build serves synthetic SSR content only; Wrangler dry-run reported no bindings. Public GET smoke checks returned `200` for `/` and `/properties/sample-residence/`, and real `404` for `/missing-route/` and `/properties/not-a-fixture/`.
- Read the selected account's Workers plans page: the active plan is Free at $0/month (the page labels Free as the current plan); no billing settings were opened or changed. Cloudflare's displayed Free limits include 100,000 Worker requests/day. This verifies the Workers plan, not other Cloudflare products or account-level purchases.
- Added a synthetic `GET /api/health` server route to `apps/ssr-spike/`; it returns `{ "status": "ok", "environment": "synthetic" }` with `Cache-Control: no-store`. The route shares the TanStack Start Worker app with SSR. Local smoke checks pass for GET (`200` JSON), HEAD (`200`, empty body), and unsupported POST (`405`, `Allow: GET, HEAD`). With explicit user approval, redeployed the same Worker to the existing Workers.dev URL; remote GET smoke checks now confirm the route returns `200` with the expected JSON/content-type/no-store headers.

## Production and security boundaries

- cPanel remains production. The one approved Cloudflare test Worker is isolated on its default Workers.dev URL; no custom domain/production route, binding, DNS change, or data migration was configured. Local synthetic application code also exists in `apps/staging-web/`; it has not been deployed or connected to a backend.
- Staging starts with synthetic/sample data and must not connect to production MySQL.
- Project configuration and previous Git history contain exposed credentials. Do not reproduce values; the user clarified these will be rotated before production deployment. The synthetic preview has no secrets or backend credentials.
- All migration-related changes must stay on `Website-migration`, never `main`.

## Next safe actions

1. For the next session, verify actual branch/status and read `AGENTS.md`, this file, `DECISIONS.md`, and the latest `CHANGELOG.md` entry.
2. Continue homepage parity in `apps/staging-web/`: review the clickable local preview, then reuse the source `Navbar` and next homepage section with synthetic content. Resolve only the required public brand assets; keep listing media deferred. Preserve this frontend Worker boundary from the separate synthetic API spike.
3. Keep hosted test traffic modest within the confirmed Workers Free limit; do not activate a paid plan or add metered bindings/services.
4. Have the owner complete the aggregate record/media report before media/storage design; do not request records or secret values.

## Open questions

- Actual production table counts, media/PDF size, and media growth rate are not present in this checkout.
- D1 capacity and rewritten query row usage need validation against representative sample data.
- R2 total usage and operation budgets need a hard application cap to prevent charges above free allowances.
- Detailed RBAC, password-hash compatibility, transactional email provider, final redirect map, and exact route/API mapping remain to be designed.
- Before a D1 adapter, validate that its current reads/ETags observe every committed publish/update using local synthetic data, then assess D1 query/read and free-tier budgets. No Cloudflare resource or binding is authorized by the in-memory adapter.
- Worker compatibility for packages beyond this minimal SSR and static API route set remains unverified. SSR, 404, and `/api/health` behavior are demonstrated on the hosted synthetic preview.
- Property API store integration, version invalidation against committed writes, API-wide response envelope conventions, and sanitizer policy review remain open; the property routes are local synthetic-only and have not been deployed.
- Canonical hostname, permanent redirect map, real 404 behavior, endpoint response contracts, and media lifecycle rules are not decided; authenticated/admin route checks remain out of scope for public verification.
- The active `apps/staging-web/` Start app returns HTTP `404` for unmatched paths; its inactive predecessor SPA had host-dependent unknown-path status. The separate SSR spike also proves HTTP `404` for unknown routes and missing fixture slugs locally and on its hosted synthetic preview.

Always verify Git's live branch/status and the latest commit rather than relying only on this snapshot.
