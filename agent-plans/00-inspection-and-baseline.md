# Inspection and Performance Baseline

**Inspected:** 2026-10-17  
**Repository branch:** `Website-migration`  
**Scope:** read-only inspection of the current checkout, provided documentation/SQL, and the live public homepage. No application code, database, Cloudflare configuration, production data, or AI Worker was changed.

## Current repository shape

- **Frontend:** React 19, Vite/Rolldown, TanStack Router, TanStack Query, Zustand, Tailwind CSS v4, Radix UI. The current app is mounted client-side from `src/main.jsx`; the returned homepage HTML has an empty `#root` and a loading overlay, with the route content rendered after the JavaScript bundle runs.
- **Current backend:** a PHP front controller at `api/index.php`, PDO/MySQL configuration, shared auth middleware, and about 30 resource route files in `api/routes/`. The domain surface includes properties, categories, cities, societies, phases, maps, files, images, leads/queries, auth, users/roles/invites, landing content, calculator configuration and rules, and AI integration.
- **Existing Cloudflare service:** `workers/ai-worker/` is a separate TypeScript AI Worker currently documented as production-connected. It is explicitly out of migration scope and must not be edited, redeployed, or have its route changed as part of the new site's work.
- **Local development:** Vite proxies API requests to a PHP server. Current frontend and deployment docs describe the PHP/cPanel workflow and need updating after the target architecture is agreed and implemented.
- **Documentation drift:** some architecture documentation references routes not present in the current route tree and describes the current SPA as if all metadata/content were already server-rendered. Documentation should be reconciled during discovery, not treated as executable truth.

## Database and content files

- `docs/zalmimarketing-schema.sql` defines 30 MySQL tables. It contains table definitions and indexes, not production row records. It includes core content and relationship tables for properties, media/images, maps, categories, locations, labels, landing sections, users/authentication, invitations, password resets, leads, and calculator data.
- `docs/property_transfer_calculator_schema.sql` defines eight calculator tables and includes starter inserts for calculator property types, fees, taxes, and area-based fee rules. The inserts are seed/business-rule data, not a production database export. Its `USE` and DDL statements mean it must not be run against production as-is.
- The main schema uses MySQL-specific constructs (including `AUTO_INCREMENT`, `ENUM`, MySQL index/full-text syntax, and MySQL-specific constraints). D1 is SQLite-based and Cloudflare says raw MySQL SQL cannot be imported directly. A translated D1 schema, query rewrite, and repeatable migration/verification tooling will be required.
- The checkout does not contain the live database records or an inventory of the cPanel media tree. No live DB connection was used. The actual production data volume, media volume, and records that need migration remain to be inventoried through a safe export by the owner.
- The calculator schema file has an existing user edit removing a stale “table creation only” comment. It was preserved.

## Live homepage browser baseline

Observed on `https://www.thezalmimarketing.com/` using Chrome DevTools on 2026-10-17. These are measurements of one page and one test session, not a promise about every visit.

| Observation | Measurement | What it suggests |
|---|---:|---|
| Mobile lab run, 390×844, Slow 4G, 4× CPU | LCP 2.7 s, CLS 0.00 | Reasonable test-run LCP, but this is lab data and differs from real-user field data. |
| Chrome UX Report p75 surfaced in the mobile trace | LCP 8.9 s; TTFB 1.3 s; render delay 4.7 s; CLS 0.01 | Real-user performance is substantially worse; the render path, not just origin response, needs attention. |
| Desktop lab run, unthrottled | LCP 5.0 s; TTFB 0.19 s; hero resource delay 3.68 s; render delay 1.15 s | The hero background image is discovered only after JavaScript runs and is not given high priority in the initial HTML. |
| DOM after hydration | 3,886 elements, depth 22 | The homepage renders a large tree; profile the large sections and reduce unnecessary eager content. |
| Images in hydrated homepage | 98 | Audit above-the-fold image priority, responsive variants, and lazy loading below the fold. |
| Browser network activity | Repeated `/api/properties?is_file=0` and `is_file=1` requests; landing sections, maps and categories also fetched client-side | Check duplicated route loaders/query keys and consolidate or cache page data. |
| JS/CSS caching insight | about 867.6 kB estimated repeat-download waste; hashed JS/CSS had cache bypass / 0-second effective TTL in this trace | Configure long-lived caching for versioned assets and correct HTML/API cache policies. |
| Render-blocking resources | Main CSS and Google Fonts; DevTools estimated up to 148 ms FCP savings | Reduce font families/weights and unblock non-critical styling where appropriate. |
| Third parties | GTM about 197.7 kB / 257 ms main-thread time; Google Fonts about 88 kB | Defer or reduce third-party work and fonts after validating measurement/analytics needs. |
| Forced reflow and layout | 525 ms reported reflow time; large layout/style recalculations | Inspect scroll smoothing, preloader, and animation code; keep small animations but favor transform/opacity and honor reduced motion. |
| Lighthouse mobile categories | SEO 100, Accessibility 100, Best Practices 77 | The Lighthouse SEO score is good for its evaluated checks, but it does not remove the need to fix the JS-only initial document for reliable first paint, social previews, and crawler consistency. Best Practices failures included third-party cookies and DevTools issues. |

The initial response had metadata/OG tags but no meaningful rendered page content inside `#root`; it loaded a large client bundle and then fetched content from PHP API endpoints. The post-hydration DOM had a title and description. This is the primary reason to evaluate SSR/prerendering, alongside actual Core Web Vitals. Keep the existing brand and restrained motion; optimize the measured critical path rather than removing all animation by default.

## Repository hygiene and safety findings

- The current checkout contains credentials in PHP configuration and prior history was already identified as containing a local Worker secrets file. Do not copy any secret values into these plans, logs, examples, or new Worker bindings. Rotate affected credentials and move secrets into environment bindings before a deployment is considered safe.
- A sanitized or sample-only staging database must be separate from production. Initially, use generated sample records and the calculator seed rules only. A sanitized production snapshot is a later optional validation step, only if the user approves and a safe export exists.
- Existing cPanel hosting, database and domain remain authoritative during migration. No production DNS updates, dual writes, migration scripts against production, or writes to the live site are part of the current planning phase.

