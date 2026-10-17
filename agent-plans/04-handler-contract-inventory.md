# Handler Contract Inventory

**Status:** Repository-derived Phase 1 review; not an approved replacement API design.
**Recorded:** 2026-10-17
**Scope:** Static review of `api/index.php`, resource handlers, and frontend consumers. No request was sent to production, no production record was read, and no PHP or Worker code was changed.

## Routing and access behavior observed

- The PHP front controller routes the first `/api/{resource}` path segment and supports a form `_method` override for `PUT`, `PATCH`, and `DELETE`.
- `users` and `roles` require authentication for every method. `queries` requires authentication except for `POST` contact submissions. Listed content resources allow public `GET` and authenticate mutations.
- Authentication accepts bearer credentials and a legacy `X-Auth-Token` compatibility header. Existing frontend code sends both headers.
- The current front-controller check proves authentication, not a documented role/permission matrix. The successor API must define server-enforced RBAC for each admin action instead of assuming legacy protection is sufficient.
- `landing-available-items` is authenticated even for its only observed `GET`; `ai-tools` bypasses the general content-resource list and is excluded from this migration by ADR-005.

## Endpoint and operation matrix

| Resource/path | Operations observed | Access behavior observed | Migration contract requirement |
| --- | --- | --- | --- |
| `/api/ping` | `GET` health response | Public | Define a non-sensitive staging health contract. |
| `/api/properties`, `/api/properties/{id}` | list, detail, create, update, delete; multipart method override; related media/labels/content | GET public; mutations authenticated | Freeze list/detail fields, property ID-versus-slug lookup, filters, pagination, hide/file behavior, upload lifecycle, image ordering, and mutation authorization. |
| `/api/files` | Delegates to property handling with file filtering | GET public; mutations authenticated by front controller | Decide whether this stays an alias or becomes an explicit document domain; preserve/redirect current public URLs deliberately. |
| `/api/categories`, `/api/cities`, `/api/societies`, `/api/phases`, `/api/labels`, `/api/products` | Collection/item CRUD | GET public; mutations authenticated | Document query filters, slug lifecycle, destructive-change safeguards, linked map/property behavior, and per-role permissions. `products` has no matching table in the supplied main schema. |
| `/api/maps`, `/api/maps/{id}` | list/detail, CRUD, map image/PDF upload/removal, availability lookup | GET public; mutations authenticated | Capture query filters, public visibility, file sizing/types, media cleanup, and location relationships. |
| `/api/images` | image list by `media_id`, create/update/delete, order updates | GET public; mutations authenticated | Define internal media API boundaries and safe object ownership; do not expose an unaudited generic upload interface. |
| `/api/landing-sections`, `/api/landing-sections/{id}` | list/detail and CRUD with section items | GET public; mutations authenticated | Specify section schemas, visibility, ordering, item references, media fields, and validation. |
| `/api/landing-available-items` | `GET` selection catalog | Authenticated | Establish whether this is an admin-only helper and its exact response shape. |
| `/api/queries`, `/api/queries/{id}`, `/api/queries/unread-count` | public creation; authenticated list/detail/update/delete/unread count | Only `POST` is public | Separate public inquiry submission from administration; define spam/rate limits, PII handling/retention, notifications, and RBAC. |
| `/api/auth/login` | `POST` login | Public | Existing response includes a browser-held JWT and user data; replacement session/cookie/CSRF decision is still open. |
| `/api/auth/forgot-password`, `/api/auth/reset-password` | `POST` reset request/confirmation | Public | Preserve generic reset-request response and define a verified no-cost email provider, token expiry, audit policy, and rate limits. |
| `/api/auth/me` | `GET` profile; `PUT`/`PATCH`/form-override `POST` profile update/upload | Authenticated in handler | Define a server session, profile fields, image handling, and authorization. |
| `/api/users`, `/api/users/{...}` | Admin listing/CRUD and invitation-related actions | Authenticated | Capture action subpaths and establish an explicit administrator/role matrix before porting. |
| `/api/roles` | `GET` list/detail | Authenticated | Determine whether roles are fixed or administrable and model permissions separately from display labels. |
| `/api/invites`, `/api/invites/accept` | invitation action(s) | Handler-specific; acceptance needs review | Freeze token lifecycle, expiry, replay protection, delivery, and unauthenticated acceptance semantics. |
| `/api/calculator-config` | composite config read | GET public; mutations are front-controller-authenticated although handler is read-oriented | Treat as a versioned public calculation configuration; document cache policy and rule precedence. |
| `/api/calculator-phases`, `/api/calculator-blocks`, `/api/calculator-property-types`, `/api/calculator-fees`, `/api/calculator-tax-rates`, `/api/calculator-fee-rules` | CRUD | GET public; mutations authenticated | Freeze validation, sort/active behavior, decimal precision, relationships, and administrator permissions. |
| `/api/calculator-rates`, `/api/calculator-rates/{id}`, `/api/calculator-rates/import`, `/api/calculator-rates/template` | CRUD plus CSV import/template download | GET public; mutations authenticated | Verify CSV schema, import error/reconciliation behavior, fixed decimal handling, and safe sample-only tests. |
| `/api/calculator-transfer-fees`, `/api/calculator-transfer-fees/{id}`, `/api/calculator-transfer-fees/import`, `/api/calculator-transfer-fees/template` | CRUD plus CSV import/template download and derived calculations | GET public; mutations authenticated | Freeze formula and constants through approval-backed tests; record rounding, units, and import validation. |
| `/api/ai-tools` | query-driven AI data/operation bridge | Separate handler; explicitly out of scope | Do not port, call, change, or deploy it. A future replacement needs a separate approved Worker. |

