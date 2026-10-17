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

**Proposal outside the property slice:** use `/api/v1` for newly implemented endpoints and publish a deliberate compatibility/redirect plan for legacy `/api/*` consumers. JSON responses should use stable resource objects; list responses should expose `items` and a cursor or page metadata. Invalid input returns field-level errors; authentication and authorization failures are distinct. For properties only, the user selected cursor pagination with default 20/max 50 and the `/api/v1` prefix. Exact envelope shape, cursor encoding, cache headers, and conventions for other domains require design/validation. No legacy API bridge is proposed (ADR-011).

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

## Proposed first vertical contract slice: public property reads

**Status:** Contract-design direction accepted by the user on 2026-10-18. On 2026-10-18 the user separately approved local implementation of an isolated synthetic API prototype only (ADR-016). This narrows the broader properties/media proposal above to the public read surface; it does not specify admin writes or uploads, nor approve production persistence, provisioning, or deployment.

### Scope and consumers

- Public property listing and property-detail pages, including their SSR metadata/content needs.
- The existing property listing UI currently requests `query`, `category`, `city`, `beds`, `baths`, `property_type`, `priceType`, `societyName`, `phase`, `area`, and `areaUnit`; it defaults `is_file=0`. The PHP handler also supports `label`, but the reviewed listing helper does not send it.
- Detail consumers resolve the route segment using a slug in current public links. The PHP handler accepts either a numeric ID or slug, while current listing links use `property.slug`.
- No property API calls, response samples, or records from production were made or inspected for this proposal.

### Proposed public endpoints and visibility

| Endpoint (proposal) | Purpose | Proposed behavior |
| --- | --- | --- |
| `GET /api/v1/properties` | Public, non-file property listing | Return published/visible properties only; omit `is_file=1` records and all hidden/admin/internal fields. Expose only fields consumed by public listing/detail pages. |
| `GET /api/v1/properties/{slug}` | Public property detail | Resolve by canonical slug only; return `404` for missing, hidden, or non-public records. |

The user selected the versioned `/api/v1` prefix and slug-only lookup for this contract. No legacy `/api/*` bridge is proposed (ADR-011). Numeric-ID detail access, old URL redirects, canonical host, and trailing-slash handling belong to the separate URL/redirect decision and must not change the live site now.

### Proposed list query contract

| Field | Proposed meaning | Repository evidence / unresolved point |
| --- | --- | --- |
| `query` | Case-insensitive text search over title, short description, address, category, city, society, phase, and label. | Legacy handler searches these fields with `LIKE`; collation/case behavior and supported search scale need tests. |
| `category`, `city`, `society`, `phase` | Exact stable taxonomy slug filters; taxonomy IDs remain internal. | User selected stable slugs. Legacy API filters by display name; taxonomy slug lifecycle and uniqueness still need design. |
| `property_type` | `Residential` or `Commercial`. | Values match the checked-in schema enum; confirm source rows and normalization during approved fixture design. |
| `purchase_type` | `sale`, `rent`, or `installment`. | Existing UI sends `priceType`; new name is proposed for clarity, and no compatibility alias is implied. |
| `min_beds`, `min_baths` | Minimum bedroom/bathroom counts. | Existing request names are `beds`/`baths`; PHP applies `>=`. |
| `min_area`, `area_unit` | Minimum area plus a required/paired unit filter. | Existing request names are `area`/`areaUnit`; PHP compares raw values after unit equality. Unit conversion is not evidenced. |
| `label` | Optional exact label identifier. | Legacy handler supports label-name filtering, but the reviewed public UI does not send it. Inclusion in v1 remains subject to confirming a consumer. |
| `limit`, `cursor` | Bounded page size and opaque continuation token. | User selected cursor pagination, newest first, stable tie-breaker, default 20 and maximum 50 items. Candidate order is `created_at DESC, id DESC`; verify against synthetic fixture cases. Legacy endpoint has no pagination and orders by descending ID. |

