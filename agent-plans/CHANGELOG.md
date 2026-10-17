# Migration Work Log

Append one factual entry for each completed planning or implementation task. Include the related decision IDs, affected paths, verification actually performed, known risks, and Git reference where available. Do not put secrets or production personal data here. Git history remains authoritative for full diffs and exact commit IDs.

## 2026-10-17 — Initial inspection and migration roadmap

- **Type:** Inspection/planning.
- **Summary:** Reviewed repository structure, current architecture docs, MySQL/calculator SQL files, current public homepage, and a Chrome DevTools performance/SEO baseline. Wrote the inspection report, architecture direction, and phased roadmap. Preserved the user-provided schema files.
- **Decision records:** ADR-001 through ADR-006 (see `DECISIONS.md`).
- **Files:** `agent-plans/README.md`, `agent-plans/00-inspection-and-baseline.md`, `agent-plans/01-architecture-direction.md`, `agent-plans/02-grand-migration-roadmap.md`, `docs/zalmimarketing-schema.sql`, `docs/property_transfer_calculator_schema.sql`.
- **Verification:** `git diff --check`; read-only repository/schema inspection; live homepage DevTools traces and mobile Lighthouse audit. No application tests were run; no code was changed.
- **Git references:** `cebb633` (plan and schema references), `b14265a` (Markdown formatting cleanup), on `Website-migration`.
- **Risk/follow-up:** Credentials in project configuration and previous history need rotation before deployment; do not include values in this log. No Cloudflare resources or production data were changed.

## 2026-10-17 — Add session/agent continuity process

- **Type:** Documentation/process design.
- **Summary:** After user approval, added a stable agent working agreement, a current state checkpoint, an append-only decision register, and an append-only migration work log. Linked the handoff procedure from the agent-plans index.
- **Decision records:** ADR-007; reaffirmed ADR-001 through ADR-006.
- **Files:** `AGENTS.md`, `agent-plans/README.md`, `agent-plans/PROJECT-STATE.md`, `agent-plans/DECISIONS.md`, `agent-plans/CHANGELOG.md`.
- **Verification:** Review document consistency and links; run `git diff --check`; verify branch and status before publishing.
- **Git reference:** This changeset is recorded in Git history on `Website-migration`; verify exact HEAD with `git log`.
- **Risk/follow-up:** This adds no application code or Cloudflare configuration. Reconcile the state file after each subsequent task.

## 2026-10-17 — Record Phase 1 route/API/data discovery inventory

- **Type:** Inspection/planning.
- **Summary:** Derived the current client route surface, PHP API resources, source-table domains, and remaining contract gaps from the repository. Documented safe owner-provided inventory inputs and live-site verification still required before any migration implementation or Cloudflare provisioning.
- **Decision records:** Reaffirmed ADR-001 through ADR-006; no new decision was made or approved.
- **Files:** `agent-plans/03-route-api-data-inventory.md`, `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`.
- **Verification:** Confirmed `Website-migration` branch, clean starting worktree, current HEAD `97d892b`; inspected route tree, frontend API consumers, PHP front controller/handlers, and checked-in SQL definitions; `git diff --check`. No production system, production data, Cloudflare resource, or AI Worker was changed.
- **Risk/follow-up:** The inventory is repository-derived, not a verified production contract. Credential rotation, aggregate production/media inventory, live URL/redirect verification, and handler-level response/auth review remain required.

## 2026-10-17 — Verify local Cloudflare authentication

- **Type:** Environment verification.
- **Summary:** Performed a read-only local `wrangler whoami` check and confirmed an authenticated Cloudflare session is available for the intended account. Deliberately omitted account identity, token details, and credential paths.
- **Decision records:** Reaffirmed ADR-001, ADR-004, ADR-005, and ADR-006; authentication verification does not authorize Cloudflare provisioning, deployment, production routing, or edits to the existing AI Worker.
- **Files:** `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`.
- **Verification:** Wrangler 4.131.1 `whoami` completed successfully outside the workspace sandbox. No Cloudflare resource, deployment, DNS setting, secret, database, bucket, or Worker was changed.
- **Risk/follow-up:** Read-only account-plan/billing review and user approval of a resource layout/free-budget guard design remain required before any Cloudflare provisioning.

## 2026-10-17 — Record handler-level API contract inventory

