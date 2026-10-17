# Live Public URL Observations

**Status:** Read-only Phase 1 browser observation; incomplete URL/crawler audit.
**Observed:** 2026-10-17
**Scope:** Isolated browser visit to the public homepage only. No authenticated interaction, form submission, API mutation, production-data export, or configuration change occurred.

## Observed homepage behavior

| Item | Observation | Migration implication |
| --- | --- | --- |
| Visited host | `https://www.thezalmimarketing.com/` | The current public entry host includes `www`. |
| Canonical link | `https://thezalmimarketing.com/` | Canonical and visited host differ. Confirm intended canonical hostname and preserve it deliberately before staging or cutover. |
| Public primary paths linked from the homepage | `/properties`, `/maps`, `/files`, `/calculator`, `/contact`, `/about`, `/privacy-policy` | These paths should be part of the first URL compatibility/redirect test sheet. |
| Property detail links | Links use `/properties/{slug}` | Public property detail appears slug-based, despite the current route source naming its dynamic parameter `$id`. Preserve slug behavior or supply verified permanent redirects. |
| Listing filters | Homepage links use query parameters such as `category` and `categoryName`; some also carry an image path parameter | Determine which parameters are canonical/functional versus presentation-only, then normalize them intentionally. |
| Media/document paths | Homepage includes legacy image and PDF URLs under public paths, including `/pdf_docs/maps/...` | The asset manifest/redirect design must account for old public media/PDF locations before any R2 migration. |
| Homepage metadata | Page-specific title and description were present; no `robots` meta tag was observed | Successor SSR/prerender pages need an explicit metadata and robots policy. This does not verify the server-source document beyond this observation. |

## Still unverified

- `robots.txt` contents and sitemap URL/content.
- HTTP redirect chains between apex and `www`, HTTP/HTTPS, trailing-slash variants, legacy aliases, and 404 behavior.
- Metadata/canonical behavior of every public page, listing query variant, detail route, PDF, and auth/dashboard route.
- Whether linked current property slugs are complete, stable, unique, or redirect from historical URLs.
- Public file/map visibility and cache behavior.

## Next safe URL-audit action

Create a read-only URL test sheet from the public sitemap/known routes and record, per URL: requested URL, final URL/status, canonical, robots directive, title/description, source HTML content, and redirect expectation. Do not use authenticated pages, submit forms, or invoke API mutations.

