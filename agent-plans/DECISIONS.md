# Decision Register

This is the durable record of decisions that affect migration work. It is append-only: if a decision changes, add a new entry that supersedes the old one. Statuses distinguish user-approved constraints from recommendations that still need validation.

## Accepted decisions

### ADR-001 — Keep hosting at zero monthly cost

- **Status:** Accepted by user; hard constraint.
- **Recorded:** 2026-10-17.
- **Decision:** Do not enable paid plans, paid services, or usage that incurs charges. Typical traffic is a few hundred visitors, but plans must still account for free-tier caps and storage/operation overages.
- **Consequences:** Measure expected usage, set budgets/alerts and hard upload guards, and gracefully stop/degrade optional operations before a billable overage. If the free capacity cannot meet requirements, pause and bring options back to the user; never enable billing to bypass a quota.
- **Source:** User response to the hosting-cost question; see migration plan history.

### ADR-002 — JavaScript only; no TypeScript

- **Status:** Accepted by user; hard constraint.
- **Recorded:** 2026-10-17.
- **Decision:** Project-authored migration code uses JavaScript/JSX. Do not add `.ts` or `.tsx` files.
- **Consequences:** Validate package and framework support for JavaScript. Cloudflare Workers run on the Workers runtime with a supported subset of Node.js APIs; this is not a general-purpose Node.js server. Prove compatibility before selecting dependencies.

### ADR-003 — Validate TanStack Start on Cloudflare Workers for SSR

- **Status:** Accepted for planning; technical validation still required.
- **Recorded:** 2026-10-17.
- **Decision:** Use TanStack Start with the Cloudflare Vite plugin as the leading option because the existing React/TanStack frontend can be evolved toward SSR/prerendering. Use D1 for relational data and R2 as the candidate for admin-managed media, subject to capacity and no-cost guards.
- **Consequences:** MySQL-specific schema and queries require SQLite/D1 redesign; MySQL dumps cannot be directly imported. Verify Workers Node compatibility and free plan request/query limits before implementation.
- **Alternatives considered:** Retain Vite SPA and migrate only the API (does not address initial HTML); replace public site with a static-first framework (broader rebuild).
- **Supersedes:** None.

### ADR-004 — Isolate staging from production data and writes

- **Status:** Accepted by user.
- **Recorded:** 2026-10-17.
- **Decision:** Keep the cPanel site and production MySQL live and authoritative during staging. Start staging with synthetic/sample records. Do not connect staging to production or allow staging writes to reach production. A sanitized snapshot is optional only with explicit approval.
- **Consequences:** Any later migration/import requires a safe export, sanitization decision, reconciliation, and tested rollback.

### ADR-005 — Preserve the current AI Worker

- **Status:** Accepted by user; hard boundary.
- **Recorded:** 2026-10-17.
- **Decision:** Do not modify, redeploy, rename, or change routes/secrets for `workers/ai-worker`. If AI migration is needed, create a new parallel Worker with independent config/secrets and a staging endpoint.
- **Consequences:** Keep current production chatbot operational until a separate, explicitly approved endpoint cutover with a rollback plan.

### ADR-006 — Migration work stays on `Website-migration`

- **Status:** Accepted by user; hard boundary.
- **Recorded:** 2026-10-17.
- **Decision:** Commit and push migration-related changes only to `Website-migration`; never to `main`.
- **Consequences:** Confirm branch and working-tree status before changes or publishing.

### ADR-007 — Track work in repository Markdown for cross-session continuity

- **Status:** Accepted by user.
- **Recorded:** 2026-10-17.
- **Decision:** Use root `AGENTS.md`, `agent-plans/PROJECT-STATE.md`, `agent-plans/DECISIONS.md`, and `agent-plans/CHANGELOG.md`, linked from the agent-plans index.
- **Consequences:** Every new agent/session reads the handoff material and verifies actual Git state; decisions and completed work are recorded without relying on chat history.

### ADR-008 — Keep the replacement staging app isolated from the existing Vite/PHP app