- **Type:** Inspection/planning.
- **Summary:** Reviewed the PHP front controller and handlers to record observed methods, access behavior, action subpaths, media/auth/calculator concerns, and contract gaps for the successor API. Added no API code and did not contact production.
- **Decision records:** Reaffirmed ADR-002, ADR-004, and ADR-005. No API, authentication, storage, email, or AI replacement decision was approved.
- **Files:** `agent-plans/04-handler-contract-inventory.md`, `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`.
- **Verification:** Static review of `api/index.php`, API handlers, frontend consumers, and supplied SQL; `git diff --check`. No production system, Cloudflare resource, deployment, or AI Worker was changed.
- **Risk/follow-up:** Live URL behavior and actual response contracts remain unverified. The next safe step is owner-provided aggregate inventory plus approved per-domain contracts, not implementation.

## 2026-10-17 — Record initial live public URL observations

- **Type:** Read-only production observation.
- **Summary:** Used an isolated browser session to inspect the live homepage and record public route patterns, slug-shaped property links, query-parameter usage, legacy media/PDF paths, and the observed apex/`www` canonical-host mismatch. Did not interact with a form or authenticated route.
- **Decision records:** No new decision was approved. Canonical host, redirect behavior, and URL compatibility remain open migration decisions.
- **Files:** `agent-plans/05-live-url-observations.md`, `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`.
- **Verification:** Read-only live homepage navigation and DOM metadata/link inspection in an isolated browser context; `git diff --check`. No production content, data, DNS, Cloudflare resource, or AI Worker was changed.
- **Risk/follow-up:** The observation does not verify robots, sitemap, redirect chains, 404s, or non-homepage pages; complete the documented read-only URL test sheet before treating the list as a redirect contract.

## 2026-10-17 — Complete safe public crawler checks and draft proposed domain contracts

- **Type:** Read-only production observation and planning.
- **Summary:** Recorded secret-safe owner actions for credential rotation and aggregate-only production/media reporting; drafted proposed per-domain data/API/auth contracts without approving an implementation. Public GET checks confirmed HTTP-to-HTTPS redirects, `robots.txt`, a 31-URL apex sitemap, primary public routes, duplicate HTTPS apex/`www` accessibility, trailing-slash duplication, and an SPA-shell `200` for an intentionally missing path.
- **Decision records:** Reaffirmed ADR-001 through ADR-006. No new decision was made or approved; canonical hostname, 404/redirect policy, auth/RBAC, email, media limits, calculator rules, and legacy API compatibility remain pending.
- **Files:** `agent-plans/05-live-url-observations.md`, `agent-plans/06-phase-0-1-owner-actions-and-proposed-contracts.md`, `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`.
- **Verification:** Confirmed `Website-migration` and baseline HEAD `2385b76` with a clean starting worktree; used public GET retrievals only; static review of repository API/frontend/schema inventories. Attempted required read-only `wrangler whoami`, but `wrangler` was not resolvable in this terminal, so no Cloudflare action was taken. No production data, cPanel setting, DNS record, Cloudflare resource, deployment, or AI Worker was changed.
- **Risk/follow-up:** Owner action is required for rotation status and aggregate report. Do not implement or provision until the documented pending decisions receive explicit approval.

## 2026-10-17 — Complete rendered sitemap canonical verification

- **Type:** Read-only production observation.
- **Summary:** In an isolated browser context, verified all 31 public sitemap URLs return `200` on the apex host and recorded their rendered metadata. The sitemap's no-slash forms conflict with rendered trailing-slash canonicals for listing, map, file, all 18 property-detail, and six category-query URLs; About and Contact have no rendered canonical. An unknown route renders a client-side 404 but still has HTTP `200`.
- **Decision records:** No new decision was made or approved. Canonical hostname, slash/query policy, sitemap composition, and HTTP 404 behavior remain pending release decisions.
- **Files:** `agent-plans/05-live-url-observations.md`, `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`.
- **Verification:** Public browser navigation and read-only DOM metadata inspection only, in an isolated context; no console errors were observed during the sitemap audit. No form, authenticated route, cookie, storage value, API mutation, production data, cPanel setting, DNS record, Cloudflare resource, deployment, or AI Worker was accessed or changed.
- **Risk/follow-up:** Browser-rendered metadata does not meet the successor SSR/prerender requirement by itself. Obtain the documented URL-policy decision before implementing redirects, metadata, sitemap, or not-found behavior.

## 2026-10-17 — Record isolated staging-web design and approved directions

