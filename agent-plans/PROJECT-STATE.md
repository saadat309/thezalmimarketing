# Current Project State

**Updated:** 2026-10-17
**Workstream:** website migration planning
**Expected branch:** `Website-migration` (verify with Git at session start)
**Phase:** inspection and architecture planning; no application implementation started.

## Current position

- The user approved the planning direction: JavaScript-only migration targeting Cloudflare Workers, SSR/prerendering, a hard zero-monthly-cost requirement, separate staging, and preservation of the live cPanel site.
- TanStack Start with Cloudflare Workers, D1, and R2 is the recommended target for validation. D1/R2 usage and runtime compatibility must be verified before provisioning or implementation.
- The user explicitly requires that `workers/ai-worker/` remain untouched. If AI is migrated, use a new parallel Worker.
- The user approved this Markdown continuity system. Root `AGENTS.md` defines the handoff workflow.
- Planning documents: `agent-plans/00-inspection-and-baseline.md`, `01-architecture-direction.md`, and `02-grand-migration-roadmap.md`.
- The repository contains a 30-table MySQL structure dump with no production rows and an eight-table calculator schema file with seed inserts. No live DB connection or production data export was used.
- A browser baseline was recorded for the live homepage. See the inspection document; treat it as a single dated baseline, not a universal performance guarantee.

## Production and security boundaries

- cPanel remains production. No Cloudflare staging resources, DNS changes, data migration, or application implementation have been performed by this workstream.
- Staging starts with synthetic/sample data and must not connect to production MySQL.
- Project configuration and previous Git history contain exposed credentials. Do not reproduce values; credential rotation is a required security gate before deployment.
- All migration-related changes must stay on `Website-migration`, never `main`.

## Next safe actions

1. For the next session, verify actual branch/status and read `AGENTS.md`, this file, `DECISIONS.md`, and the latest `CHANGELOG.md` entry.
2. Continue Phase 0/1 of `02-grand-migration-roadmap.md`: coordinate credential rotation; map routes/endpoints/tables; inventory production record counts and cPanel media safely without connecting staging to production.
3. Before creating Cloudflare resources, get approval for the detailed runtime spike, resource layout, and zero-cost usage guards.
4. Do not start frontend/backend code work until the user requests the next implementation slice.

## Open questions

- Actual production table counts, media/PDF size, and media growth rate are not present in this checkout.
- D1 capacity and rewritten query row usage need validation against representative sample data.
- R2 total usage and operation budgets need a hard application cap to prevent charges above free allowances.
- Authentication/session migration, password-hash compatibility, transactional email provider, redirects, and exact route/API mapping remain to be designed.
- Worker Node.js API compatibility and selected package compatibility need a JavaScript-only spike.

Always verify Git's live branch/status and the latest commit rather than relying only on this snapshot.