## Notable contract findings

1. **Identifiers and slugs:** property, map, and taxonomy handlers generate slugs, while public route code currently calls a property dynamic segment `$id`. Live URL behavior must decide whether the new public contract uses IDs, slugs, or compatibility redirects.
2. **Filtering:** property list code accepts a broad filter set (including location/taxonomy, price, property type, labels, bed/bath, area/unit, and file state); maps accept text/location/availability filters. Exact query spelling, defaults, pagination, and sort order need fixture-backed tests.
3. **Media:** properties/maps/profile routes mix JSON/form data and filesystem uploads, generate derivative images, and delete/reuse paths. The new design must put file type/size/count/total-budget guards before R2 is approved; it must not reproduce direct filesystem assumptions.
4. **Authentication:** legacy login mints a seven-day JWT, reset tokens expire after one hour, and the frontend stores/sends credentials in legacy headers. This is evidence for compatibility analysis, not approval to retain that design.
5. **Errors and response envelopes:** handlers generally return resource-specific JSON/errors rather than one normalized envelope. Preserve only behavior verified as a consumer dependency; define the new error contract before vertical-slice implementation.
6. **Calculator:** rate and transfer-fee endpoints have import/template action paths; transfer calculations include embedded derived logic/constants. These business rules need approved examples before SQLite/D1 translation.

## Required next review slices

1. Properties/media/maps: response examples using synthetic fixtures, ID/slug rules, filters, pagination, cache behavior, and upload lifecycle.
2. Auth/users/invites/queries: RBAC table, session/CSRF design, anti-abuse limits, email decision, and PII-safe logging/retention rules.
3. Calculator: input/output examples, unit conversions, decimal/rounding policy, active/effective record selection, and CSV validation/reconciliation.
4. CMS/taxonomy: permitted section schemas, visibility and ordering, deletion/reassignment policy, and public cache invalidation.

## Source paths reviewed

- `api/index.php`, `api/utils/auth_middleware.php`, and `api/routes/*.php`
- `src/lib/apiClient.js`, `src/lib/api.js`, and route/component call sites
- `docs/zalmimarketing-schema.sql` and `docs/property_transfer_calculator_schema.sql`