- **Type:** Architecture/design documentation.
- **Summary:** Recorded the user-approved first-slice direction: a separate JavaScript/JSX `apps/staging-web/` app using synthetic fixtures; successor trailing-slash canonical routes, filtered-query sitemap exclusion, real HTTP 404 behavior, future server-session/RBAC boundary, deferred email/password migration, and no legacy frontend-to-successor API bridge. Wrote a reviewable design document and intentionally did not create application code.
- **Decision records:** ADR-008 through ADR-011; reaffirmed ADR-001 through ADR-006.
- **Files:** `docs/superpowers/specs/2026-10-17-isolated-staging-web-design.md`, `agent-plans/DECISIONS.md`, `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`.
- **Verification:** Read repository Vite configuration, package manifest, route layout, prior inventory/design records, and `git diff --check`. No app directory, runtime dependency, Cloudflare resource, deployment, cPanel setting, production data, DNS record, PHP handler, or AI Worker was changed.
- **Risk/follow-up:** The design must be reviewed by the user before creating an implementation plan or code. Email, production password migration, full RBAC, storage guard values, calculator rules, and cutover remain deferred.

## 2026-10-17 — Implement isolated synthetic public staging slice

- **Type:** Local application implementation.
- **Summary:** Added `apps/staging-web/`, an independent JavaScript/JSX Vite + React public staging application. It has synthetic fixture/repository modules, Home, Properties/filter, Property Detail, Maps, Files, Calculator-information, and rendered not-found views; trailing-slash canonical routing behavior; static robots, sitemap, and host-compatible `404.html` artifacts. The root Vite/PHP app was not modified.
- **Decision records:** Implemented the first-slice direction in ADR-008 through ADR-011. No Cloudflare, storage, auth, email, calculator, or cutover decision was made.
- **Files:** `apps/staging-web/**`, `agent-plans/07-isolated-staging-web-implementation-plan.md`, `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`.
- **Verification:** Static inspection confirmed JavaScript/JSX-only staging source and no production-origin/database/credential pattern. A portable, ignored Node toolchain supplied local dependencies; the staging production build completed successfully. Isolated-browser checks passed for Home, filtered Properties, Property Detail, Maps, and rendered not-found metadata; the mobile accessibility tree includes a skip link, labelled navigation, logical headings, and useful links; no browser console errors/warnings were observed. `robots.txt` and the eight-entry sitemap were retrieved locally; sitemap `<loc>` values contain no query URLs. `git diff --check` passed.
- **Risk/follow-up:** The local Vite SPA returns HTTP `200` with rendered not-found content for unknown routes; a future Worker/host runtime must return the actual HTTP `404` status. No deployment or Cloudflare resource was created.

## 2026-10-17 — Validate isolated TanStack Start SSR in local Workers runtime

- **Type:** Local runtime feasibility spike.
- **Summary:** Added `apps/ssr-spike/`, a separate JavaScript/JSX TanStack Start app using the Cloudflare Vite plugin and local `workerd`, with fabricated homepage/property fixtures, route-specific metadata, and explicit noindex metadata. Config contains no bindings, secrets, production routes, or deploy script. A repeatable smoke script verifies initial HTML and actual response statuses.
- **Decision records:** No architecture decision was newly approved. The same-Worker API question, resource layout, cost guards, and production scaffold remain open.
- **Files:** `apps/ssr-spike/**`, `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`.
- **Verification:** Required `wrangler whoami` succeeded through the portable Node/npm toolchain with identity output suppressed. `npm run build` completed (Wrangler emitted a non-fatal debug-log-directory permission warning). Local requests returned `200` with expected metadata/content for home and a synthetic property, and true `404` for an unknown path and unknown property slug; all smoke assertions passed. Authored app files are JavaScript/JSX/JSONC only; no `.ts`/`.tsx` files or trailing whitespace were found. `git diff --check` passed (Git emitted only LF-to-CRLF normalization notices for the two tracking Markdown files).
- **Risk/follow-up:** TanStack Start's generated `.js` route tree currently includes a type-only module-registration footer despite type generation being disabled; the spike uses a Vite pre-transform to remove it. Resolve this compatibility issue before treating the stack as a production scaffold. No Cloudflare resources, deployment, DNS, cPanel/PHP, production data, or `workers/ai-worker` were changed.

## 2026-10-17 — Resolve JavaScript-first route-tree and local Wrangler workflow

