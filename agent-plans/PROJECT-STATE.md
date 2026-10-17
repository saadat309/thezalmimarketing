# Current Project State

**Updated:** 2026-10-17
**Workstream:** website migration planning
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
- The user approved the isolated staging-app design direction, successor URL policy, later session/RBAC boundary, deferred email/password migration, and no legacy API bridge. The local `apps/staging-web/` public slice now uses synthetic fixtures only; it has not been deployed or connected to a backend.
- `apps/ssr-spike/` demonstrates local TanStack Start SSR inside the Cloudflare Vite plugin's local Workers runtime. Initial HTML contains route-specific metadata and synthetic content; unknown routes and unknown fixture slugs return HTTP 404. It has no bindings or deploy script. Authored pages and runtime code remain JavaScript/JSX; the generated TanStack route tree is the only permitted TypeScript artifact and is ignored by Git under ADR-012.
- The spike pins Wrangler as a local dependency and provides `npm run cf:whoami`. Its Vite wrapper directs local generated config/log files into an ignored app directory; the build no longer emits the prior log-directory permission warning. Starting local servers in this managed shell may require elevated loopback permission; that is a sandbox restriction, not a project or production runtime requirement.
- With explicit user approval, deployed `zalmi-ssr-spike-local` to `https://zalmi-ssr-spike-local.thezalmimarkettingsajidmahmood.workers.dev`. The deployed build serves synthetic SSR content only; Wrangler dry-run reported no bindings. Public GET smoke checks returned `200` for `/` and `/properties/sample-residence/`, and real `404` for `/missing-route/` and `/properties/not-a-fixture/`.
- Read the selected account's Workers plans page: the active plan is Free at $0/month (the page labels Free as the current plan); no billing settings were opened or changed. Cloudflare's displayed Free limits include 100,000 Worker requests/day. This verifies the Workers plan, not other Cloudflare products or account-level purchases.
- Added a synthetic `GET /api/health` server route to `apps/ssr-spike/`; it returns `{ "status": "ok", "environment": "synthetic" }` with `Cache-Control: no-store`. The route shares the TanStack Start Worker app with SSR. Local smoke checks pass for GET (`200` JSON), HEAD (`200`, empty body), and unsupported POST (`405`, `Allow: GET, HEAD`). The already-published Workers.dev deployment was not updated and does not include this new route yet.

## Production and security boundaries

- cPanel remains production. The one approved Cloudflare test Worker is isolated on its default Workers.dev URL; no custom domain/production route, binding, DNS change, or data migration was configured. Local synthetic application code also exists in `apps/staging-web/`; it has not been deployed or connected to a backend.
- Staging starts with synthetic/sample data and must not connect to production MySQL.
- Project configuration and previous Git history contain exposed credentials. Do not reproduce values; the user clarified these will be rotated before production deployment. The synthetic preview has no secrets or backend credentials.
- All migration-related changes must stay on `Website-migration`, never `main`.

## Next safe actions

1. For the next session, verify actual branch/status and read `AGENTS.md`, this file, `DECISIONS.md`, and the latest `CHANGELOG.md` entry.
2. Review the local health-route contract and tests; obtain explicit approval before deploying this new route to the existing Workers.dev preview.
3. Keep hosted test traffic modest within the confirmed Workers Free limit; do not activate a paid plan or add metered bindings/services.
4. Have the owner complete the aggregate record/media report before media/storage design; do not request records or secret values.

## Open questions

- Actual production table counts, media/PDF size, and media growth rate are not present in this checkout.
- D1 capacity and rewritten query row usage need validation against representative sample data.
- R2 total usage and operation budgets need a hard application cap to prevent charges above free allowances.
- Detailed RBAC, password-hash compatibility, transactional email provider, final redirect map, and exact route/API mapping remain to be designed.
- Worker compatibility for packages beyond this minimal SSR and static API route set remains unverified. SSR and 404 behavior are demonstrated on the hosted preview; `/api/health` has only been tested locally and has not been deployed.
- Canonical hostname, permanent redirect map, real 404 behavior, endpoint response contracts, and media lifecycle rules are not decided; authenticated/admin route checks remain out of scope for public verification.
- The local SPA's unknown paths still return host-dependent status, but the separate Worker SSR spike proves HTTP 404 for both unmatched paths and missing fixture slugs locally and on its hosted synthetic preview.

Always verify Git's live branch/status and the latest commit rather than relying only on this snapshot.
