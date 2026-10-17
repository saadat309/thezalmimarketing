# Route, API, and Data Inventory

**Status:** Repository-derived Phase 1 discovery record; requires live-site and owner review before it becomes a cutover contract.
**Recorded:** 2026-10-17
**Scope:** Read-only inspection of the `Website-migration` checkout. No production system, database, media tree, Cloudflare resource, or AI Worker was accessed or changed.

## Evidence and limitations

- Public and dashboard paths below come from the generated TanStack route tree and route source files. They describe the current client application, not a verified production URL/redirect inventory.
- API resources come from `api/index.php`, frontend call sites, and PHP handlers. Exact request/response bodies, error envelopes, pagination defaults, and authorization requirements still need handler-by-handler contract review.
- Table relationships come from the checked-in schema and PHP query references. The schema contains no production records; counts, media sizes, and migration scope cannot be inferred from it.
- `workers/ai-worker/` was not read or changed for this inventory. It remains outside the migration scope under ADR-005.

## Current client route surface

| Area | Paths found | Migration note |
| --- | --- | --- |
| Public editorial | `/`, `/about`, `/contact`, `/privacy-policy` | Preserve server-rendered content and route-specific metadata in the successor app. |
| Public listings | `/properties`, `/properties/$id`, `/maps`, `/files` | `$id` is an implementation name; confirm whether production URLs use numeric IDs, slugs, aliases, trailing-slash normalization, and query filters. |
| Calculator | `/calculator` | Keep indexable explanatory content while separately validating interactive calculations against approved rules. |
| Authentication | `/login`, `/forgot-password`, `/reset-password`, `/accept-invite` | Determine existing token, reset, and invitation semantics before selecting the replacement session/auth design. |
| Dashboard | `/dashboard`, `/dashboard/users`, `/dashboard/societies`, `/dashboard/queries`, `/dashboard/properties`, `/dashboard/profile`, `/dashboard/phases`, `/dashboard/maps`, `/dashboard/landing-page`, `/dashboard/files`, `/dashboard/cities`, `/dashboard/categories` | All dashboard routes require a server-enforced replacement authorization model; client route protection alone is not a migration contract. |
| Calculator dashboard | `/dashboard/calculator-blocks`, `/dashboard/calculator-fee-rules`, `/dashboard/calculator-fees`, `/dashboard/calculator-phases`, `/dashboard/calculator-property-types`, `/dashboard/calculator-rates`, `/dashboard/calculator-tax-rates`, `/dashboard/calculator-transfer-fees` | These should move together with their reference data and validation rules, after D1 schema design is approved. |

## API resource inventory

| Domain | Current resource(s) | Tables or dependencies indicated by code | Migration contract work still required |
| --- | --- | --- | --- |
| Properties and related content | `properties`, `images`, `labels`, `files` | `properties`, `categories`, `cities`, `societies`, `phases`, `medias`, `images`, `detail_descriptions`, `labels`, `property_labels`, `property_related_properties` | Freeze public list/detail shape, ID/slug rules, filters, pagination, image order/primary state, related-property rules, uploads, and admin mutations. |
| Location taxonomy | `categories`, `cities`, `societies`, `phases`, `products` | Corresponding taxonomy tables; property and map references | Confirm deletion/reassignment behavior, active/inactive rules, sort order, and route filter parameters. `products` is routed but not represented in the supplied 30-table schema and needs investigation. |
| Maps and documents | `maps` | `map_docs`, `cities`, `societies`, `phases` | Record public versus admin visibility, file/media paths, associated taxonomy behavior, and upload/cleanup rules. |
| Landing content | `landing-sections`, `landing-available-items` | `landing_sections`, `landing_section_items`, plus properties/categories/maps as selectable items | Freeze section types, JSON/config fields, ordering, visibility, media references, and fallback behavior. |
| Inquiries | `queries` | `queries`, optionally `properties` | Separate public submission from admin management; document validation, spam controls, notification behavior, retention, and PII-safe logging. |
| Auth and authorization | `auth`, `users`, `roles`, `invites` | `users`, `roles`, `invites`, `refresh_tokens`, `password_resets`, `failed_logins` | Document login/token lifetime, password hashes, reset/invitation tokens, RBAC matrix, rate limits, and CSRF/session policy before implementing a replacement. |
| Calculator configuration | `calculator-config`, `calculator-phases`, `calculator-blocks`, `calculator-property-types`, `calculator-rates`, `calculator-transfer-fees`, `calculator-fees`, `calculator-tax-rates`, `calculator-fee-rules` | Eight calculator tables and dependent cities/societies | Treat checked-in seed inserts as reference data only. Capture formula inputs, decimal rounding, effective dates, imports/templates, and admin validation before translating to D1. |
| AI bridge | `ai-tools` | Read queries span properties, maps, locations, and calculator tables | Explicitly deferred. Do not alter the current PHP bridge or `workers/ai-worker/`; any new integration needs a separate user-approved Worker and staging endpoint. |