- **Type:** Tooling and compatibility update following user feedback.
- **Summary:** Kept authored app logic in JavaScript/JSX while permitting only TanStack's generated route-tree TypeScript file (ADR-012 supersedes ADR-002 narrowly). Configured generation to `src/routeTree.gen.ts`, removed the Vite type-stripping shim, added a repo-local `cf:whoami` command, and wrapped Vite so generated Wrangler config/log files stay under an ignored app directory. Corrected the stale state-file claim that no application implementation had occurred.
- **Decision records:** Added accepted ADR-012 from user feedback. No deployment, resource, DNS, route, data, or production change was approved or performed.
- **Files:** `AGENTS.md`, `agent-plans/DECISIONS.md`, `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`, `apps/ssr-spike/**`.
- **Verification:** `npm run build` passed without the former Wrangler log-directory warning. `npm run cf:whoami` passed with all account identity output suppressed when run with access to the authenticated profile. Local dev server SSR smoke checks passed for homepage and synthetic property (`200` with expected initial HTML metadata/content) plus missing path and property (`404`). Authored spike files contain no TypeScript; the sole `.ts` file is TanStack-generated and Git-ignored. No trailing whitespace was found, and `git diff --check` passed (only LF-to-CRLF normalization notices remain).
- **Risk/follow-up:** Wrangler authenticated profile access in this managed terminal required elevated execution; local Vite loopback binding also required elevation under the sandbox. No live deploy was run; a specific Worker name/Workers.dev preview target and deployment approval are still needed.

## 2026-10-17 — Deploy isolated synthetic SSR preview

- **Type:** Explicitly approved staging deployment and read-only public verification.
- **Summary:** Deployed `apps/ssr-spike/` as `zalmi-ssr-spike-local` to its default Workers.dev URL: `https://zalmi-ssr-spike-local.thezalmimarkettingsajidmahmood.workers.dev`. The app serves synthetic homepage/property fixtures and a true HTTP 404 for unknown paths/fixture slugs.
- **Decision records:** Reaffirmed ADR-001, ADR-004, ADR-005, ADR-006, and ADR-012. No production domain, route, binding, data source, or DNS decision was made.
- **Files:** `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`; no application/config changes were needed for the deployment.
- **Verification:** Required read-only `wrangler whoami` succeeded with identity output suppressed; production build passed; Wrangler `deploy --dry-run` reported no bindings, a 918.05 KiB total upload (199.40 KiB gzip), and five asset files; deployment completed; public GET smoke checks returned `200` for `/` and `/properties/sample-residence/` and `404` for `/missing-route/` and `/properties/not-a-fixture/`. Checked current Cloudflare docs: Workers Free includes 100,000 requests/day by default; Workers Paid starts at $5/month. No paid plan setting was changed, but the account's current plan/billing state was not verified by the CLI.
- **Risk/follow-up:** This public preview contains synthetic content only and has no bindings or credentials. Per user direction, exposed legacy credentials are a production-deployment rotation gate, not a blocker for this isolated dev preview. Confirm account plan/billing status before additional hosted traffic; do not enable billing. Keep production cPanel/MySQL/DNS and `workers/ai-worker` unchanged.

## 2026-10-17 — Confirm Workers Free plan and add local synthetic health route

- **Type:** Read-only account plan verification and local API/runtime implementation.
- **Summary:** Verified in the selected Cloudflare account dashboard that Workers Free ($0/month) is the current plan. Added `GET /api/health` to the TanStack SSR spike, returning only a static synthetic status/environment payload with `Cache-Control: no-store`; explicit `ANY` handling rejects unsupported methods with `405` and `Allow: GET, HEAD`.
- **Decision records:** Reaffirmed ADR-001, ADR-004, ADR-005, ADR-006, and ADR-012. No new data/auth contract or production decision was approved.
- **Files:** `apps/ssr-spike/src/routes/api.health.js`, `apps/ssr-spike/scripts/smoke.js`, `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`.
- **Verification:** Required read-only `wrangler whoami` succeeded with identity output suppressed. Dashboard's Workers plans page marked Free as the current plan at $0/month; no billing settings were changed. Production build succeeded. Local smoke tests passed: homepage and synthetic property `200`; unknown route and fixture `404`; health GET `200` JSON/no-store; HEAD `200` with empty response body; POST `405` with the expected `Allow` header. Chrome DevTools confirmed the local health GET returned `200` with `application/json`, `Cache-Control: no-store`, and the expected synthetic body. A direct JSON-document browser navigation also triggered the browser's automatic `/favicon.ico` request, which returned `404`; this was unrelated to the health response. `git diff --check` passed (only LF-to-CRLF normalization notices).
- **Risk/follow-up:** This route is local-only; no redeploy occurred, so the published Workers.dev version does not expose it yet. The Free-plan check covers Workers pricing, not any other Cloudflare product or account-level purchases. No custom domain, binding, database, production data, DNS, cPanel, or AI Worker was touched.

## 2026-10-18 — Deploy synthetic health route to Workers.dev preview

