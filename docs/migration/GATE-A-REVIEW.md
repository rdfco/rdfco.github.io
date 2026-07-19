# Gate A review package

- Status: Approved
- Approved: 2026-07-19
- Scope: M0 Baseline, M1 Documentation, M2 Target Skeleton
- Branch: `codex/fara-refactor-roadmap`

## M0 evidence

- Production Legacy and Native Preview were recorded separately at desktop, tablet, and mobile.
- Compact layout, content, error, WebGL, resource, heap, and frame reports are versioned under `docs/baselines/m0`.
- Generated screenshots were removed and remain local-only artifacts by policy.
- Production remains the protected visual oracle.

## M1 evidence

- Current architecture and target architecture are documented separately.
- Folder ownership, dependency direction, runtime flows, migration gates, and ADR-001 are documented.
- Task guides exist for adding a page, scene, model, and asset.
- Stale `main.jsx`, `App.jsx`, and previous migration-branch references were removed.

## M2 evidence

- 41 target directories exist and have local ownership README files.
- Empty public TypeScript boundaries identify future cross-domain APIs without exporting runtime code.
- `@/*` resolves to `src/*` consistently in TypeScript, Vite, and Vitest.
- A resolver test passes; no active runtime import was rewritten.
- Existing `src/data`, `src/native`, `src/scenes`, `src/store`, legacy adapters, assets, and generated bundles were not moved.

## Validation

- TypeScript: passed
- ESLint with zero warnings: passed
- Vitest: 3 files and 3 tests passed
- Native-boundary check: passed
- Runtime external-URL audit: passed
- Production build: passed
- Brand-safety checks: passed
- Bundle budget: passed
- Production browser load at 1440x900, 768x1024, and 390x844: passed with zero browser/request errors
- Native Preview browser load at the same viewports: passed with zero browser/request errors
- M0 document dimensions remained unchanged for both renderers
- No screenshots were added to Git

## Known tooling debt

`scripts/browser-check.mjs` and `scripts/verify-navigation.mjs` currently assume DOM elements that can be absent and fail before completing their interaction checks. M2 did not modify these scripts because interaction-tool repair is outside the target-skeleton scope. Frame-aware route loading, WebGL availability, dimensions, and browser/request error checks passed through `capture-performance-baseline.mjs`.

This tooling debt does not indicate a runtime regression from M2, but it should receive an explicitly scoped repair before M13 turns browser interaction checks into enforced contracts.

## Gate A decision

Gate A passed a clean-branch audit, independent filesystem and documentation checks, the complete verification pipeline, and fresh Production/Native browser smoke checks at all M0 viewports. The baseline policy, source-of-truth documentation, ownership rules, target tree, empty public boundaries, and single `@/*` alias are accepted.

Approval authorizes M3 planning/implementation in a future session. It does not authorize later milestones, production cutover, or Legacy removal.