## Observed endpoint behavior that needs precise review

- The front controller recognizes `ping`/root, the resources listed above, and special actions including `auth/me`, `auth/login`, password-reset actions, invitation acceptance, and calculator import/template paths.
- `queries` is publicly writable but reads are authenticated in the front controller. Confirm every mutation authorization rule from the handlers rather than relying on endpoint naming.
- The frontend calls resources both as collection paths and with trailing identifier/action segments. The migration must preserve or redirect these paths deliberately; it must not infer a generic CRUD contract from the legacy handlers.
- Existing frontend adapters convert API snake_case fields to nested camelCase view models and include fallback mock data. The new API contract should be designed from verified consumers and source data, not by copying fallback fixtures into staging.

## Schema and translation domains

| Domain | Source tables | D1 design attention |
| --- | --- | --- |
| Property content | `properties`, `detail_descriptions`, `medias`, `images`, `labels`, `property_labels`, `property_related_properties` | Preserve relationships and display ordering; translate MySQL types/indexes and establish media-key ownership separately from object storage. |
| Location and maps | `categories`, `cities`, `societies`, `phases`, `map_docs` | Define foreign-key behavior and indexes around current filters/lookups. |
| CMS | `landing_sections`, `landing_section_items` | Validate JSON/text conventions and publish/visibility semantics. |
| Leads and auth | `queries`, `users`, `roles`, `invites`, `refresh_tokens`, `password_resets`, `failed_logins` | Minimize personal data in synthetic staging fixtures; redesign session/token storage and expiry deliberately. |
| Calculator | Eight `calculator_*` tables | Preserve money/decimal accuracy and rule precedence; D1 schema must be explicit SQLite migrations rather than a MySQL import. |
| Search | `search_indices` | Determine whether this is still used before carrying it forward; full-text behavior requires a SQLite-specific design. |

## Contract gaps and safe next actions

1. Ask the owner for safe, non-sensitive reports: per-table record counts, media/PDF count and total size, largest-object size, monthly growth estimate, and the current canonical host/redirect list. Do not request or copy production records into the repository.
2. Review each public URL on the live site with a defined browser test sheet to confirm route parameters, query strings, trailing-slash behavior, 404s, canonical tags, `robots.txt`, sitemap entries, and redirects. Record observations only.
3. Review PHP handlers and frontend consumers per vertical domain to specify response fields, validation, auth/RBAC, pagination, mutation effects, and upload lifecycle. Mark any undocumented behavior as a decision or test requirement rather than assuming it.
4. Before any Cloudflare provisioning or application implementation, bring the detailed runtime spike, resource layout, D1/R2 free-budget guards, and proposed staging separation back for explicit approval.

## Source paths reviewed

- `src/routeTree.gen.ts` and `src/routes/`
- `src/lib/apiClient.js` and `src/lib/api.js`
- `api/index.php` and `api/routes/`
- `docs/zalmimarketing-schema.sql` and `docs/property_transfer_calculator_schema.sql`
- `docs/api/endpoints.md` and `docs/architecture/api-integration.md`