- **Type:** Explicitly approved staging deployment and read-only public verification.
- **Summary:** Redeployed the latest `apps/ssr-spike/` build to the existing `zalmi-ssr-spike-local` Worker and its existing Workers.dev URL. The preview now includes the synthetic `GET /api/health` route.
- **Decision records:** No new architectural decision. The deployment stayed within ADR-001 (zero monthly cost), ADR-004 (production data isolation), ADR-005 (AI Worker unchanged), ADR-006 (migration branch), and ADR-012 (JavaScript-first with the generated TanStack exception).
- **Files:** `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`; no application or Worker configuration changes.
- **Verification:** Read-only `wrangler whoami` succeeded with identity output suppressed. Production build passed. `wrangler deploy --dry-run` reported no bindings and a 918.59 KiB upload (199.58 KiB gzip), with five client assets. Deployment completed as version `1b93c13c-445a-4360-96cc-e78af17425f0`. Public GET smoke tests returned `200` for `/`, `/properties/sample-residence/`, and `/api/health`; `404` for `/missing-route/` and `/properties/not-a-fixture/`. The health response had the expected synthetic JSON, JSON content type, and `Cache-Control: no-store`. Current Cloudflare docs confirm that `workers_dev` defaults to enabled when there are no route(s) in the config; the exact Workers.dev target was pre-approved.
- **Risk/follow-up:** The preview contains synthetic content only and has no bindings or credentials. No production hostname/routes, DNS, cPanel, production MySQL/data, billing setting, or `workers/ai-worker` was changed. Keep hosted traffic modest on the confirmed Free plan; no paid resources were provisioned.

## 2026-10-18 — Draft proposed public property read contract

- **Type:** Phase 1 repository-derived API contract proposal; design only.
- **Summary:** Added a first vertical slice proposal for public property listing and slug detail reads, including visibility rules, candidate filters, illustrative response shape, error/cache behavior, open questions, and proposed synthetic acceptance cases.
- **Decision records:** No change to `DECISIONS.md`; every new contract detail is explicitly labeled proposed and unapproved for implementation.
- **Files:** `agent-plans/06-phase-0-1-owner-actions-and-proposed-contracts.md`, `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`.
- **Evidence and verification:** Static review only of the checked-in route/API/data/handler inventories, property UI/API consumers, PHP property handler, and schema definition. No production requests, records, exports, Cloudflare operations, or application code changes. `git diff --check` passed; Git reported only LF-to-CRLF normalization notices for the edited Markdown files.
- **Risk/follow-up:** Field visibility, units/precision, taxonomy identifiers, slug/redirect policy, pagination/order, media visibility, and cache policy remain unresolved. Use synthetic fixtures to validate the proposal before implementation; do not connect staging to production.

## 2026-10-18 — Record property contract design preferences

- **Type:** User-approved contract design direction; no implementation authorization.
- **Summary:** Updated the property-read proposal with the user's selections: minimal public page-consumed fields; `/api/v1`; slug-only detail; stable taxonomy slugs; newest-first cursor pagination with a stable tie-breaker; short public caching with publish/update invalidation; and visible images ordered by position with one thumbnail and no internal storage keys.
- **Decision records:** Added ADR-013, explicitly scoped to contract design only. It does not approve code, routes, Cloudflare resources, deployment, or production changes.
- **Files:** `agent-plans/06-phase-0-1-owner-actions-and-proposed-contracts.md`, `agent-plans/DECISIONS.md`, `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`.
- **Evidence and verification:** User questionnaire selections; static repository review only. No production requests/data, Cloudflare operations, or application code changes. `git diff --check` passed; Git reported only LF-to-CRLF normalization notices for the edited Markdown files.
- **Risk/follow-up:** Await explicit clarification of currency/price scale and area semantics. Proposed pagination defaults, cache mechanics/TTL, full field allowlist, and video visibility need synthetic validation and further design. Existing production domain and data remain untouched.

## 2026-10-18 — Confirm property price and area semantics for proposal

- **Type:** User clarification recorded in the property contract design.
- **Summary:** Updated the illustrative contract to represent price as a decimal string in whole PKR rupees (no lakh/crore scaling), and area as the source value in its accompanying unit without API conversion.
- **Decision records:** Expanded ADR-013 with these design-only semantics; no implementation approval.
- **Files:** `agent-plans/06-phase-0-1-owner-actions-and-proposed-contracts.md`, `agent-plans/DECISIONS.md`, `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`.
- **Evidence and verification:** User clarification; checked-in schema unit enum and static code review only. No production records or requests, Cloudflare operations, or application code changes. `git diff --check` passed; Git reported only LF-to-CRLF normalization notices for the edited Markdown files.
- **Risk/follow-up:** Period/null behavior, video visibility, field allowlist, cache invalidation implementation/TTL, and pagination bounds remain open and proposal-only. The sample response values are synthetic illustrations.

