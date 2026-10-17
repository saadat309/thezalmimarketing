# Phase 0/1 Owner Actions and Proposed Domain Contracts

**Status:** Planning aid. None of the contracts or design choices below is approved for implementation.
**Recorded:** 2026-10-17
**Scope:** Credential-rotation coordination, safe aggregate inventory request, and successor-contract proposals derived from repository inventories. This document contains no credential values, production records, or production exports.

## Owner action: rotate exposed credentials

Credential rotation is an owner-controlled production security task; this workstream must not reveal, copy, test, or deactivate existing values. The owner should rotate every credential found in current project configuration or Git history, including database, SMTP/email, JWT/signing, third-party API, cPanel, and Cloudflare credentials where applicable.

Suggested owner completion record (send only status, not values):

| Check | Safe response |
| --- | --- |
| Scope reviewed | Credential classes reviewed; no secret values supplied. |
| Replacement generated | Yes/no per credential class. |
| Production consumers updated | Yes/no per credential class. |
| Old credential revoked | Yes/no per credential class. |
| Residual exposure | Paths/history identified, if any; no values. |
| Follow-up | Whether history remediation and forced user-password reset are required. |

Do not put replacement values in this repository, chat, screenshots, fixtures, or logs. Rotation completion is a deployment gate, but does not authorize a deployment, Cloudflare provisioning, or changes to `workers/ai-worker/`.

## Owner action: safe aggregate production and media report

Request a report produced by the owner or their authorized administrator. It must contain aggregates only: no rows, names, email addresses, phone numbers, tokens, paths that expose private data, database dump, or archive.

| Required aggregate | Unit / grouping | Purpose |
| --- | --- | --- |
| Record count | Each application table | Size sample data and validate D1 migration scope. |
| Total media/PDF count and bytes | Images, documents/PDFs, and other uploads separately | Size a storage and transfer budget. |
| Largest object | Bytes, by media class only | Set safe per-upload limits. |
| Monthly growth | Objects and bytes/month, recent representative period | Set a no-cost capacity guard. |
| Formats | Count by file extension or MIME family | Define allowed media types. |
| Public-media count | Count and total bytes only | Plan compatibility redirects/object manifest. |
| Retention/deletion policy | Brief policy statement | Decide lifecycle and cleanup behavior. |

The report is pending owner delivery. Do not substitute a production connection, database export, cPanel scrape, or copied media for this report.

## Proposed successor API conventions

**Proposal, not decision:** use `/api/v1` only for newly implemented endpoints and publish a deliberate compatibility/redirect plan for legacy `/api/*` consumers. JSON responses should use stable resource objects; list responses should expose `items` and a cursor or page metadata. Invalid input returns field-level errors; authentication and authorization failures are distinct. Exact envelope shape, pagination scheme, cache headers, and legacy-path support require approval after synthetic fixture tests.

All state-changing admin operations below require a server-side session and explicit RBAC rule. Public read endpoints expose only published/visible fields. No proposed endpoint authorizes a generic file upload, direct object key, or production-data access.

## Proposed per-domain contracts

### Properties, documents, and media

| Aspect | Proposal | Open decision / evidence required |
| --- | --- | --- |
| Public reads | List published properties with explicit filters and a stable slug detail route; expose associated public documents only through property/file representations. | Canonical filter names, sort/defaults, slug uniqueness/history, and exact consumer fields. |
| Admin writes | Separate create/update/publish/archive operations from media attach/reorder/remove operations. | RBAC matrix; destructive-change behavior; draft versus hidden semantics. |
| Data | `property`, `propertyDetail`, `propertyImage`, `propertyDocument`, label IDs, taxonomy IDs, and ordered related-property IDs. | Required fields, area/price units, decimal representation, and relationship rules. |
| Media guard | Server validates type, size, count, ownership, and visibility before creating a media record; objects are referenced by an internal key only. | Owner aggregate report; storage budget and deletion/rollback lifecycle. |

### Taxonomy, maps, and landing content

| Aspect | Proposal | Open decision / evidence required |
| --- | --- | --- |
| Taxonomy | Read published categories/cities/societies/phases/labels; administrative mutation validates referenced objects before delete or reassignment. | `products` source table/role, active/sort semantics, slug lifecycle, deletion policy. |
| Maps/documents | Public list/detail exposes only visible map metadata and public document references; admin controls associations and publication. | Availability filter meaning, file policy, map-to-taxonomy cardinality. |
| Landing CMS | Versioned section list with type, display order, visibility, configuration, and typed item references. | Allowed section types/config schema, fallback rendering, cache invalidation. |

### Inquiries, authentication, users, and invitations

| Aspect | Proposal | Open decision / evidence required |
| --- | --- | --- |
| Public inquiry | One narrowly scoped submission operation with server validation, rate limiting, anti-spam control, generic failure messages, and minimal PII logging. | Notification recipient/provider, retention/deletion period, exact fields and spam-control choice. |
| Sessions | HttpOnly, Secure, SameSite session cookie with CSRF protection for state changes; no browser-held long-lived bearer token by default. | User approval of session/CSRF policy, host/domain requirements, session duration, password-hash migration. |
| RBAC | Enumerated permissions per administrative operation; users/roles/invites are admin-only. | Role-to-permission matrix and whether roles remain editable. |
| Recovery/invites | Single-use, expiring, hashed tokens; generic reset-request response; audit only non-sensitive event metadata. | No-cost email provider, delivery limits, expiry, forced-reset policy, invitation acceptance flow. |

### Calculator configuration and calculation rules

| Aspect | Proposal | Open decision / evidence required |
| --- | --- | --- |
| Public reads | Publish a versioned, cacheable calculation configuration containing only active/public rules and reference data. | Exact response shape, cache lifetime, active/effective selection. |
| Calculation | Central deterministic calculation function with integer minor units or explicit decimal-string arithmetic and approved rounding at every step. | Owner-approved input/output examples, units, rounding mode, precedence, constants. |
| Administration | Validate dependent taxonomy references and import rows before atomic activation; report row-level errors without persisting a partial import. | CSV schemas/templates, reconciliation rule, permissions, rollback policy. |

### Search and operational endpoints

| Aspect | Proposal | Open decision / evidence required |
| --- | --- | --- |
| Search | Treat `search_indices` as deprecated until a public/admin consumer is verified; begin with indexed structured filters rather than a copied MySQL full-text design. | Whether search is used, expected ranking behavior, and fresh-index policy. |
| Health | Expose only a non-sensitive staging health result; do not disclose configuration, credentials, users, or data counts. | Exact availability/monitoring requirements. |
| AI bridge | Excluded. No successor endpoint in this phase. | Separate future approval and Worker design, per ADR-005. |

## Decisions needed before implementation

1. Intended canonical hostname and a complete redirect/404 policy.
2. Legacy API compatibility period and final response/error/pagination contract.
3. RBAC matrix, session/CSRF policy, password transition, and zero-cost transactional email option.
4. Media size/type/count/lifecycle limits based on the owner aggregate report and free-budget guard design.
5. Calculator formula examples, decimal/rounding policy, and import reconciliation behavior.

## Evidence used

- `agent-plans/03-route-api-data-inventory.md`
- `agent-plans/04-handler-contract-inventory.md`
- `api/index.php`, `api/routes/*.php`, `src/lib/api.js`, and `src/lib/apiClient.js`
- Checked-in schema definitions only; no production records or connection were used.
