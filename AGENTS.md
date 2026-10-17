# Agent Working Agreement

This repository contains a live website and a staged migration. Follow these instructions at the start of every session or handoff.

## Read first

1. Read this file.
2. Check the actual Git branch, working-tree status, and recent commits. The repository is authoritative for what is present; status notes can be stale.
3. Read `agent-plans/PROJECT-STATE.md`, then the relevant decision records in `agent-plans/DECISIONS.md`, the latest entry in `agent-plans/CHANGELOG.md`, and the relevant roadmap/design documents.
4. Confirm the requested task and its authorization. A migration plan is not approval to implement every phase or deploy anything.

## Project constraints and safety

- All migration-related changes belong on `Website-migration`. Never push migration work to `main`. Do not switch branches with uncommitted work unless its owner has explicitly directed how to handle it.
- Migration code must use JavaScript (`.js`/`.jsx`); do not add TypeScript (`.ts`/`.tsx`). Cloudflare Workers use the Workers JavaScript runtime with only supported Node.js compatibility APIs, not a general-purpose Node.js server. Check dependencies against the runtime before adopting them.
- Zero monthly cost is a hard requirement. Do not enable paid plans, paid services, or usage that can incur charges. Check current vendor limits before provisioning; define usage guards before relying on metered services. If the free budget is at risk, stop and report the choice needed rather than enabling billing.
- Keep the current cPanel site, production MySQL, and production DNS unchanged during staging. Never point staging at production data or write from staging to production. Use sample data unless the user explicitly approves a sanitized snapshot and its handling.
- Do not modify, redeploy, rename, or change routes/secrets for `workers/ai-worker`. If AI migration is requested, create a separate Worker in a new directory with separate config, secrets, and staging endpoint; a production route change requires explicit approval.
- Credentials have been found in project files and prior Git history. Do not print, copy, or log secret values. Treat those credentials as needing rotation before any deployment.
- Do not include personal production records or credentials in plans, fixtures, logs, screenshots, commits, or agent handoffs.

## Decision and work tracking

- Treat explicit user directions as authoritative. `agent-plans/DECISIONS.md` records decisions; mark proposals and assumptions clearly and never present them as approved.
- Before making a material architectural or behavior change, check whether it is covered by an accepted decision. If not, describe the decision and obtain the user's approval before implementing it.
- After each completed task, append a factual entry to `agent-plans/CHANGELOG.md` and refresh `agent-plans/PROJECT-STATE.md` with the current phase, completed work, open questions, and next safe action. Record checks actually performed; never claim unrun tests or deployments.
- Keep the state file concise and current. Keep the change log append-only. Do not rewrite historical decisions; supersede them with a new linked decision entry.
- When feasible, include the relevant tracking updates in the same commit as the migration changes. Commit and push only to `Website-migration` when the user has asked for publishing. Git history is authoritative for commit IDs.
- At task end, report the files changed, branch/commit, verification performed, remaining decisions, and any production or cost implications.