## 2026-10-18 — Derive candidate public property fields from consumers

- **Type:** Read-only contract refinement from checked-in public UI usage.
- **Summary:** Added a candidate property list/detail field allowlist and flagged the current long-description HTML rendering for explicit sanitization policy. Documented that future inquiry submission should resolve the property by slug rather than exposing a database ID solely for a legacy form dependency. The user clarified the selected price and area semantics noted in ADR-013.
- **Decision records:** No new decision; the candidate allowlist and sanitization are proposals pending user review.
- **Files:** `agent-plans/06-phase-0-1-owner-actions-and-proposed-contracts.md`, `agent-plans/DECISIONS.md`, `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`.
- **Evidence and verification:** Static review of public property listing/detail routes and card components, plus user clarification of price and area meaning. No production requests/data, Cloudflare operations, or application code changes. `git diff --check` passed; Git reported only LF-to-CRLF normalization notices for the edited Markdown files.
- **Risk/follow-up:** Confirm video visibility, long-description plain-text versus sanitized HTML, page-size bounds, and maximum stale-content window. Cache invalidation feasibility must be checked against the selected runtime and zero-cost constraint.

## 2026-10-18 — Finalize property media, rich-text, pagination, and freshness preferences

- **Type:** User-approved property contract refinements; design only.
- **Summary:** Recorded that attached video is public only when both property and video are explicitly public; detailed descriptions preserve formatting only through server-side sanitization using an explicit safe HTML allowlist; listing pagination defaults to 20 and caps at 50; property changes must be immediately visible with no stale responses.
- **Decision records:** Added ADR-014, superseding only the relevant open points in ADR-013. No implementation, provisioning, deployment, or production change is authorized.
- **Files:** `agent-plans/06-phase-0-1-owner-actions-and-proposed-contracts.md`, `agent-plans/DECISIONS.md`, `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`.
- **Evidence and verification:** User questionnaire selections; static repository review only. No production requests/data, Cloudflare operations, or application code changes. `git diff --check` passed; Git reported only LF-to-CRLF normalization notices for the edited Markdown files.
- **Risk/follow-up:** Use no shared caching until a reliable immediate invalidation mechanism is verified within the no-cost constraint. Define/review the exact HTML allowlist and sanitizer before implementation. Validate cursor pagination, hidden/public media rules, and freshness with synthetic fixtures.

## 2026-10-18 — Specify synthetic property acceptance matrix and refine freshness strategy

- **Type:** Phase 1 contract validation design; no application implementation.
- **Summary:** Replaced broad property acceptance bullets with explicit synthetic cases for visibility, slug-only access, filters, cursor boundaries, media privacy/order, sanitized rich text, validators, freshness after publish/unpublish, and backend/version-check failure. Refined the cache proposal from `no-store` to `no-cache, must-revalidate` with an ETag/version check so a cache may reuse an unchanged body only after revalidation; no stale responses are allowed.
- **Decision records:** No new user decision. ADR-014's immediate-freshness requirement is unchanged; the validator/cache mechanism remains a technical proposal.
- **Files:** `agent-plans/06-phase-0-1-owner-actions-and-proposed-contracts.md`, `agent-plans/PROJECT-STATE.md`, `agent-plans/CHANGELOG.md`.
- **Evidence and verification:** Static contract review only; Cloudflare's current official docs on `Cache-Control`, Workers Cache invalidation, and Workers Cache pricing/quota behavior reviewed. No property API exists, so the listed cases are proposed and were not run. No production data, account actions, deployments, or application code changes. `git diff --check` passed; Git reported only LF-to-CRLF normalization notices for the edited Markdown files.
- **Risk/follow-up:** ETag generation still needs to cheaply observe current content/version and be tested; mandatory revalidation adds a Worker request and likely a data/version check on each use. Workers Cache request billing/quota impact must be verified before considering it. Already-open pages require a new request/refetch to update; real-time push/poll is not included.

## 2026-10-18 — Implement isolated synthetic public property API prototype