- **Status:** Accepted by user for the first staging design slice; implementation remains separately authorized.
- **Recorded:** 2026-10-17.
- **Decision:** Plan a separate JavaScript/JSX application at `apps/staging-web/`. Do not alter the root Vite app, whose development configuration proxies to the existing PHP API.
- **Consequences:** The replacement can use synthetic fixtures without a production dependency. Adding the directory, packages, Worker configuration, or deployment remains a later implementation task.

### ADR-009 — Define successor public URLs independently; do not change the live domain now

- **Status:** Accepted by user for successor design.
- **Recorded:** 2026-10-17.
- **Decision:** The future staging/replacement app uses an environment-configured canonical origin, trailing-slash canonical public routes, no filtered-query URLs in its sitemap, and a real HTTP 404 response. The apex host is the intended production target only at a separately approved cutover; live hostname, redirects, and DNS remain untouched now.
- **Consequences:** The staging app can test its own correct URL behavior without changing the presently inconsistent live behavior. A complete redirect map remains required before cutover.

### ADR-010 — Use a server-session/RBAC boundary for the later admin slice; defer email and password migration

- **Status:** Accepted by user for successor design.
- **Recorded:** 2026-10-17.
- **Decision:** Later admin work will target Secure, HttpOnly, SameSite server sessions with CSRF validation and initial Admin/Content Manager roles. Use synthetic development accounts. Defer transactional email, production password migration/reset policy, and provider selection to production readiness.
- **Consequences:** The first public staging slice does not need email or production credentials. A detailed RBAC matrix and implementation review remain required before auth code.

### ADR-011 — Do not create a legacy frontend-to-successor API compatibility layer

- **Status:** Accepted by user.
- **Recorded:** 2026-10-17.
- **Decision:** Keep the legacy cPanel site operational and build the successor independently; do not require the old frontend to call a new API.
- **Consequences:** Compatibility is handled through a later cutover/redirect plan, not a duplicate API bridge.

### ADR-012 — Keep migration code JavaScript-first with a TanStack-generated TypeScript exception

- **Status:** Accepted by user on 2026-10-17; narrow exception only.
- **Recorded:** 2026-10-17.
- **Decision:** Keep handwritten application and business logic in JavaScript/JSX. Permit TypeScript only for TanStack-generated route-tree/type-registration files when required by the framework; do not convert the broader application to TypeScript or use TanStack throughout unrelated code.
- **Consequences:** Supersedes ADR-002 only to this limited extent. Generated TypeScript artifacts should normally remain untracked. Reassess the exception if the framework no longer requires them.
- **Source:** User feedback on the SSR-spike compatibility issue.

### ADR-013 — Property public-read contract design direction

- **Status:** Accepted for contract design only; implementation not approved.
- **Recorded:** 2026-10-18.
- **Decision:** Design the successor property public-read API around minimal page-consumed public fields, `/api/v1`, slug-only detail lookup, stable taxonomy slugs (IDs remain internal), newest-first bounded cursor pagination with a stable tie-breaker, and short public caching invalidated on publish/update. Public property media reads include non-hidden images in position order with one explicit thumbnail and no internal storage keys. Prices are whole PKR rupees with no lakh/crore scaling; area values are interpreted in their accompanying stored unit with no API conversion.
- **Consequences:** These preferences constrain the proposal only; they do not approve routes, code, data stores, Cloudflare resources, a live-site change, or deployment. Safe defaults for pagination and cache duration/mechanism remain proposals pending synthetic validation and runtime/free-budget checks. Video visibility, description sanitization, redirect/canonical behavior, and price-period/null semantics remain open. The candidate field allowlist is derived from consumer review and still needs final verification.
- **Source:** User-selected options in the 2026-10-18 public-property contract questionnaire and explicit clarification of price and area semantics.

### ADR-014 — Property video, rich text, pagination bounds, and freshness

