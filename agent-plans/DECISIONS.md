# Decision Register

This is the durable record of decisions that affect migration work. It is append-only: if a decision changes, add a new entry that supersedes the old one. Statuses distinguish user-approved constraints from recommendations that still need validation.

## Accepted decisions

### ADR-001 — Keep hosting at zero monthly cost

- **Status:** Accepted by user; hard constraint.
- **Recorded:** 2026-10-17.
- **Decision:** Do not enable paid plans, paid services, or usage that incurs charges. Typical traffic is a few hundred visitors, but plans must still account for free-tier caps and storage/operation overages.
- **Consequences:** Measure expected usage, set budgets/alerts and hard upload guards, and gracefully stop/degrade optional operations before a billable overage. If the free capacity cannot meet requirements, pause and bring options back to the user; never enable billing to bypass a quota.
- **Source:** User response to the hosting-cost question; see migration plan history.

### ADR-002 — JavaScript only; no TypeScript

- **Status:** Accepted by user; hard constraint.
- **Recorded:** 2026-10-17.
- **Decision:** Project-authored migration code uses JavaScript/JSX. Do not add `.ts` or `.tsx` files.
- **Consequences:** Validate package and framework support for JavaScript. Cloudflare Workers run on the Workers runtime with a supported subset of Node.js APIs; this is not a general-purpose Node.js server. Prove compatibility before selecting dependencies.

### ADR-003 — Validate TanStack Start on Cloudflare Workers for SSR

- **Status:** Accepted for planning; technical validation still required.
- **Recorded:** 2026-10-17.
- **Decision:** Use TanStack Start with the Cloudflare Vite plugin as the leading option because the existing React/TanStack frontend can be evolved toward SSR/prerendering. Use D1 for relational data and R2 as the candidate for admin-managed media, subject to capacity and no-cost guards.
- **Consequences:** MySQL-specific schema and queries require SQLite/D1 redesign; MySQL dumps cannot be directly imported. Verify Workers Node compatibility and free plan request/query limits before implementation.
- **Alternatives considered:** Retain Vite SPA and migrate only the API (does not address initial HTML); replace public site with a static-first framework (broader rebuild).
- **Supersedes:** None.

### ADR-004 — Isolate staging from production data and writes

- **Status:** Accepted by user.
- **Recorded:** 2026-10-17.
- **Decision:** Keep the cPanel site and production MySQL live and authoritative during staging. Start staging with synthetic/sample records. Do not connect staging to production or allow staging writes to reach production. A sanitized snapshot is optional only with explicit approval.
- **Consequences:** Any later migration/import requires a safe export, sanitization decision, reconciliation, and tested rollback.

### ADR-005 — Preserve the current AI Worker

- **Status:** Accepted by user; hard boundary.
- **Recorded:** 2026-10-17.
- **Decision:** Do not modify, redeploy, rename, or change routes/secrets for `workers/ai-worker`. If AI migration is needed, create a new parallel Worker with independent config/secrets and a staging endpoint.
- **Consequences:** Keep current production chatbot operational until a separate, explicitly approved endpoint cutover with a rollback plan.

### ADR-006 — Migration work stays on `Website-migration`

- **Status:** Accepted by user; hard boundary.
- **Recorded:** 2026-10-17.
- **Decision:** Commit and push migration-related changes only to `Website-migration`; never to `main`.
- **Consequences:** Confirm branch and working-tree status before changes or publishing.

### ADR-007 — Track work in repository Markdown for cross-session continuity

- **Status:** Accepted by user.
- **Recorded:** 2026-10-17.
- **Decision:** Use root `AGENTS.md`, `agent-plans/PROJECT-STATE.md`, `agent-plans/DECISIONS.md`, and `agent-plans/CHANGELOG.md`, linked from the agent-plans index.
- **Consequences:** Every new agent/session reads the handoff material and verifies actual Git state; decisions and completed work are recorded without relying on chat history.

## Proposed or pending decisions

- The exact app directory and whether `/api/*` handlers ship in the same Worker as SSR are pending the JavaScript runtime spike.
- D1/R2 are the leading storage candidates, not permission to provision them. Real media volume and free quota guard design must be reviewed first.
- Authentication/session/cookie/CSRF policy, password migration, and whether password resets are required remain open.
- Email delivery provider and current free limits remain open.
- Production hostname, redirect map, DNS/cutover timing, and stabilization window remain open and require explicit release approval.
- A sanitized production snapshot is not approved.