- **Type:** User-approved local implementation slice; synthetic data only.
- **Summary:** Added JavaScript TanStack Start GET routes for property list and slug detail under `/api/v1/properties`. Implemented visibility filtering, bounded cursor paging (20 default/50 max), supported filters, a public response allowlist, hidden-image removal/order/thumbnail selection, video dual-visibility checks, Workers HTMLRewriter sanitization, and `no-cache, must-revalidate` ETag handling with `304` on unchanged representations. User clarified that the next navigation/refetch must be current; no push/poll is required. Added direct synthetic behavior checks and local HTTP smoke coverage.
- **Decision records:** Added ADR-016 for the local synthetic implementation boundary. Existing API/data-store and Cloudflare resource decisions remain unapproved; no deployment or production integration is authorized.
- **Files:** `apps/ssr-spike/src/lib/property-api.js`, `apps/ssr-spike/src/lib/property-fixtures.js`, `apps/ssr-spike/src/routes/api.v1.properties.index.js`, `apps/ssr-spike/src/routes/api.v1.properties.$slug.js`, `apps/ssr-spike/scripts/test-property-api.js`, `apps/ssr-spike/scripts/smoke.js`, `apps/ssr-spike/package.json`, `agent-plans/06-phase-0-1-owner-actions-and-proposed-contracts.md`, `agent-plans/DECISIONS.md`, `agent-plans/PROJECT-STATE.md`, and `agent-plans/CHANGELOG.md`.
- **Evidence and verification:** Local synthetic property acceptance script passed; local HTTP smoke passed for SSR/404/health plus list/detail, hidden/file-only behavior, filter validation, cursor paging, 304 revalidation, media privacy/ordering, sanitizer removal of unsafe markup (including script/event handlers, unsafe schemes, and backslash URL handling), and internal-field exclusion. `node scripts/run-vite.js build` and `git diff --check` passed. No production requests/data, Cloudflare account actions, D1/R2 resources, deployment, or production changes.
- **Risk/follow-up:** This only tests static in-memory fixtures. Before any store integration, validate that reads/ETags observe each committed publish/update, review sanitizer allowlist, settle common API error conventions, and validate free-tier read/CPU budgets. No database, production content, or shared Workers Cache is connected. Changes remain uncommitted on `Website-migration`.

## 2026-10-18 — Isolate property API from its data source

- **Type:** User-approved local JavaScript implementation; synthetic in-memory data only.
- **Summary:** Added a property repository interface and synthetic in-memory adapter for taxonomy existence checks, public list/filter/order/cursor queries, and public slug lookup. Updated the API service and both route handlers to use the adapter so request/response policy stays separate from persistence.
- **Decision records:** Added ADR-017. A future D1 implementation remains a separate task; no database resource or binding was created.
- **Files:** `apps/ssr-spike/src/lib/property-repository.js`, `apps/ssr-spike/src/lib/property-api.js`, `apps/ssr-spike/src/routes/api.v1.properties.index.js`, `apps/ssr-spike/src/routes/api.v1.properties.$slug.js`, `apps/ssr-spike/scripts/test-property-api.js`, `agent-plans/DECISIONS.md`, `agent-plans/PROJECT-STATE.md`, and `agent-plans/CHANGELOG.md`.
- **Evidence and verification:** Synthetic property API acceptance checks, local HTTP smoke checks, `node scripts/run-vite.js build`, and final `git diff --check` passed after adapter extraction and subsequent homepage work. Local SSR dev preview remains available at `http://127.0.0.1:4175/`. No production access or Cloudflare action/resource/deployment occurred.
- **Risk/follow-up:** The adapter is not a D1 implementation; current fixtures cannot prove read-after-commit consistency or real query costs. Next user-requested work is homepage visual parity in the isolated staging frontend, using the existing public site only as a read-only design reference.

## 2026-10-18 — Start isolated homepage visual parity

- **Type:** User-approved visual implementation slice; local frontend, synthetic content.
- **Summary:** Reworked the staging homepage hero/header toward the existing site's repository-defined design: dark photographic overlay, gold-accented serif headline, three trust metrics, translucent search panel with Properties/Plot Files/Society Maps tabs, scroll cue, and navigation over the hero. Search submits only to local staging routes. Added clear staging/sample-data labels and responsive layouts.
- **Design source:** `src/components/home/HeroSection.jsx`, `src/components/home/Navbar.jsx`, and `src/content/pages/home.json`. The live public site was not consulted during this slice.
- **Files:** `apps/staging-web/src/App.jsx`, `apps/staging-web/src/styles.css`, `agent-plans/PROJECT-STATE.md`, and `agent-plans/CHANGELOG.md`.
- **Evidence and verification:** `node ./node_modules/vite/bin/vite.js build` passed for `apps/staging-web`; local preview returned HTTP `200`; browser screenshot and accessibility tree confirmed the hero heading, trust points, three search tabs, labeled search field, nav links, synthetic inventory and preview notice. The Society Maps tab interaction updated its selected state. `git diff --check` passed (Git emitted only LF-to-CRLF normalization notices). UI design search helper could not run because Python launchers are unavailable in the shell; review was made directly against source component/content files. A dedicated mobile-sized browser pass and console log review remain. No production data, PHP-backed root app, Cloudflare resource, deployment, DNS, or `workers/ai-worker` was accessed or changed.
- **Risk/follow-up:** Hero uses the same public Unsplash image URL referenced by the current source component; it requires external image loading in the browser. The current branded logo is represented as a text mark in staging pending selection of an approved local static asset. Continue with the homepage's source-backed lower sections after visual review; this hero slice is not full-site parity.

