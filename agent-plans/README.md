# Website Migration Plans

This folder is the working roadmap for migrating The Zalmi Marketing website from the current cPanel PHP/MySQL deployment to a Cloudflare-hosted JavaScript application. It records the inspected baseline, approved direction, constraints, and implementation order. It is planning material; it does not itself change the application or Cloudflare resources.

## Documents

1. [Inspection and performance baseline](00-inspection-and-baseline.md) — repository, schema, current architecture, and live homepage observations.
2. [Architecture direction and decisions](01-architecture-direction.md) — approved constraints, recommended target, alternatives, and decisions still to settle.
3. [Grand migration roadmap](02-grand-migration-roadmap.md) — what to do first, sequencing, completion gates, and production rollback approach.

## Cross-session handoff

The repository root [AGENTS.md](../AGENTS.md) defines what every new session or agent reads and how work must be tracked. Read in this order:

1. `AGENTS.md` — stable safety rules and workflow.
2. [Current project state](PROJECT-STATE.md) — short, replaceable checkpoint; verify its branch/status against Git.
3. [Decision register](DECISIONS.md) — accepted constraints and open choices.
4. [Latest work log](CHANGELOG.md) — completed tasks, paths, verification, and Git references.
5. The architecture, inspection, or roadmap document relevant to the task.

After each completed task, append the work log and refresh the current state. Record only verified outcomes; do not put credentials or production personal data in handoff files. The full history and diffs remain in Git on `Website-migration`.

## Decisions already given

- Zero monthly hosting cost is a hard requirement. Typical traffic is a few hundred visitors, but capacity and resource usage still need measurement.
- The migration backend and frontend must use JavaScript; do not introduce TypeScript.
- The target should use server rendering and/or static prerendering for fast initial content and SEO, while retaining restrained, lightweight animation.
- Build and compare on Cloudflare staging while the cPanel deployment remains the live production site.
- Use sample data first. Never connect staging to the live database or let staging writes affect production.
- Do not modify or deploy over `workers/ai-worker`. If the AI service is migrated, create a separate replacement Worker and validate it in parallel.
- Keep every migration-related change on the `Website-migration` branch. Do not push migration work to `main`.
- Production DNS/cutover is a separate, explicit decision after acceptance; retain the cPanel site as the rollback target until the new site is proven.

## Runtime clarification

Cloudflare Workers run JavaScript in Cloudflare's Workers runtime. Node.js compatibility provides supported Node APIs, but it is not the same as deploying a general-purpose Node.js server. This is the recommended way to meet both the JavaScript requirement and Cloudflare hosting goal; the runtime boundary must be checked against dependencies before implementation.

## Cost guardrail

“Free” means no paid Workers plan, no paid external service, and no usage that incurs a charge. Static assets can remain free and unlimited under the documented Workers model, while SSR/API calls consume Workers usage. D1 has daily read/write limits and account storage limits. R2 includes a monthly free allowance, but usage above it can be billed. Therefore, inventory media first, add application-side upload/storage guards and usage alerts, and stop or degrade optional writes before a limit can create a charge. Do not activate a paid plan or billing-backed service to work around a limit.

Current Cloudflare documentation consulted on 2026-10-17:

- [TanStack Start on Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/)
- [Workers and D1 pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [D1 limits](https://developers.cloudflare.com/d1/platform/limits/)
- [Workers static asset billing and limits](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [R2 pricing](https://developers.cloudflare.com/r2/pricing/)
