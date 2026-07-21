# Gate D review — Approved

## Decision

**Approved.** M13 and M14 independently satisfy the approved Gate D question:
automated enforcement is executable and measured performance is acceptable. No new
blocking architecture, runtime, browser, bundle, or performance issue was found.

This approval does not authorize a production cutover, Legacy removal, or merge to
`main`. Production remains on the Legacy shell and Native remains behind
`/native-preview` until the later roadmap gates.

## M13 enforcement evidence

- The architecture validator checked 82 runtime modules and passed.
- Dependency direction, Native-to-Legacy leakage, component ownership, scene
  isolation, cross-feature public APIs, global DOM patterns, and cycles are enforced.
- The validator is part of `npm run verify` and therefore fails the main pipeline.
- Production navigation, menu hitboxes, hover behavior, route cycles, responsive
  overflow, Footer presence, audio policy, and browser errors passed.
- Browser contract scripts are iframe-aware and create no tracked screenshots.

## M14 performance evidence

- Automatic initial quality selection owns DPR, antialiasing, and AdaptiveDpr policy.
- 13 Vitest tests passed, including high/medium/low/fallback selection contracts.
- Production measured 124.6/139/144 FPS on desktop/tablet/mobile.
- Native measured 103/141/144 FPS on desktop/tablet/mobile.
- Every sample recorded zero frames over 32 ms and zero runtime errors.
- Production and Native dimensions and Canvas counts match M0 at all three viewports.
- Native visual/runtime capture passed desktop, tablet, and mobile at five scroll
  positions per viewport. Captures remained under ignored `work/` evidence only.
- Native scene output is 988.68 kB minified / 268.50 kB gzip and passes the 1.1 MB
  per-file bundle budget.

## Full pipeline

| Check | Result |
|---|---|
| TypeScript | Pass |
| ESLint | Pass, zero warnings |
| Vitest | Pass, 13/13 |
| Architecture and milestone validators | Pass |
| Runtime audit | Pass, 155 files / 18 assets / zero external URLs |
| Production build and Brand Safety | Pass |
| Bundle budget | Pass |
| Production browser contract | Pass |
| Native desktop/tablet/mobile contract | Pass |
| Production and Native performance | Pass |

## Known non-blocking observation

Vite still emits its advisory for the lazy Native scene chunk. This is not a budget
or runtime failure: the chunk is below the approved project limit, loads only on the
Native boundary, and measured performance has no slow frame or browser error. M14 did
not introduce arbitrary chunk boundaries because they would not reduce transferred
code or address a measured bottleneck.

## Rollback

M14 can be reverted independently to restore the static high-quality policy. M13 can
then be reverted independently to return to the Gate C checkpoint. Neither rollback
changes public routes, the Legacy production runtime, content, assets, or visual
scene constants.

## Next authorized roadmap step

M15 — Native Parity Closure. Gate E remains locked until M15 is independently
validated and reviewed.
