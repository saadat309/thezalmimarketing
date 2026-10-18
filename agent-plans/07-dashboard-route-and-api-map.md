# Dashboard and dynamic-route migration map

**Status:** Source route inventory is complete. Staging represents all current public route paths and dashboard route families, but route/feature presence is not full visual or behavioral parity. Property/File/Map editors expose grouped synthetic fields; Queries has synthetic detail/read/unread/edit/delete/filter/bulk-delete/CSV workflows; Landing Page has editable section visibility/content/order/selection plus popup/video settings; Calculator Rates and Transfer Fees now have source-derived forms sharing the synthetic config consumed by the public calculator. Transfer Fees includes the source derived-rate preview. Media upload remains disabled. Taxonomy and remaining Calculator dashboard forms remain generic or incomplete. Users/Profile are read-only by approved staging boundary. Public calculator is a synthetic source-inspired wizard with source-derived formula golden tests for representative cases; exhaustive parity and CSV import/export remain incomplete. No production credentials, records, APIs, or storage are in scope.

## Existing route ownership

| Existing route | Responsibility | Existing data/API boundary |
|---|---|---|
| `/dashboard` | Authenticated layout and redirect to `/login` when the client auth store has no session | `useAuthStore`; dashboard child outlet |
| `/dashboard/` | Overview cards and query activity chart | `GET /landing-available-items`, `GET /queries` |
| `/dashboard/properties` | Property listing, visibility, create/edit/delete | `GET /properties?is_file=0&all=1`, `POST /properties`, `POST /properties/:id`, `DELETE /properties/:id`; form also reads city/society/phase/category/label choices |
| `/dashboard/files` | File listing, create/edit/delete and CSV export | `GET /files?is_file=1&all=1`, `GET /files/:id`, `POST /files`, `POST /files/:id`, `DELETE /files/:id`; media upload is part of the source form and is intentionally deferred |
| `/dashboard/maps` | Map listing and create/edit/delete | `GET /maps?all=1`, `POST /maps`, `POST /maps/:id`, `DELETE /maps/:id`; map form also reads cities/societies/phases; media upload is deferred |
| `/dashboard/cities` | City taxonomy CRUD | `/cities` collection and item reads/writes |
| `/dashboard/categories` | Property category taxonomy CRUD | `/categories` collection and item reads/writes |
| `/dashboard/societies` | Society taxonomy CRUD | `/societies` collection and item reads/writes |
| `/dashboard/phases` | Phase taxonomy CRUD | `/phases` collection and item reads/writes |
| `/dashboard/queries` | Customer inquiry queue, read/unread state, detail/edit/delete | `/queries`, `/queries/unread-count`, `/queries/:id`; data can contain personal information, so staging must use synthetic examples only and must not send email |
| `/dashboard/landing-page` | Homepage section ordering/content and selected-item configuration | `/landing-sections`, `/landing-available-items`; uploaded section media is deferred |
| `/dashboard/calculator-phases` | Calculator phase settings | `/calculator-phases` collection and item reads/writes |
| `/dashboard/calculator-blocks` | Calculator block settings | `/calculator-blocks` collection and item reads/writes; reads calculator phases |
| `/dashboard/calculator-property-types` | Calculator property types | `/calculator-property-types` collection and item reads/writes |
| `/dashboard/calculator-rates` | Calculator rate records and import | Legacy `/calculator-rates` CRUD/import; reads phases, blocks, and property types. Staging uses a synthetic Admin API collection with phase/block/property-type/unit options, DC/FBR rates and active status; validates relationships and duplicate phase/block/type scopes. Admin writes share the in-memory sample config consumed by public `/api/v1/calculator/config`. CSV import/export remains deferred. |
| `/dashboard/calculator-transfer-fees` | Transfer-fee records and import | Legacy `/calculator-transfer-fees` CRUD/import; reads phases, blocks, and property-type categories. Staging uses the shared synthetic calculator config and exposes phase/block/category, reference amount/size/unit, active status, and the source-derived sports-fund/area-conversion preview. The API validates relationships, thresholds, and unique phase/block/category scope; the public calculator ignores inactive samples. CSV import/export remains deferred. |
| `/dashboard/calculator-fees` | Calculator fee records | `/calculator-fees` collection and item reads/writes |
| `/dashboard/calculator-tax-rates` | Tax-rate records | `/calculator-tax-rates` collection and item reads/writes |
| `/dashboard/calculator-fee-rules` | Fee-rule records | `/calculator-fee-rules` collection and item reads/writes; reads calculator fees |
| `/dashboard/users` | Legacy user CRUD and invite-token generation | `/users`, `/users/:id`, `/users/:id/generate-invite-token`; replaced in staging by a read-only view of the two seeded synthetic admins—no invitation or role-management flow |
| `/dashboard/profile` | Current-user profile read/edit | `/auth/me`; profile-image upload is deferred |
| `/properties/` | Public property listing and filters | Legacy `fetchProperties` and taxonomy options; successor synthetic contract already exists at `/api/v1/properties` |
| `/properties/$id/` | Public property detail, related properties, inquiry form | `fetchProperty`, property list, and `submitQuery`; staging uses the accepted slug API and does not submit inquiries |
| `/maps/` | Public society-map directory and filters | `fetchMaps`, `fetchMapFilterOptions` |
| `/files/` | Public plot-file directory and filters | `fetchFileProperties`, `fetchFileFilterOptions` |
| `/calculator` | Public fee calculator, three-step location/property/transfer flow, result details and exports | Legacy `/calculator-config`; staging uses fabricated `/api/v1/calculator/config` data and source-inspired calculations. Local JavaScript golden tests cover representative source-derived scenarios; they do not invoke the legacy route function or prove exhaustive parity |

