# Local Workers SSR feasibility spike

This isolated JavaScript/JSX app checks whether TanStack Start with the
Cloudflare Vite plugin can serve page-specific metadata and synthetic content
in the initial HTML and return a real HTTP 404 for an unknown route.

Install dependencies, then run `npm run dev`. The local Vite integration uses
the local Workers runtime; it does not deploy or create Cloudflare resources.
The Wrangler configuration contains a D1 binding explicitly marked
`remote: false`; it uses Wrangler's local SQLite-backed D1 simulation only. No
Cloudflare database resource or production route is configured. There is
deliberately no deploy script.

Apply the checked-in schema to the local database from this directory with
`npm run db:migrate:local`. Local D1 state is persisted under the ignored
`.wrangler/state/` directory and is separate from any Cloudflare account
database. Never add `--remote` to this command.

Seed local D1 with fabricated fixtures using `npm run db:seed:local`. This
inserts missing fixture IDs/slugs without overwriting existing rows. If local
D1 state is removed, run the migration command and then the seed command again.
The taxonomy and Maps slice now uses SQLite translations of the source
`categories`, `cities`, `societies`, `phases`, and `map_docs` tables, preserving
their column names, numeric IDs, slugs, nullable media-reference columns,
timestamps, visibility flags, and `map_docs` foreign-key relationships. The
admin API keeps its current shape through an adapter; map location selectors
resolve to source-shaped numeric foreign keys. The staging-only `embed_link`
column is an additive extension for the existing editor. Migrations 0005–0007
add source-shaped `properties`, `detail_descriptions`, `labels`,
`property_labels`, and `property_related_properties` tables. The Property
repository translates stable-slug editor/API values to numeric foreign keys,
and migration 0007 backfills the prior synthetic-only `staging_properties`
rows without deleting that legacy table. It does not copy media rows or assets.

This is a schema-alignment foundation, not a completed production import
pipeline. Files still use a staging-specific directory representation and
should next be mapped to source `properties.is_file = 1`. The staging-only
Property `vat_amount` and `template` form controls have no columns in the
checked-in source schema and are not persisted by the normalized tables; a
separate extension decision is still open. Media tables and binary objects are
excluded; source media-reference columns remain nullable but are not linked to
media records. Future object-storage key mapping remains open. Never import
production data into this local fixture database.

The local dashboard API is disabled by default. To enable its synthetic-only
login while running this app on loopback, create an ignored `.dev.vars` file
with `STAGING_LOCAL_AUTH=enabled` and two distinct password values of at least
20 characters (`STAGING_ADMIN_1_PASSWORD` and `STAGING_ADMIN_2_PASSWORD`).
The only account names are `admin.one@staging.invalid` and
`admin.two@staging.invalid`; there is no password reset, email, or account
management. Do not use production credentials. Property records (including
their public visibility and API fields), session hashes, login-throttle
counters, and profile name/bio are saved to local D1 and survive local Worker
restarts. Other dashboard content and calculator edits still use synthetic
in-memory fixtures and reset when their Worker restarts. Sessions expire after
seven days, are independent across browsers, and are limited to 20 active
sessions globally. The auth implementation also requires a loopback request
host, so it remains disabled on a hosted Worker even if the local-auth variable
is accidentally configured.

Generate two unrelated local-only passwords (at least 20 characters) and put
them in the ignored `apps/ssr-spike/.dev.vars` file as:

```text
STAGING_LOCAL_AUTH=enabled
STAGING_ADMIN_1_PASSWORD=replace-with-a-random-local-password
STAGING_ADMIN_2_PASSWORD=replace-with-a-different-random-local-password
```

Restart the local API after changing `.dev.vars`. From the staging frontend,
open `/login`; its dev build uses `http://127.0.0.1:4175` by default. Do not
copy these passwords into tracked files or reuse any production credential.
The helper checks can be run with `npm run test:admin-auth`; directory API and
local-storage checks can be run with `npm run test:directory`. Test password
values are generated in memory and are not fixed or printed. The D1 storage
test uses Node's built-in SQLite module and requires Node.js 22.5 or later.

The canonical origin is a reserved `.invalid` placeholder. Fixture content is
fabricated and must not be replaced with production records or media.

Authored application and business logic remains JavaScript/JSX. TanStack
generates `src/routeTree.gen.ts` for its route tree and router registration;
that is the only TypeScript file allowed by the project-specific exception.
Keep the generated file ignored and do not add handwritten TypeScript logic.

Run `npm run cf:whoami` to invoke this app's pinned, repo-local Wrangler CLI.
The local dev/build wrapper directs Wrangler's generated config/log files to
an ignored directory inside this app, avoiding writes to the user profile.
