# Zalmi Marketing — Dashboard and Public Parity Plan

**Date:** 2026-10-28  
**Branch:** `Website-migration`  
**Status:** Active implementation plan; local-only until separately authorized for deployment  
**Scope:** Dashboard parity, calculator import verification, Landing Page wiring, and public visual parity

## Goal

Bring the migration UI and behavior closer to the checked-in legacy source before production preparation, while preserving the existing source data contracts, synthetic/local data boundary, zero-cost requirement, and `workers/ai-worker` protection.

## Findings already verified

- The attached `calculator-transfer-fees.csv` contains 477 data rows.
- Current CSV preparation validates all 477 rows successfully with zero validation errors.
- The earlier precision, reference-size, and Sports Fund validation errors are not reproduced by the current preparation function.
- Full application may still require matching local city, society, phase, and block records; this must be tested through the dashboard without touching production data.
- The legacy source contains the homepage file marquee, Lenis provider, AI chat widget, floating widgets, DHA assistance popup, and popup-section handling.
- The legacy source remains the visual/interaction baseline; `src/` must remain unchanged.

## Work order

### 1. Dashboard foundation

- Compare every dashboard route with its legacy form structure.
- Correct searchable selectors, optional values, and “None” selection behavior.
- Match legacy labels, buttons, icons, tables, dialogs, spacing, empty states, and error states.
- Ensure selected labels and multi-value relationships support drag-and-drop and keyboard reordering.
- Reduce oversized radio controls and preserve accessible radio semantics.

### 2. Calculator dashboard and CSV import

- Reproduce the attached CSV through the actual local dashboard import flow.
- Separate CSV validation errors from local taxonomy/reference lookup errors.
- Fix only confirmed staging defects while preserving source field names and decimal precision.
- Compare Rates, Transfer Fees, Fees, Tax Rates, and Fee Rules forms to the legacy source.
- Do not add unsupported Fee Rules CSV import or calculator PDF workflows.

### 3. Landing Page data flow

- Verify that dashboard visibility changes affect the public homepage.
- Verify that edited headings, descriptions, popup delay, embed text, and selected cards render publicly.
- Trace the local D1/admin/public adapters and fix confirmed stale-data or missing-read issues.
- Preserve fixed section identity/order and synthetic/local storage boundaries.

### 4. Public visual parity

- Restore the legacy homepage file marquee.
- Compare fonts, colors, SVGs, icons, backgrounds, cards, spacing, filters, hover states, and entrance animations.
- Match Properties, Maps, and Files filter layout and positioning to the checked-in legacy routes.
- Match calculator result and expense-breakdown presentation to the legacy source.
- Investigate delayed lower-page rendering and optimize only confirmed local causes.

### 5. Shared widgets and scrolling

- Recreate the legacy popup and floating widget UI where source behavior is available.
- Verify Lenis/smooth-scroll behavior and dependency compatibility before adding or enabling it.
- Keep user-facing copy focused on the product rather than migration terminology, while retaining required crawl and safety controls.

### 6. AI chatbot boundary

- Audit the legacy AI chat widget and its existing `workers/ai-worker` integration.
- Do not modify, rename, redeploy, or change routes/secrets in `workers/ai-worker`.
- Connect the staging UI only if the existing integration can be used without production credentials, production route changes, or production data access.
- If a separate staging endpoint or secret is required, stop and request a separate isolated Worker decision.

### 7. Verification and tracking

- Use local Chrome/DevTools checks for public and authenticated dashboard routes.
- Run calculator import, admin/API, SSR route, accessibility, security, build, and `git diff --check` checks.
- Update `PROJECT-STATE.md` and append a factual `CHANGELOG.md` entry after each completed slice.
- Do not commit or push unless explicitly authorized.

## Explicit exclusions

- No production MySQL, production records, credentials, DNS, deployment, or paid service changes.
- No changes to legacy `src/`.
- No changes to `workers/ai-worker` without a separate approved decision.
- No unsupported Fee Rules import or calculator PDF workflow.
- Media remains local/temporary unless a separate production storage decision is approved.

## Current next action

Verify the attached Transfer Fees CSV through the authenticated local dashboard, then fix the first confirmed dashboard parity defect and record the result in the project state and changelog.
