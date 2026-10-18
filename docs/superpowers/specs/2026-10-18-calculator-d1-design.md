# Calculator D1 Adapter and Synthetic Data Design

**Status:** Draft for owner review. The high-level local-D1 direction is approved; this detailed design is not yet approved for implementation.
**Recorded:** 2026-10-18.
**Scope:** `apps/ssr-spike/` local Worker + local D1 emulator and synthetic dashboard/API behavior only.

## Goal

Replace the Calculator API/admin in-memory source of truth with the eight existing source-shaped local D1 tables while preserving the public API and dashboard behavior, calculator formulas, and import-ready text schema. Use deterministic fictional fixtures only. The local database remains isolated from production and is not deployed.

## Approved boundaries

- Use JavaScript only and the existing `STAGING_DB` binding with `remote: false`.
- Keep the eight table/column meanings in migration 0009 aligned with `docs/property_transfer_calculator_schema.sql`; do not add production records or media.
- Preserve numeric IDs and foreign-key relationships in D1. Continue emitting string IDs at current API/admin boundaries where the current UI expects them.
- Preserve DECIMAL source values as canonical decimal text in D1; adapt to the existing numeric JSON/UI projection only at the boundary. Validate finite/range-safe values instead of silently returning non-finite numbers.
- Keep the public calculator configuration `no-store`; the next fetch reads current local D1 values. Do not add polling or push updates.
- Keep current public formulas, rounding, editable lines, and admin field behavior except for any explicitly approved decision below. CSV import remains limited to the existing Rates and Transfer Fees workflows.
- No remote D1, resource provisioning, deployment, DNS, live-site/cPanel/MySQL connection, production export/import, email, or `workers/ai-worker` change.

## Proposed architecture

1. Add a JavaScript Calculator D1 repository that reads all eight tables and joins the local `cities`, `societies`, and `phases` IDs to create the current `calculator-config` shape. Translate numeric IDs to strings for the existing clients, and map source decimal TEXT values to finite JSON numbers only when building the existing API projection.
2. Seed deterministic synthetic rows with explicit numeric IDs through an idempotent local-only script. Synthetic location rows must reference the existing fictional taxonomy IDs. Never seed from the MySQL schema's illustrative inserts or production exports. Keep the seed source auditable and resettable without deleting unrelated local tables.
3. Inject the repository into the public `/api/v1/calculator/config` route and the protected admin data API. Keep authorization, CSRF checks, input validation, and response/error shapes in the current API layer; remove Calculator reads/writes from the memory repository once parity tests cover the replacement.
4. Make Calculator admin collection/item operations read/write the same D1 rows as public config. Validate relationships and uniqueness against current D1 contents, not fixture arrays. Preserve existing dependency behavior: deleting a phase/block/fee may cascade only where source FKs say it does; property-type references restrict deletion. D1 numeric IDs are generated for new records and projected as strings.
5. CSV preview validates against the current D1 configuration. Applying a fully valid Rates or Transfer Fees file creates missing phase/block records as currently supported and upserts rows by the existing logical scope. Apply a batch atomically so a rejected statement cannot leave a partially applied import. Keep upload size, row-count, duplicate detection, and CSRF bounds.
6. Leave formulas and the frontend unchanged in this slice. Add storage/API/import tests first, then run the existing calculator golden tests against the D1-derived config to verify representative outputs remain unchanged.

## Source compatibility and open decision

The source `calculator_fee_rules` table has columns `id`, `fee_id`, `property_type`, `unit`, `min_area`, `max_area`, timestamps. It has no `is_active` column. However, the current synthetic Fee Rules API/form accepts and returns `is_active`, and the calculator golden tests include inactive fee-rule behavior.

**Recommendation:** Preserve the import-ready source table unchanged and add a small local/staging extension table keyed by numeric `calculator_fee_rules.id` for the editor-only active flag. Missing extension rows mean active. Public calculator config joins this extension and retains the existing `is_active` JSON property. A future source-data export excludes this extension unless a separately approved export contract opts in. This preserves existing UI behavior without putting a non-source column into a source table, but it does mean the active toggle is staging-specific.

Alternatives for owner selection:

- **A (recommended):** Add a clearly named staging extension table for fee-rule active state. Source table remains unchanged; import/export tooling must keep the extension separate.
- **B:** Treat every source fee rule as active and remove/ignore `is_active` from this domain's admin/API projection. This is simpler for import but changes current staging UI/API behavior and makes the inactive-rule golden case inapplicable.
- **C:** Add `is_active` directly to `calculator_fee_rules`. This is not recommended because it diverges from the checked-in source schema and conflicts with the import-compatibility goal.

Implementation is blocked on the user's choice of A or B (or another explicit direction). No extension migration or form behavior change is authorized by this draft.

## Validation and failure handling

- Reject invalid, non-finite, negative-where-prohibited, out-of-precision, or out-of-range DECIMAL input before persistence; never coerce malformed values to zero.
- Reject IDs outside SQLite's signed integer range during any future source import; current local synthetic IDs remain small. No source import is part of this slice.
- Validate nullable block scopes in application code because nullable composite uniqueness does not prohibit every duplicate scope in SQLite.
- Keep all writes parameterized. Use D1 batch for an all-or-nothing CSV apply after full validation.
- Convert missing D1 binding/query failures into existing safe API errors; do not fall back to fixture data, which could conceal disconnected storage.

## Acceptance checks

- All eight tables are seeded deterministically and idempotently, with valid FK links to synthetic locations/types/fees.
- Public GET and HEAD keep method/status/cache headers and response keys; GET data comes from D1, IDs are compatible strings, inactive/active filtering and source formulas remain the same.
- Admin list/create/read/update/delete behavior works for each domain, including duplicate and FK validation and expected delete restrictions/cascades.
- Reinitializing repository/API adapters and restarting the local Worker preserves edits because local D1 is the source of truth.
- Rates and Transfer Fees CSV preview uses current D1 rows; a valid import atomically inserts/updates expected rows; invalid/duplicate/oversized files do not mutate D1.
- Exact decimal strings remain unchanged in stored TEXT; public numeric projections are finite and match current fixture behavior for supported values.
- Existing calculator golden cases pass against the D1-derived config; add representative rate update, visibility toggle, and import-driven config refresh cases.
- Run Calculator API/admin/import/schema suites, both app builds if shared code changes require them, and `git diff --check`. Apply migrations only with Wrangler `--local`; no remote operations.

## Self-review

- Keeps the existing Calculator UI/formulas and current public contract as the default; it does not claim exact parity beyond the tested paths.
- D1 remains local and synthetic; no data import, deployment, Cloudflare account mutation, or production cutover is included.
- Source table definitions remain unchanged. The only proposed schema extension is isolated and pending explicit approval.
- CSV changes must be transactional and use current DB state so previews and applications cannot drift to a fixture snapshot.
- Numeric API projection is retained as previously approved, while exact source decimal strings remain in storage. Large imported values still need explicit boundary tests before any real import is planned.
- Existing active-state semantics for fee rules are not silently selected; owner choice is required before implementation.

## Implementation sequence after design approval

1. Resolve Fee Rule active-state choice and record the accepted detail in a new linked ADR.
2. Write a concise implementation plan and test inventory (the repository's referenced writing-plans skill is unavailable in this environment; use the repository spec as the source and a checked-in plan note if needed).
3. Implement repository + synthetic seed + local migration only if option A is chosen.
4. Wire public API/admin CRUD/CSV to D1, preserve current contracts, and add tests.
5. Apply local migrations, seed synthetic data, run the test/build checks, refresh the route/API map, state, and changelog.

