# Architecture Direction and Decisions

**Status:** direction approved for planning; implementation choices remain subject to the gates below.  
**Updated:** 2026-10-17

## Approved requirements

1. **No monthly hosting cost.** Do not use paid plans or allow usage-based charges. Build within free allowances and protect against overage. If a hard limit is reached, the plan is to degrade optional functionality safely or stop the affected operation—not turn on billing.
2. **JavaScript only.** Use `.js` and `.jsx`; do not add TypeScript, `.ts`, or `.tsx` to the migration. Existing third-party packages can contain TypeScript internally, but project-owned migration code stays JavaScript.
3. **Cloudflare hosting and SSR/prerendering.** The initial HTML should contain indexable content and metadata. Use static prerendering for stable public content and server rendering for pages requiring current property data.
4. **Preserve the current production site.** Develop and compare a separate staging site while cPanel remains live.
5. **AI isolation.** Do not touch `workers/ai-worker/`. If the AI feature must move, create a separate Worker with a separate name, config, secrets, staging endpoint, and deployment lifecycle; keep the current Worker operational until a separately approved cutover.
6. **Branch discipline.** All migration-related implementation and documentation changes go to `Website-migration`; never push them to `main`.
7. **Data safety.** Start with synthetic/sample staging records. No production DB connection or staging write path to live data.
8. **Keep the visual identity.** Keep minor, purposeful interactions/animations. Reduce expensive scroll/preloader effects, bundle work, and offscreen rendering based on measurements; respect reduced-motion preferences.

## Recommended target

### Application framework and deployment

Use **TanStack Start + Vite + the Cloudflare Vite plugin**, with project-authored JavaScript/JSX. This is the least disruptive SSR path because the current frontend already uses React and TanStack Router; Cloudflare's current guide documents Start's SSR, streaming, server functions, Worker bindings, and static prerendering support.

Deploy the new app as a Cloudflare Worker with static assets. Public pages should be prerendered when their content is stable, and data-dependent public pages should SSR from the new API/database with explicit caching. Admin routes may hydrate client interactivity but must authenticate/authorize on the server. Keep the existing root Vite SPA available as a legacy reference while the new staging app is built separately (recommended location to decide in the implementation design, such as `apps/site/`).

### JavaScript runtime and backend

Implement server-side routes/services in JavaScript on Cloudflare Workers. Keep the existing API contract initially where it avoids breaking frontend behaviors, then improve route contracts deliberately as each domain is migrated. Workers support a Web-standards JavaScript runtime and a subset of Node.js APIs via compatibility; they are not a continuously running, general-purpose Node.js server. Avoid dependencies that require unsupported Node APIs, native binaries, TCP sockets, or a persistent process. Validate the actual runtime with a small technical spike before choosing libraries.

Prefer one site Worker for SSR, public API routes, and admin API routes unless the implementation spike proves a separate API Worker materially improves isolation without adding operational or free-tier risk. Keep public read routes cacheable; keep authenticated routes, inquiries, and mutations private and uncached. Make auth, roles, input validation, upload authorization, rate limits, and audit logging explicit in the new services.

### Storage

- **D1:** candidate relational database because the MySQL domain is relational and the user requires a zero-cost Cloudflare target. Redesign the schema and SQL for SQLite rather than importing the MySQL dump. Keep MySQL and D1 IDs/data semantics consistent where possible to simplify mapping and reconciliation.
- **R2 Standard:** candidate for property images, maps, and documents that admins upload. First inventory the existing cPanel media size and usage. R2's published free allowance is 10 GB-month storage, 1 million Class A requests, and 10 million Class B requests monthly; usage above the allowance is billable. Add server-side object-size, object-count/total-storage, and upload-rate guards plus account alerts. When the safe free budget is reached, reject new uploads with a clear admin message. Do not assume that low visitor counts alone cap storage or operation charges.
- **Static assets:** ship app code/brand assets as Worker static assets where possible. Those requests are documented as free and unlimited; SSR/API Worker invocations are not. Use content-hashed filenames and immutable caching for static build assets.
- **Email:** preserve existing user-facing flows, but select a provider/approach only after verifying a no-cost transactional email option and its current limits. Never assume PHP mail behavior transfers to Workers.

Cloudflare currently documents D1 Free limits of 5 million rows read/day, 100,000 rows written/day, 5 GB account storage, and 500 MB per database; the free Worker request limit is 100,000/day with 10 ms CPU per invocation. D1 can return errors after free daily limits are exceeded. R2 overages can incur charges, so R2 guardrails are a hard release requirement. Recheck all pricing and quotas before creating resources because limits can change.

### AI worker boundary

No code or configuration in `workers/ai-worker/` is to be modified as part of the site migration. For an AI migration, create a new parallel Worker (for example, a new `workers/ai-worker-v2/` project) using only JavaScript, with independent dev secrets and its own staging URL. First route staging website chat to the new Worker. Only after functional/security/cost validation and explicit user approval may the live AI endpoint be switched; keep the old Worker deployment and route available for rollback. Do not perform a same-domain route swap as part of ordinary frontend/backend work.

## Options considered

| Option | Advantages | Tradeoffs | Recommendation |
|---|---|---|---|
| Keep current Vite SPA, replace only PHP API with a Worker | Smallest first change; browser code remains familiar | Does not solve empty initial HTML or delay of page content for crawlers/first paint | Use only as a temporary parity bridge or if SSR spike fails. |
| TanStack Start full-stack app on Workers | Reuses React/TanStack direction; supported SSR/prerender; one deployment surface can serve static assets, routes, and API | Framework migration effort; must validate Worker runtime compatibility and stay within SSR request budget | **Recommended.** |
| Rebuild public site in a static-first framework and retain a separate admin app | Strong static performance for public pages | Two app surfaces, duplicated design/data integration, and a broader rebuild of the current routes | Keep as fallback if Start SSR/runtime constraints prove unsuitable. |

## Decisions to settle before implementation

- Confirm the new app directory and whether site/API handlers ship in one Worker or two. The recommendation is one Start Worker with `/api/*` handlers unless the runtime spike shows a clear reason to split.
- Decide the authentication model, password-hash compatibility, refresh-token behavior, session storage, cookie/CSRF policy, and whether existing admin users keep passwords or perform resets. Do not carry over localStorage JWT behavior by accident.
- Verify the current email flows, sender/domain setup, invitation/password reset behavior, and free-tier provider limits.
- Inventory and size current media/PDFs; determine whether the R2 allowance can hold the initial library plus safe headroom. If not, zero-cost hosting needs an explicit alternate media strategy.
- Set numeric usage budgets below Workers, D1, and R2 free limits and specify the behavior when a budget is approached.
- Confirm public URL and slug/redirect inventory, canonical host (www vs apex), sitemap routes, analytics/consent requirements, and eventual cutover procedure.
- Decide whether a sanitized data snapshot is needed after synthetic data testing. Never use real personal data in staging without explicit approval, sanitization, and access control.

## Current platform references

- [Cloudflare TanStack Start guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/)
- [Workers and D1 pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [D1 limits and storage behavior](https://developers.cloudflare.com/d1/platform/limits/)
- [D1 import/export: MySQL is not directly importable](https://developers.cloudflare.com/d1/best-practices/import-export-data/)
- [Workers static asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [R2 free allowance and overage pricing](https://developers.cloudflare.com/r2/pricing/)

