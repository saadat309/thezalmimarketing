# Live Public URL Observations

**Status:** Read-only Phase 1 public URL/crawler observation; still incomplete for authenticated routes and exhaustive URL compatibility.
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

## Public redirect and crawler checks (2026-10-17)

These checks used public GET retrievals only. No form, authenticated route, API mutation, production export, or configuration change occurred.

| Requested URL or asset | Result | Migration implication |
| --- | --- | --- |
| `http://thezalmimarketing.com/` | `301` to `https://thezalmimarketing.com/`, then `200` | HTTP-to-HTTPS is present for the apex host. |
| `http://www.thezalmimarketing.com/` | `301` to `https://www.thezalmimarketing.com/`, then `200` | HTTP-to-HTTPS is present for `www`. |
| HTTPS apex and HTTPS `www` homepage | Both return `200`; neither redirects to the other | Duplicate host accessibility remains a high-priority canonical/redirect decision. |
| `/robots.txt` on `www` | `200`; blocks dashboard and auth paths; lists the apex sitemap | Crawler policy exists but mixes hosts. Confirm the intended canonical host before preserving it. |
| `/sitemap.xml` on `www` | `200`; 31 URLs observed, all using the apex host | Sitemap host conflicts with directly accessible `www` pages. Its first public entries cover editorial routes, listings, maps, files, calculator, and property slugs. |
| `/properties` and `/properties/` on `www` | Both return `200` with no redirect observed | Trailing-slash duplication needs an explicit policy and test after the canonical host is selected. |
| `/maps`, `/files`, `/calculator` on `www` | Each returns `200` | These are confirmed public compatibility routes. |
| An intentionally nonexistent public path | Returns `200` with the SPA HTML shell | Define a real 404 response and test it before migration; this is not a valid missing-page signal. |
| Initial HTML homepage source | No server-delivered `title`, meta description, canonical link, or robots meta was found; it contains generic social metadata pointing at apex | Browser-rendered metadata noted above is not sufficient for the SSR/prerender acceptance criterion. Preserve this as a baseline issue, not a deployment instruction. |

## Rendered sitemap metadata verification (2026-10-17)

An isolated browser context visited each of the 31 URLs in the public sitemap. This was read-only: no forms were submitted and no authenticated/admin route, cookie, storage value, or API mutation was accessed. Initial rapid navigation can expose an empty SPA head before hydration; affected pages were rechecked only after their rendered content was present.

| Check | Observed result | Migration implication |
| --- | --- | --- |
| Sitemap response coverage | All 31 sitemap URLs returned HTTP `200` on the apex host. | Current sitemap entries are reachable, but reachability alone does not establish canonical consistency. |
| Homepage, calculator, and privacy-policy | Render self-canonicals without a trailing slash (the homepage canonical ends at `/`). | These are compatible with the sitemap forms for these three pages. |
| Listings, maps, and files | Each sitemap URL omits a trailing slash, while the rendered canonical adds one. The no-slash URL remains directly reachable rather than redirecting. | Choose one URL form and issue a permanent redirect from its duplicate before cutover. |
| 18 property-detail URLs | Each sitemap URL omits a trailing slash; each rendered canonical adds one. The observed no-slash URL returns `200`, not a redirect. | The sitemap/canonical mismatch occurs across the complete listed property-detail set. |
| Six category-query listing URLs | Each sitemap URL is a `?category=` variant without a trailing slash; rendered canonical is the unfiltered `/properties/`. | Decide whether filter URLs should be crawlable; normally omit such variants from the sitemap and canonicalize only if this matches the intended search behavior. |
| About and Contact | Rendered titles/H1s were present but no canonical link element was present. | Add explicit self-canonicals in the successor; decide whether legacy pages need an interim correction. |
| Rendered robots meta | Present as `index, follow` on the listing/query/map/file pages checked; absent on the remaining representative pages, which defaults to indexability absent an HTTP directive. | Define one explicit successor robots policy per public versus authenticated route. |
| Missing-path rendering | An unknown path initially returns HTTP `200` but becomes a visible `404` after client hydration. | The successor must return an HTTP `404` plus a rendered not-found page; do not preserve this soft-404 behavior. |

## Next safe URL-audit action

Create a read-only URL test sheet from the public sitemap/known routes and record, per URL: requested URL, final URL/status, canonical, robots directive, title/description, source HTML content, and redirect expectation. Do not use authenticated pages, submit forms, or invoke API mutations.

