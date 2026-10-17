# Local Workers SSR feasibility spike

This isolated JavaScript/JSX app checks whether TanStack Start with the
Cloudflare Vite plugin can serve page-specific metadata and synthetic content
in the initial HTML and return a real HTTP 404 for an unknown route.

Install dependencies, then run `npm run dev`. The local Vite integration uses
the local Workers runtime; it does not deploy or create Cloudflare resources.
The Wrangler configuration has no bindings, remote resources, secrets, or
production routes. There is deliberately no deploy script.

The local dashboard API is disabled by default. To enable its synthetic-only
login while running this app on loopback, create an ignored `.dev.vars` file
with `STAGING_LOCAL_AUTH=enabled` and two distinct password values of at least
20 characters (`STAGING_ADMIN_1_PASSWORD` and `STAGING_ADMIN_2_PASSWORD`).
The only account names are `admin.one@staging.invalid` and
`admin.two@staging.invalid`; there is no password reset, email, or account
management. Do not use production credentials. Sessions and dashboard edits
are process-local and disappear when the local Worker restarts. The auth
implementation also requires a loopback request host, so it remains disabled
on a hosted Worker even if the local-auth variable is accidentally configured.

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
The helper checks can be run with `node scripts/test-admin-auth.js` and
`node scripts/test-admin-data.js`; their password values are generated in
memory and are not fixed or printed.

The canonical origin is a reserved `.invalid` placeholder. Fixture content is
fabricated and must not be replaced with production records or media.

Authored application and business logic remains JavaScript/JSX. TanStack
generates `src/routeTree.gen.ts` for its route tree and router registration;
that is the only TypeScript file allowed by the project-specific exception.
Keep the generated file ignored and do not add handwritten TypeScript logic.

Run `npm run cf:whoami` to invoke this app's pinned, repo-local Wrangler CLI.
The local dev/build wrapper directs Wrangler's generated config/log files to
an ignored directory inside this app, avoiding writes to the user profile.
