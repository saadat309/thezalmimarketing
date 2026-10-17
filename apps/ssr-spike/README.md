# Local Workers SSR feasibility spike

This isolated JavaScript/JSX app checks whether TanStack Start with the
Cloudflare Vite plugin can serve page-specific metadata and synthetic content
in the initial HTML and return a real HTTP 404 for an unknown route.

Install dependencies, then run `npm run dev`. The local Vite integration uses
the local Workers runtime; it does not deploy or create Cloudflare resources.
The Wrangler configuration has no bindings, remote resources, secrets, or
production routes. There is deliberately no deploy script.

The canonical origin is a reserved `.invalid` placeholder. Fixture content is
fabricated and must not be replaced with production records or media.

Authored application and business logic remains JavaScript/JSX. TanStack
generates `src/routeTree.gen.ts` for its route tree and router registration;
that is the only TypeScript file allowed by the project-specific exception.
Keep the generated file ignored and do not add handwritten TypeScript logic.

Run `npm run cf:whoami` to invoke this app's pinned, repo-local Wrangler CLI.
The local dev/build wrapper directs Wrangler's generated config/log files to
an ignored directory inside this app, avoiding writes to the user profile.