The dashboard shell is in `src/routes/dashboard.jsx` and `src/components/dashboard/DashboardLayout.jsx`; navigation labels and route destinations are in `src/components/dashboard/app-sidebar.jsx`. Many modules call the shared `apiFetch`, while Categories, Phases, Societies, Landing Page, and some Queries actions use direct `/api/...` fetches. The staging API should normalize these into one versioned contract rather than copy that inconsistency.

## Staging implementation boundary

- The staging frontend remains `apps/staging-web/`; the isolated JavaScript API remains separate from the legacy PHP API and `workers/ai-worker`.
- Use versioned API contracts and repository interfaces. Start with deterministic synthetic in-memory adapters; later D1 persistence should replace the data adapter, not route/UI contracts. Media upload/storage remains a separate R2 design and is not part of this slice.
- The role is a single hardcoded `Admin` role shared by exactly two synthetic staging users. Do not build role management, invites, or user CRUD. Demo credentials are local-only and must not enter Git, plans, logs, or deployment configuration.
- Keep server-session and CSRF boundaries. The initial local session adapter is ephemeral and not suitable for deployment; any remote deployment requires a durable approved session store, rotated/independent secrets, and separate explicit deployment authorization.
- Staging CRUD and fixtures must be synthetic only. Inquiry/contact/email sending, uploads, production MySQL/API access, domain/DNS changes, Cloudflare resource provisioning, and `workers/ai-worker` remain out of scope.
- Calculator Rates and Transfer Fees adapters mutate module-level synthetic fixtures only for the isolated local preview; this is intentionally ephemeral and must not be treated as deployable shared/persistent storage. Before any deployment, replace these with an approved durable adapter and verify Workers isolate/request semantics.

## Recommended implementation slices

1. **Complete locally:** Add public synthetic Maps and Files list/filter APIs and replace their staging placeholders.
2. **Implemented locally:** Added loopback-only two-admin login/session/logout, a protected dashboard shell/home, a read-only two-admin account view, and versioned synthetic API auth/session gates. Direct API tests verify credential checks, cookies, CSRF, throttling, and local-host gating.
3. **Implemented locally:** Every mapped dashboard URL resolves in staging through the shared `$section` route. Users/Profile are read-only. Property/File/Map editors group source-derived fields over synthetic fixtures. Queries and Landing Page have specialized synthetic workflows; Landing Page section order, visibility, titles, copy, selected items, popup delay, and embed URL save to the in-memory API. File/media upload remains disabled.
4. **Public frontend coverage:** `/`, `/about`, `/contact`, `/privacy-policy`, `/calculator`, `/properties`, `/properties/$slug`, `/maps`, and `/files` have staging routes. There is no current source Terms route. This measures route coverage, not exact design parity. Contact/newsletter actions remain disabled; media is placeholder-only; calculator values are fabricated and formula parity is not acceptance-tested.
5. **Next:** Port route-specific calculator administration from its source forms and expand formula golden cases around boundary/fallback scenarios. Continue field-by-field comparison of Property/File/Map and taxonomy forms; compare dashboard visuals and query/landing workflows against source screenshots. Keep uploads and transactional messaging disabled, CSV imports unimplemented, and production data out of scope.

The property/file/map and public directory paths share transient fixture arrays, so local visibility and field edits affect subsequent public reads in the same Worker process. Taxonomy/CMS/query/calculator persistence and deeper workflow semantics are still local previews. The route labels and basic edit controls are intentionally generic rather than a visual/form parity claim for every legacy module.

This sequence creates testable routes early without implying that the entire legacy dashboard has been ported. No route in this document authorizes deployment.