- **Status:** Accepted by user for contract design only; implementation not approved.
- **Recorded:** 2026-10-18.
- **Decision:** Public property detail may show an attached video only when both the property and video are explicitly public. Long descriptions may preserve formatting only through server-side sanitization against an explicit safe HTML allowlist; raw unsanitized HTML must not be rendered. Public property listing uses cursor pagination with default page size 20 and maximum 50. Published/updated property content must be immediately current; no stale response is acceptable.
- **Consequences:** Supersedes the pagination-bound and cache/freshness open points in ADR-013. Until a reliable immediate invalidation mechanism is verified within the zero-monthly-cost constraint, bypass shared caching for the property API. A cache must not use stale-while-revalidate or an unexpired fallback that violates the freshness requirement. The exact HTML tag/attribute allowlist and sanitizer implementation require security review before coding; synthetic tests must verify ordering, bounds, and freshness. This design decision does not authorize implementation, provisioning, deployment, or production changes.
- **Source:** User-selected options in the 2026-10-18 property contract follow-up questionnaire.

## Proposed or pending decisions

- Whether successor `/api/*` handlers ship in the same Worker as SSR is pending the JavaScript runtime spike.
- D1/R2 are the leading storage candidates, not permission to provision them. Real media volume and free quota guard design must be reviewed first.
- The detailed RBAC matrix, password migration, and whether password resets are required remain open.
- Email delivery provider and current free limits remain open.
- Production hostname, redirect map, DNS/cutover timing, and stabilization window remain open and require explicit release approval.
- A sanitized production snapshot is not approved.

### ADR-015 — Property freshness without stale responses (proposed)

- **Status:** Proposed by the assistant; not user-approved.
- **Recorded:** 2026-10-18.
- **Proposal:** Prefer `Cache-Control: no-cache, must-revalidate` and an ETag/version validator over `no-store`, if the validator synchronously detects every committed public-content change. Unchanged content may return `304` after revalidation; changed content returns `200`. This can preserve a body to reduce transfer but does not avoid the Worker request and may still require a cheap current-version/data check. If the guarantee cannot be validated, use `no-store` for the dynamic property response. Keep fingerprinted static assets independently cacheable.
- **Consequences:** Do not enable Cloudflare Workers Cache without confirming the standard-request quota effect; current Cloudflare docs state cache hits and normally-free static asset requests count at the standard Workers request rate when Workers Cache is enabled. The proposal preserves ADR-014's no-stale requirement and is not implementation authorization.

### ADR-016 — Implement an isolated synthetic public-property API prototype

- **Status:** Accepted by the user on 2026-10-18 for local implementation and synthetic testing only.
- **Decision:** Implement the bounded `/api/v1/properties` list and slug-detail prototype inside `apps/ssr-spike/`, using fabricated fixtures only. The initial slice covers public visibility, taxonomy filters, bounded cursor pagination, safe media projection, sanitizer behavior, and ETag mandatory revalidation. Property freshness means the next navigation/refetch is current; no push/poll is required in this slice.
- **Boundaries:** No D1/R2 or other Cloudflare resources, production data/credentials/domain, deployment, production DNS, cPanel/MySQL, or `workers/ai-worker` changes. This does not approve production persistence, admin writes, upload handling, or deployment.
- **Consequences:** Keep the prototype clearly synthetic. Before replacing fixtures with a store, validate the version/ETag against committed writes and review sanitizer behavior and free-tier request/CPU budgets. Shared Workers Cache remains disabled.
- **Source:** User's explicit “go ahead” following the distinction between refining design and separately authorizing API implementation, plus the clarification that next request/refetch freshness is sufficient.

### ADR-017 — Separate property HTTP contract from its data source

- **Status:** Accepted by the user on 2026-10-18 for a local JavaScript adapter using synthetic data.
- **Decision:** Keep HTTP validation, public-field projection, sanitization, and ETags in the property API layer. Read taxonomy membership, list/filter/order/page, and slug detail through a repository interface. The current adapter is in-memory and synthetic; D1 is a possible future implementation of the interface, not authorized by this decision.
- **Boundaries:** No D1/R2 binding or resource, production data, cPanel/MySQL connection, Cloudflare deployment, DNS, or live-site change.
- **Consequences:** Preserve identical API behavior when adding later adapters; test adapter semantics with synthetic fixtures, especially ordering, cursor continuation, publication visibility, and current reads.
- **Source:** User approved the proposed JavaScript repository interface and synthetic in-memory implementation.

