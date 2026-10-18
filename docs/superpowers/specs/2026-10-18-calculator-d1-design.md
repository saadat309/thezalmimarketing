# Calculator D1 Adapter and Synthetic Data Design

**Status:** Approved for local synthetic implementation by the user on 2026-10-18; implementation recorded in ADR-033.
**Recorded:** 2026-10-18.
**Scope:** `apps/ssr-spike/` local Worker + local D1 emulator and synthetic dashboard/API behavior only.

## Goal

Replace the Calculator API/admin in-memory source of truth with the eight existing source-shaped local D1 tables while preserving the public API and dashboard behavior, calculator formulas, and import-ready text schema. Use deterministic fictional fixtures only. The local database remains isolated from production and is not deployed.

## Approved boundaries

- Use JavaScript only and the existing `STAGING_DB` binding with `remote: false`.
- Keep the eight table/column meanings aligned with the full checked-in database dump at `docs/zalmimarketing-schema.sql` and effective legacy PHP behavior; do not add production records or media.
- Preserve numeric IDs and foreign-key relationships in D1. Continue emitting string IDs at current API/admin boundaries where the current UI expects them.
- Preserve DECIMAL source values as canonical decimal text in D1; adapt to the existing numeric JSON/UI projection only at the boundary. Validate finite/range-safe values instead of silently returning non-finite numbers.
- Keep the public calculator configuration `no-store`; the next fetch reads current local D1 values. Do not add polling or push updates.
- Keep current public formulas, rounding, editable lines, and admin field behavior. CSV import remains limited to the existing Rates and Transfer Fees workflows.
- No remote D1, resource provisioning, deployment, DNS, live-site/cPanel/MySQL connection, production export/import, email, or `workers/ai-worker` change.

## Proposed architecture

1. Add a JavaScript Calculator D1 repository that reads all eight tables and joins the local `cities`, `societies`, and `phases` IDs to create the current `calculator-config` shape. Translate numeric IDs to strings for the existing clients, and map source decimal TEXT values to finite JSON numbers only when building the existing API projection.
2. Seed deterministic synthetic rows with explicit numeric IDs through an idempotent local-only script. Synthetic location rows must reference the existing fictional taxonomy IDs. Never seed from the MySQL schema's illustrative inserts or production exports. Keep the seed source auditable and resettable without deleting unrelated local tables.
3. Inject the repository into the public `/api/v1/calculator/config` route and the protected admin data API. Keep authorization, CSRF checks, input validation, and response/error shapes in the current API layer; remove Calculator reads/writes from the memory repository once parity tests cover the replacement.
4. Make Calculator admin collection/item operations read/write the same D1 rows as public config. Validate relationships and uniqueness against current D1 contents, not fixture arrays. Preserve existing dependency behavior: deleting a phase/block/fee may cascade only where source FKs say it does; property-type references restrict deletion. D1 numeric IDs are generated for new records and projected as strings.
5. CSV preview validates against the current D1 configuration. Applying a fully valid Rates or Transfer Fees file creates missing phase/block records as currently supported and upserts rows by the existing logical scope. Apply a batch atomically so a rejected statement cannot leave a partially applied import. Keep upload size, row-count, duplicate detection, and CSRF bounds.
6. Leave formulas and the frontend unchanged in this slice. Add storage/API/import tests first, then run the existing calculator golden tests against the D1-derived config to verify representative outputs remain unchanged.

## Fee Rule active-state compatibility

The dedicated `docs/property_transfer_calculator_schema.sql` excerpt omits `is_active`, but the full checked-in database dump at `docs/zalmimarketing-schema.sql` includes `calculator_fee_rules.is_active TINYINT(1) NOT NULL DEFAULT 1`. The legacy PHP confirms the effective schema/contract: `api/routes/calculator-fee-rules.php` ensures that column exists for older DBs; admin list returns both active and inactive rules; create defaults the flag to `1`; update preserves the current flag when omitted. `api/routes/calculator-config.php` includes only rules where `is_active = 1`.

**Design correction:** Keep `is_active` in the source-shaped D1 table. Migration 0009 has already been applied locally without it, so add it with the same default/boolean semantics in a forward-only migration; do not edit migration 0009. The full database dump and legacy PHP behavior are stronger evidence than the narrower standalone schema excerpt. No staging-only extension table is needed.


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
- Preserve the full checked-in schema's Fee Rule active column. Migration 0009 needs a forward-only local follow-up because the narrower excerpt omitted it.
- CSV changes must be transactional and use current DB state so previews and applications cannot drift to a fixture snapshot.
- Numeric API projection is retained as previously approved, while exact source decimal strings remain in storage. Large imported values still need explicit boundary tests before any real import is planned.
- Fee Rule active-state behavior is confirmed by the full checked-in SQL dump and legacy PHP; the dedicated calculator SQL excerpt is incomplete on this column.

## Implementation record

- ADR-033 records user authorization, legacy evidence, and the local-only boundary.
- Migration 0012 adds Fee Rule `is_active`; 0013 mirrors PHP duplicate guards for nullable/case-insensitive scopes. Applied migration 0009 remains immutable.
- The Calculator repository, admin API, public route wiring, and deterministic local synthetic seed now use D1. CSV preview reads current D1 state and apply uses one transactional batch.
- Existing calculator formulas were not changed. Public config keeps the current response envelope and `no-store`; active filtering and ordering match the checked-in PHP endpoint. Formula golden checks remain representative/source-derived rather than exhaustive execution of PHP.
- Local migrations through 0013 and synthetic seeds were applied. Verification results are recorded in the append-only changelog.

