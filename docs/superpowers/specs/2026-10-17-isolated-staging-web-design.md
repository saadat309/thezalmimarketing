# Isolated Staging Web Design

**Status:** Approved design direction; implementation is deliberately paused pending review.
**Recorded:** 2026-10-17
**Scope:** First replacement-site slice only. No production cutover, Cloudflare resource, deployment, data import, email flow, or AI migration is included.

## Goal

Create an independent, JavaScript/JSX-only replacement-site workspace that can later run with synthetic data and be validated without changing the live cPanel/Vite/PHP application. The first slice proves the public information architecture, URL/SEO behavior, sample-data boundary, and future auth boundary—not the full admin, storage, or backend migration.

## Chosen approach

The repository will gain a separate `apps/staging-web/` application rather than changing the existing root Vite app. The existing app's development configuration proxies `/api` to the PHP server and remains intact. The staging app will use only checked-in synthetic fixtures and local interfaces; it must have no production database, cPanel, DNS, or Cloudflare dependency.

The planned public surface is Home, Properties, Property Detail, Maps, Files, Calculator information, and a true not-found route. The calculator's financial engine, admin dashboard, inquiry submission, media upload, email, and AI are out of this slice.

## URL and SEO design

The staging app will use an environment-configured canonical origin. Its production target is the apex host only at an explicitly approved cutover; no current host or DNS behavior will be modified.

Canonical public routes will use trailing slashes:

| Route family | Canonical form |
| --- | --- |
| Home | `/` |
| Editorial/public indexes | `/about/`, `/contact/`, `/properties/`, `/maps/`, `/files/`, `/calculator/`, `/privacy-policy/` |
| Property detail | `/properties/{slug}/` |
| Filtered listing | `/properties/?category={value}` may be usable, but canonicalizes to `/properties/` and is excluded from the sitemap. |
| Missing page | Returns HTTP `404` and rendered not-found content. |

The generated sitemap will contain only canonical indexable public pages and published property-detail slugs. `robots.txt` will permit public pages and disallow future dashboard/auth paths. Titles, descriptions, canonicals, and robots directives must be delivered in initial HTML once SSR/prerendering is introduced; a client-only head update is insufficient.

## Data and component boundaries

`apps/staging-web/` will keep synthetic fixtures behind small repository modules, not inside page components. Public components consume domain-shaped records such as `property`, `propertyImage`, `mapDocument`, and taxonomy references. Fixtures contain no production personal data, credentials, copied media, or database extracts.

Pages render from a read-only repository interface. Replacing that interface with a future Worker API is a later contract task, so page components must not know the database or object-storage schema.

## Future authentication boundary

No authentication screen or session implementation is in the first slice. The approved target boundary for a later admin slice is server-side sessions with Secure, HttpOnly, SameSite cookies and CSRF validation for state-changing operations. Initial roles are Admin and Content Manager; permissions will be explicit per operation. Development accounts will be synthetic. Any production password transition, reset process, or email delivery remains deferred until production-readiness work.

## Explicit exclusions

- No modification to the root Vite app, PHP API, cPanel, production MySQL, DNS, or `workers/ai-worker/`.
- No Wrangler provisioning, deployment, resource creation, D1/R2 binding, or secret creation.
- No production media, record import, authentication credential, transactional email, inquiry submission, or calculator business-rule translation.
- No requirement for the old frontend to use a successor API: staging and production remain separate until a later approved cutover plan.

## Verification required when implementation is authorized

1. JavaScript/JSX-only file check and production build.
2. Fixture-boundary test: no production URL/database credentials or personal records in staging data.
3. Browser checks for initial HTML metadata, canonical routes, filtered listing canonicalization, sitemap/robots contents, and real HTTP 404 response.
4. Accessibility smoke checks for navigation, headings, and not-found page.
5. Confirm the root existing Vite/PHP app and `workers/ai-worker/` remain unmodified.

## Deferred decisions

- TanStack Start/Cloudflare Workers runtime proof and exact package layout.
- Cloudflare free-tier resource design and media size/count/operation guards.
- Public inquiry anti-abuse and transactional email provider.
- Calculator calculation, rounding, CSV import, and reconciliation behavior.
- Production password migration, full RBAC matrix, canonical-host redirect execution, data migration, and production cutover/rollback.