### ADR-018 — Complete local homepage and existing static-page parity slice

- **Status:** Accepted by the user on 2026-10-18 for local implementation only.
- **Decision:** Reuse existing repository components/content to complete the staging homepage and recreate existing static informational pages (About, Contact, Privacy Policy) in `apps/staging-web/`. Keep dynamic listing/media sections visibly synthetic or deferred. The repository has no Terms page/route to migrate in this slice.
- **Boundaries:** Contact form remains local presentation-only and must not transmit or store values. Do not connect staging to production APIs/data, add media storage, change the cPanel site, provision Cloudflare resources, or deploy/push as part of this decision.
- **Consequences:** Continue dynamic listing/detail implementation as a separate next slice using synthetic staged API data; match the checked-in design/components and keep noindex staging metadata until a separately approved release.
- **Source:** User approved completing the whole homepage and all existing static pages, with dynamic pages deferred to the following task.

### ADR-019 — Connect staging property listing/detail pages to the synthetic API

- **Status:** Accepted by the user on 2026-10-18 for isolated local implementation.
- **Decision:** Add JavaScript TanStack Start listing and slug-detail routes in `apps/staging-web/`, reading only the existing public synthetic property API through server-side GET server functions. Keep the visual structure aligned with the current source homepage and use only a clearly labeled local image placeholder; media storage remains deferred. Complete the source-style footer, while keeping email collection and sending disabled.
- **Boundaries:** No production API/data, cPanel/MySQL, Cloudflare resource, deployment, DNS, `workers/ai-worker`, or live-site change. No email form submission. Do not commit or push without an explicit request.
- **Consequences:** The current synthetic API contains Homes/Houses examples only; other homepage categories must be shown as not yet populated, not represented by fabricated API results. Non-success or redirected API responses fail closed to the staging unavailable state. Revisit only when the synthetic API adds those categories.
- **Source:** User approved the next dynamic listing/detail slice using synthetic staged API data and reminded that the full website footer must be included.

### ADR-020 — Keep the staging dashboard to two synthetic Admin accounts

- **Status:** Accepted by the user on 2026-10-18 for local synthetic implementation.
- **Decision:** The staging dashboard has exactly two synthetic accounts and one hardcoded role, `Admin`. Do not reproduce the legacy role catalog, role editor, invitation flow, or general user CRUD. Keep credentials local-only and out of source, Git history, plans, logs, and any deployment configuration.
- **Boundaries:** This does not approve production credential/password migration, email delivery, Cloudflare resource provisioning, deployment, or access to production systems. Production authentication and account provisioning remain a separate release-readiness task.
- **Consequences:** Keep one server-side authorization check for every protected dashboard API; frontend route guards are presentation behavior only. Local session persistence is not a deployable implementation.
- **Supersedes:** The initial Admin/Content Manager role sketch in ADR-010; this single-role decision is the accepted model for staging.
- **Source:** User instruction that only two users manage the dashboard and both can share a simple hardcoded Admin role.

### ADR-021 — Use a repository seam for the synthetic dashboard data

- **Status:** Accepted direction for local staging implementation; no persistent store authorized.
- **Decision:** Use deterministic synthetic in-memory repositories behind versioned API contracts for the first dashboard slice. Keep the route/API projection separate from storage so a later Cloudflare D1 adapter can replace the in-memory adapter without changing the frontend contracts. Keep object/media storage as a separate future R2 adapter decision.
- **Boundaries:** No local/remote database binding, D1/R2 resource, Cloudflare deployment, production data, or live-site change. In-memory edits are temporary and are explicitly not suitable for a deployed multi-user dashboard.
- **Consequences:** Before any deployment, replace the in-memory repository and session adapter with durable, approved stores, check free-tier limits/usage guards, and rotate all credentials. The two local synthetic accounts must never be enabled on a public endpoint.
- **Source:** User asked to select the approach that best supports a fast later Cloudflare-storage transition after the assistant recommended an adapter seam.

