# The Zalmi Marketing AI Worker - Environment Guide

## 1. Development (Local)
Use the `development` environment configured in `workers/ai-worker/wrangler.jsonc`. This environment uses your local `.dev.vars` for secrets and local API base URLs under `Thezalmimarkettingsajidmahmood@gmail.com's Account`.

*   **Start Local Services:**
    *   **PHP:** `php -S localhost:8000` (from project root)
    *   **Worker:** 
        ```bash
        cd workers/ai-worker
        npx wrangler dev --env development
        ```
    *   **React:** Ensure your `.env` contains:
        ```text
        VITE_AI_API_URL=http://localhost:8787/chat
        ```
        Then run: `npm run dev`

## 2. Production (Cloudflare)
Use the `production` environment configured in `workers/ai-worker/wrangler.jsonc` under `Thezalmimarkettingsajidmahmood@gmail.com's Account` (`caab5e755465633ad482c8208ce61787`). In production, the worker is mapped to the custom domain route `ai.thezalmimarketing.com`.

*   **Configure Production Secrets:**
    Ensure production secrets are set via the CLI once:
    ```bash
    cd workers/ai-worker
    npx wrangler secret put AI_INTERNAL_SECRET --env production
    ```
    *Enter your production secret when prompted.*

*   **Deploy to Production:**
    ```bash
    cd workers/ai-worker
    npx wrangler deploy --env production
    ```
    *   **React Production API URL:**
        ```text
        VITE_AI_API_URL=https://ai.thezalmimarketing.com/chat
        ```

## Architecture Summary
- **Dynamic Routing & Accounts:** `wrangler.jsonc` manages account ID (`caab5e755465633ad482c8208ce61787`), environment-specific `vars`, and custom domain routes (`ai.thezalmimarketing.com`).
- **Secret Isolation:** 
    - **Dev:** Uses local `.dev.vars` file.
    - **Prod:** Uses Cloudflare server-side secret store.
- **Frontend Agnostic:** React uses `import.meta.env.VITE_AI_API_URL`, allowing different URLs for dev vs prod without code changes.