Do not add price range filters to the initial contract based on assumptions: the reviewed legacy handler does not apply them. Confirm whether the UI exposes/needs them before adding fields. The public endpoint must not accept `all=1` or a caller-controlled visibility override.

### Proposed response shape (illustrative only)

Based on current public page consumers, the candidate minimal field groups are:

- **Listing/card:** canonical slug, title, category name, property type, purchase type, price-display inputs, address/city, beds, baths, area/unit, visible badge labels, and the explicit thumbnail URL/alt text. A property listing response should not include file-only records or expose the `is_file`/admin flag.
- **Detail:** the card fields plus short and detailed descriptions, features, furnished state, society/phase display values where used in public content, location-map embed data, ordered visible image URL/alt text, and related-property slug/title summaries.
- **Contact action:** the current UI passes a numeric property ID to the inquiry form. To keep database IDs internal, the successor inquiry contract should resolve the property from its canonical slug (separate contract slice); do not expose a database ID only to satisfy this legacy coupling.
- **Excluded by default:** internal database IDs, media/object keys and filesystem paths, hidden/draft state, admin metadata, uploader/user information, and any personal/customer data. Expose uploaded or embedded video only if its visibility is confirmed below.

This allowlist is derived from checked-in public components and remains subject to owner review and final consumer verification. The detail page currently renders its long description as HTML; the replacement must choose plain text or sanitize an explicit safe HTML subset before rendering rather than assume stored HTML is safe.

```json
{
  "items": [
    {
      "slug": "sample-residence",
      "title": "Sample Residence",
      "propertyType": "Residential",
      "purchaseType": "sale",
      "shortDescription": "Synthetic sample listing.",
      "location": { "address": "Sample district", "city": "Sample city", "society": null, "phase": null },
      "category": { "id": "sample-category", "name": "Sample category" },
      "price": { "amount": "12500000", "currency": "PKR", "discounted": false, "originalAmount": null, "period": null, "installmentAdvanceAmount": null, "installmentAmount": null, "installmentDisplayMode": null, "periodUnit": null, "periodValue": null, "totalPeriodText": null },
      "area": { "value": "1200", "unit": "sqft" },
      "beds": 3,
      "baths": 2,
      "labels": [],
      "media": { "thumbnail": null, "images": [], "video": null }
    }
  ],
  "page": { "nextCursor": null, "hasMore": false }
}
```

The response is a target shape, not an assertion that all fields are currently reliable or required. The user confirmed amounts are whole PKR rupees with no lakh/crore scaling; expose the amount as a decimal string to preserve exact integer value. The user confirmed area is interpreted in its accompanying stored unit with no API conversion; the schema's listed units are `sqft`, `marla`, `kanal`, `hectare`, `acre`, and `yard`. Synthetic sample values above illustrate those semantics only and are not production data. Nullable behavior, period representation, enum spelling, and display formatting still need contract detail. Detail may add `description`, `features`, public map/embed data, and ordered related-property summaries only after each field's public visibility and consumer need are verified. Public media should include only non-hidden images in display order, identify one thumbnail explicitly when images exist (otherwise `null`), and expose no internal storage key. Uploaded/embedded video may be exposed only when both the property and video are explicitly public. Long-description formatting may be preserved only as server-sanitized HTML under an explicit allowlist; raw unsanitized HTML must not be rendered.

### Error and caching proposal

- Invalid filters: `400` with a stable machine-readable code and field errors; exact common envelope is still an API-wide open decision.
- Missing, hidden, file-only, or otherwise non-public detail: indistinguishable `404` response.
- Unexpected failures: generic non-sensitive error response; never include SQL, filesystem paths, credentials, or record counts.
- User requires immediately current public property content on the next navigation/refetch; already-open pages do not need push or polling. The isolated prototype uses `Cache-Control: no-cache, must-revalidate` and a weak ETag over the current public JSON body: unchanged representations may return `304`, changed representations return `200` with a new validator. Each revalidation still reaches the Worker and the real data source will still need a current read/version check. No stale-while-revalidate or stale-if-error is permitted. Keep hashed static assets independently cacheable. Workers Cache remains disabled; its request-quota effect has not been accepted for this design.