### ADR-022 — Add full synthetic label management to Property and File forms

- **Status:** Accepted by the user on 2026-10-18 for local synthetic implementation.
- **Decision:** Implement protected admin label listing, creation, badge-visibility updates, and global deletion for the staging Property/File forms. Generate stable unique slugs from names; keep label assignments ordered per property/file. Global deletion removes that slug from all synthetic Property and File assignments. Public property responses expose only `slug`, `name`, and `isBadge`; badge metadata is resolved from the current synthetic label registry on each request.
- **Boundaries:** Synthetic in-memory data only. No production records, database/storage binding, media operation, Cloudflare provisioning/deployment, DNS, cPanel/MySQL, or `workers/ai-worker` changes. Edits remain process-local and reset on API restart.
- **Consequences:** New label management behavior must remain protected by the existing Admin session and CSRF checks. Public projection must never include admin IDs, internal filter fields, or storage identifiers. Visual parity review remains separate from API acceptance tests.
- **Source:** User answered “Build full synthetic label management (Recommended)” to the proposed synthetic global label CRUD/badge visibility design.

### ADR-023 — Improve staging contrast, profile editing, and session convenience

- **Status:** Accepted by the user on 2026-10-18 for local synthetic staging only.
- **Decision:** Keep the existing visual layouts while correcting staging contrast problems. Port the source profile workflow with editable synthetic `name` and `bio`; keep email and the hardcoded Admin role read-only, and defer avatar upload/storage. Set staging session cookie/server expiration to seven days and allow separate concurrent sessions across browsers/devices; session state remains in memory and does not survive API restart.
- **Boundaries:** No production auth/account changes, deployment, storage provisioning, DNS, cPanel/MySQL, production data, or `workers/ai-worker` changes. This does not authorize durable sessions or a public staging auth endpoint.
- **Consequences:** Keep each login's independent session ID and CSRF token. Logout revokes only that session. The current in-memory cap remains 20 sessions globally; API restart/isolate loss signs all local users out. Before deployment, replace ephemeral sessions with an approved durable store and review cookie policy for the final domain.
- **Source:** User explicitly approved the proposed measured staging contrast pass, source-derived profile edit scope, and seven-day concurrent sessions.

### ADR-024 — Use local D1 for synthetic admin auth and profile persistence

- **Status:** Accepted by the user on 2026-10-18 after comparing local D1 with remote D1 implementation.
- **Decision:** Implement a local-only D1 binding (`remote: false`) for synthetic admin session hashes, login-throttle counters, and editable Profile name/bio. Keep seven-day independent concurrent sessions and the global cap of 20. Keep other property, label, calculator, query, landing-page, map, and file data in existing synthetic in-memory repositories for now. The local adapter/migrations should provide a direct path to later D1 repositories.
- **Supersedes:** The in-memory-only session/profile persistence portion of ADR-023 and the no-local-D1-binding boundary of ADR-021. Other ADR-021/023 decisions and boundaries remain unchanged.
- **Boundaries:** Local Wrangler D1 simulator only. No remote D1 provisioning, remote data, deployment, DNS, production MySQL/cPanel/site, credentials, or `workers/ai-worker` changes. Use synthetic values only.
- **Consequences:** Local database state is kept under ignored `.wrangler/state`; deleting that local state resets synthetic data. Remote usage needs separate approval, verified free-tier budgets, and usage guards. Profile avatar and email remain deferred; only the approved profile fields persist.
- **Source:** User approved proceeding with the recommended local-D1-first approach after requesting the pros and cons and alignment with the grand migration plan.

### ADR-025 — Persist the synthetic Property domain in local D1