## 2026-10-18 — Match homepage typography and headline motion

- **Type:** User-approved isolated staging visual refinement.
- **Summary:** Replaced the Georgia/system approximation with the source Inter/Plus Jakarta Sans body and Playfair Display/Syne display stacks; matched the 800-weight display headline, source gold gradient and seven rotating headline phrases. Added the source 3-second rotation and 0.5-second vertical enter/exit animation. Added a pause/resume button, pause when keyboard focus enters the hero, and reduced-motion handling.
- **Files:** `apps/staging-web/index.html`, `apps/staging-web/src/App.jsx`, `apps/staging-web/src/styles.css`, `agent-plans/PROJECT-STATE.md`, and `agent-plans/CHANGELOG.md`.
- **Evidence and verification:** Staging Vite production build passed. Local browser screenshot confirmed the Playfair Display headline and gold phrase style; accessibility tree showed the labeled pause control, and clicking it changed its state to “Resume headline rotation.” Browser console query returned no warnings/errors. `git diff --check` passed (Git printed only LF-to-CRLF normalization notices). Reduced-motion timer branch was reviewed in source; browser media emulation was not available in the configured UI tools.
- **Risk/follow-up:** Fonts remain fetched from Google Fonts just as in the current root page; an offline preview will use fallbacks. Animation timing and phrase order match the source. Full homepage and other route parity remain incomplete. No production app/data, Cloudflare resource, deployment, DNS, or `workers/ai-worker` was changed.

## 2026-10-18 — Reuse source homepage hero in isolated Start frontend

- **Type:** User-approved local staging implementation; synthetic content only.
- **Summary:** Converted `apps/staging-web/` from its standalone Vite SPA entry to a separate TanStack Start frontend using the Cloudflare Vite plugin. The homepage imports the existing `src/components/home/HeroSection.jsx` directly and loads the root design-token/Tailwind stylesheet; a fixture-only loader returns empty property/file collections and no production API client is imported. Added an isolated Start root document, staging header/footer, noindex/canonical metadata, local content-deferred routes, a Worker-local Vite wrapper and an unbound `wrangler.jsonc`. The earlier hand-built replica remains in `App.jsx`/`styles.css` but is not mounted.
- **Design source:** Repository files `src/components/home/HeroSection.jsx`, `src/index.css`, `src/content/pages/home.json`; the public live site was not consulted.
- **Files:** `apps/staging-web/.gitignore`, `README.md`, `package.json`, `package-lock.json`, `vite.config.js`, `wrangler.jsonc`, `scripts/run-vite.js`, `src/main.jsx` (removed), `index.html` (removed), `src/router.jsx`, `src/routes/*`, `agent-plans/PROJECT-STATE.md`, and `agent-plans/CHANGELOG.md`.
- **Evidence and verification:** Read-only `wrangler whoami` succeeded with identity output suppressed. `npm run build` passed for client and SSR/Worker bundles. Local Worker preview at `http://127.0.0.1:4174/` returned HTTP `200` with source hero text and `noindex`; `/properties` returned `200`; an unmatched route returned `404`. Browser accessibility snapshot confirmed the hero, trust counters, search tabs, nav, and sample-data notice. Clicking Plot Files updated the search prompt; submitting a synthetic query navigated only to `/files?query=synthetic+demo`. Desktop and mobile viewport screenshots were inspected. No API/data requests, production assets, DNS, resources, deployment, or `workers/ai-worker` were accessed or changed. Browser reported no JavaScript runtime errors; it did report the source search field has neither `id` nor `name`, and the local page has no favicon (404).
- **Risk/follow-up:** This is a first source component, not full homepage parity. The source `Navbar` and lower sections remain to be reused. The mobile version intentionally follows the source component's mobile layout and does not show the desktop search panel. Fonts and the source hero's Unsplash background remain external requests. The Start frontend has its own Worker config but is not deployed and has no bindings. Do not deploy without explicit authorization.