### Remaining evidence gaps before replacing fixtures with a data source

1. Verify the full public property field set against page and component consumers; distinguish fields needed for listing cards from detail-only data.
2. Confirm stable taxonomy identifiers, current slug uniqueness/history, and whether renamed taxonomy terms should preserve old filter URLs.
3. Validate `created_at DESC, id DESC`, default page size 20, maximum page size 50, cursor behavior, empty-list behavior, and whether totals are needed using synthetic fixtures.
4. Price semantics are confirmed as whole PKR rupees with no lakh/crore scaling; area values remain in their accompanying stored unit with no API conversion. Confirm area-unit validation, price-period representation, optional/null semantics, and source enum spellings. Do not infer any further conversion or rounding behavior.
5. The local prototype applies the user-approved visibility boundary for video and uses Workers `HTMLRewriter` with a conservative tag/attribute/URL allowlist for synthetic description HTML. Review this policy before production content is connected. Legacy media readers retrieve `hide`, but the reviewed helper does not filter hidden images; the prototype includes public, non-hidden images only, ordered with an explicit thumbnail.
6. Validate cursor bounds of default 20 and maximum 50. Honor immediate freshness with mandatory revalidation; verify that ETag/version checking observes each committed publication change. Keep Cloudflare Workers Cache disabled unless its request-quota impact and freshness behavior are acceptable.
7. Validate hidden/unpublished detail behavior, canonical slug URLs, redirects, and list/detail cache invalidation with synthetic cases; no live-site routing changes are part of this design task.

### Synthetic acceptance cases (local prototype; checked 2026-10-18)

| Synthetic case | Expected result |
| --- | --- |
| Visible non-file property with public taxonomy/media | Appears in public list with only the proposed page-consumed fields; no database ID, storage key, file path, admin/user fields, or PII. |
| Hidden property or file-only item | Excluded from list; direct slug detail returns the same generic `404` used for unknown slugs. |
| Valid property slug, unknown slug, or numeric database ID that is not itself the canonical slug | Canonical slug resolves; unknown/non-canonical numeric ID returns generic `404` without revealing internal lookup behavior. A numeric-looking canonical slug would still resolve as a slug. |
| Combined taxonomy-slug, purchase type, min-bed/bath, area/unit filters | Returns only matching synthetic fixtures; invalid/unsupported values return a field-level `400`. |
| More than one page, including records with the same `created_at` | Default page is 20; explicit limit up to 50 works; cursor ordered by `created_at DESC, id DESC` has no duplicates/omissions. A requested limit above 50 is rejected with `400` (proposal). |
| Images with mixed `hide` values and shuffled positions | Hidden images are excluded; remaining images follow position order; one deterministic thumbnail is identified when visible images exist, otherwise `null`; no internal media key/path leaks. |
| Public property with video marked private; public property and explicitly public video; private property with otherwise-public video | Video is absent unless both related records are explicitly public; only the fully public pair includes its video representation. |
| Description containing allowed formatting, `<script>`, event-handler attributes, `javascript:` links, and disallowed embeds | Only allowlisted, sanitized formatting survives; executable attributes/protocols and disallowed elements are removed. No raw HTML is rendered. |
| Cached response with unchanged current ETag | Revalidation reaches the Worker and may return `304`; the retained body is reused without retransmitting it. |
| Publish/update/unpublish after a client holds an older ETag | Next request/refetch returns the current representation (`200` + new validator) or `404` after unpublish; it never returns stale content or stale-on-error. |
| Backend/version check unavailable | Fail visibly with a non-sensitive error rather than serve a stale property copy. |

This matrix was exercised against the local synthetic prototype and fixtures only; it does not validate D1 queries, committed-write invalidation, external cache behavior, or production data. “Immediate” means the next HTTP request/revalidation after a successful publish/update sees current data. An already-open page cannot change without a new client request; real-time push/poll is not part of the initial slice.