- **Status:** Accepted by the user on 2026-10-18 by approving the recommended next local-D1 property CRUD slice.
- **Decision:** Move the synthetic Property repository behind the local D1 adapter for public filter/list/cursor/detail reads and protected admin list/create/update/publish/hide/delete operations. Keep the existing API validation, public allowlist/sanitizer, ETag behavior, and staging frontend contracts. Seed only the 58 fabricated fixtures through an explicit idempotent local-only command. When a synthetic label is deleted, remove its assignment from D1 property rows; the label registry and File label data remain in-memory for now.
- **Supersedes:** The property-record in-memory boundary in ADR-024 and the “current adapter is in-memory” implementation status in ADR-018. ADR-016's public API shape/freshness decisions and other ADR-024 boundaries remain unchanged.
- **Boundaries:** Wrangler local D1 only (`remote: false`), synthetic fixtures only. No remote D1 provisioning, deployment, production data/site/DNS/cPanel/MySQL, credentials, or `workers/ai-worker` changes. No media is uploaded or stored.
- **Consequences:** Local property rows survive local Worker restarts but remain isolated to this workstation. The query design uses indexed filter/sort columns and retains the full synthetic record in a JSON column for allowlisted projection/admin form mapping; remote schema/read/write budgets and representative query plans still require review. Label names/badge settings and non-property datasets remain volatile until separate slices migrate them.
- **Source:** User approved the recommendation to implement the local-D1 property CRUD adapter with synthetic records and publish/update freshness tests.

### ADR-026 — Persist synthetic Maps and Files in local D1

- **Status:** Accepted by the user on 2026-10-18 as the next local-D1 migration slice.
- **Decision:** Move synthetic Map/File records behind a JavaScript repository backed by the existing local D1 binding. Preserve public `/api/v1/maps` and `/api/v1/files` projections, filter behavior, and protected dashboard CRUD. Store city/society/phase references as stable slugs on the records, with indexed filter columns; do not expose internal storage fields publicly. Use idempotent synthetic seeds.
- **Boundaries:** Wrangler local D1 only (`remote: false`) and fabricated records. The standalone taxonomy catalogue/editor remains in-memory in this slice. No R2/media upload, remote storage provisioning, deployment, production data/site/DNS/cPanel/MySQL, credentials, or `workers/ai-worker` changes.
- **Consequences:** Map/File admin edits and publish/hide state now survive local Worker restarts and feed the public API from the same local rows. Label deletion also clears D1-backed File label assignments. Taxonomy CRUD/independent map assignments remain a follow-on; media remains disabled. Remote query/free-budget review is still required before any remote storage proposal.

### ADR-027 — Translate source text schema into D1 before expanding imports

- **Status:** Accepted by the user on 2026-10-18 for local synthetic implementation and future import compatibility.
- **Decision:** Translate the existing MySQL text-content schema into explicit SQLite/D1 tables using source table/column semantics, numeric IDs, slugs, nullable values, timestamps, visibility flags, and foreign-key behavior. API adapters may retain the current frontend response contract without making denormalized JSON the database source of truth. Exclude media tables and binary objects; keep legacy media-reference columns as text pending a separately designed object-key mapping.
- **Initial scope:** `categories`, `cities`, `societies`, `phases`, and `map_docs`; `map_docs.city_id`, `society_id`, and `phase_id` preserve the source `ON DELETE SET NULL` behavior. Existing Property and File prototype schemas are explicitly transitional and not yet import-ready. No production export/import is authorized by this decision.
- **Boundaries:** Synthetic data and local D1 only. No production data, remote D1, R2, deployment, DNS, cPanel/MySQL, or `workers/ai-worker` changes.
- **Consequences:** Future import tooling must preserve explicit numeric IDs and reconcile all foreign keys/unique slugs. Text-domain migrations must be reviewed against `docs/zalmimarketing-schema.sql`; media object paths/keys and any schema extensions remain separately documented. The current API/UI may use stable slugs while adapters map them to numeric IDs internally.
- **Source:** User direction that future export from the checked-in DB schema must import without issues, with media tables excluded for separate object storage.
- **Source:** User approved moving Maps/Files and their taxonomy relationships into local D1 with synthetic data.
