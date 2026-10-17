# Zalmi staging web

This is an isolated TanStack Start + Cloudflare Workers frontend preview. The homepage imports the existing `src/components/home/HeroSection.jsx` directly and uses an empty fixture-only loader; it does not import the legacy API client or connect to cPanel, production MySQL, production media, or the existing PHP API. The Cloudflare configuration is local-preview-only and has no bindings or deploy script.

Run locally from this directory with `npm run dev`. Build with `npm run build`. The previous hand-built Vite replica remains in `src/App.jsx` and is no longer the application entry point.

Generated TanStack route-tree/type files may use TypeScript only as allowed by ADR-012; application code remains JavaScript/JSX. Unmatched routes render the staging not-found page and should return HTTP `404` from the Start runtime.
