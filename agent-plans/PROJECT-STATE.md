# Current Project State

**Updated:** 2026-10-17
**Workstream:** website migration planning
**Expected branch:** `Website-migration` (verify with Git at session start)
**Phase:** First isolated public staging slice implemented and locally verified; no Cloudflare/runtime deployment work has started.

## Current position

- The user approved the planning direction: JavaScript-only migration targeting Cloudflare Workers, SSR/prerendering, a hard zero-monthly-cost requirement, separate staging, and preservation of the live cPanel site.
- TanStack Start with Cloudflare Workers, D1, and R2 is the recommended target for validation. D1/R2 usage and runtime compatibility must be verified before provisioning or implementation.
- The user explicitly requires that `workers/ai-worker/` remain untouched. If AI is migrated, use a new parallel Worker.
- The user approved this Markdown continuity system. Root `AGENTS.md` defines the handoff workflow.
- Planning documents: `agent-plans/00-inspection-and-baseline.md`, `01-architecture-direction.md`, and `02-grand-migration-roadmap.md`.
- The repository contains a 30-table MySQL structure dump with no production rows and an eight-table calculator schema file with seed inserts. No live DB connection or production data export was used.
- A browser baseline was recorded for the live homepage. See the inspection document; treat it as a single dated baseline, not a universal performance guarantee.
- A repository-derived route/API/table inventory now records the current client surface, PHP resources, source data domains, and discovery gaps. See `agent-plans/03-route-api-data-inventory.md`; it is not yet a production URL or API contract.
- A prior read-only Wrangler authentication check is recorded in the work log. In this terminal session, `wrangler` was not resolvable, so no new authentication verification was possible and no Cloudflare action was attempted.
- A handler-level inventory now records observed API access behavior, special action paths, and contract work still needed. See `agent-plans/04-handler-contract-inventory.md`; it is evidence for design, not approval to reproduce the legacy API/security behavior.
- Read-only public checks now confirm HTTP-to-HTTPS redirects on both hosts, `robots.txt`, an apex-host sitemap (31 URLs), public primary routes, duplicate HTTPS apex/`www` accessibility, sitemap-to-canonical trailing-slash mismatches, missing About/Contact canonicals, and an SPA-shell HTTP `200` for an unknown URL that renders a client-side 404. See `agent-plans/05-live-url-observations.md`.
- `agent-plans/06-phase-0-1-owner-actions-and-proposed-contracts.md` contains a secret-safe owner rotation/inventory request and proposed per-domain contracts. It makes no implementation decision.
- The user approved the isolated staging-app design direction, successor URL policy, later session/RBAC boundary, deferred email/password migration, and no legacy API bridge. The local `apps/staging-web/` public slice now uses synthetic fixtures only; it has not been deployed or connected to a backend.

## Production and security boundaries

- cPanel remains production. No Cloudflare staging resources, DNS changes, data migration, or application implementation have been performed by this workstream.
- Staging starts with synthetic/sample data and must not connect to production MySQL.
- Project configuration and previous Git history contain exposed credentials. Do not reproduce values; credential rotation is a required security gate before deployment.
- All migration-related changes must stay on `Website-migration`, never `main`.

## Next safe actions

1. For the next session, verify actual branch/status and read `AGENTS.md`, this file, `DECISIONS.md`, and the latest `CHANGELOG.md` entry.
2. Review the locally verified public staging slice, then choose the next implementation slice: a Workers/SSR runtime spike or further synthetic public content. Do not add Cloudflare resources or deploy without approval.
3. Have the owner complete the aggregate record/media report before media/storage design; do not request records or secret values.
4. Before creating Cloudflare resources, get approval for the runtime spike, resource layout, and zero-cost usage guards.

## Open questions

- Actual production table counts, media/PDF size, and media growth rate are not present in this checkout.
- D1 capacity and rewritten query row usage need validation against representative sample data.
- R2 total usage and operation budgets need a hard application cap to prevent charges above free allowances.
- Detailed RBAC, password-hash compatibility, transactional email provider, final redirect map, and exact route/API mapping remain to be designed.
- Worker Node.js API compatibility and selected package compatibility need a JavaScript-only spike.
- Canonical hostname, permanent redirect map, real 404 behavior, endpoint response contracts, and media lifecycle rules are not decided; authenticated/admin route checks remain out of scope for public verification.
- The local staging app includes rendered not-found content and `404.html`; a future Worker/host runtime must still prove an actual HTTP 404 response.

Always verify Git's live branch/status and the latest commit rather than relying only on this snapshot.
