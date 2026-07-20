# M5 review — Shared Three.js Runtime Foundations

- Status: Complete
- Date: 2026-07-20
- Branch: `fara/refactoring-roadmap`
- Production cutover: Not authorized

## Objective

Create a reusable and typed R3F Canvas foundation without changing scene composition,
camera motion, materials, shaders, assets, visual output, or performance policy.

## Delivered

- Shared `ThreeCanvas` lifecycle for Canvas, Suspense, preload, and adaptive DPR.
- Typed and centralized active camera, DPR, and WebGL renderer configuration.
- Shared high/medium/low/fallback performance-tier vocabulary.
- Cross-foundation runtime types.
- Experience store consumes the shared performance-tier contract.
- FARA Native entry consumes the public `src/three` API.
- Automated architectural boundary validation.
- Tests locking the complete active M0 Canvas values and tier invariants.

## Preserved boundaries

- `FaraLegacyScene` implementation is unchanged.
- GLB loading and preload calls remain unchanged.
- Camera curves, scroll mapping, visibility thresholds, transforms, materials, shaders,
  background colors, and fog values remain scene-owned and unchanged.
- Scene/model/camera/material APIs reserved for M8–M11 remain unimplemented.
- Production remains Legacy; Native remains `/native-preview`.

## Rollback

Revert the single M5 commit. `FaraScene.tsx` can return to directly composing the same
Canvas primitives because no scene implementation or asset path moved.

## Validation

- TypeScript and ESLint with zero warnings: passed
- Vitest: 7 files and 12 tests passed
- Native and Three.js architectural boundaries: passed
- Content, asset, and runtime audits: passed
- Production build, brand safety, and bundle budget: passed
- Native scene chunk: 999.89 kB / 269.26 kB gzip, within the approved budget
- Production and Native at desktop, tablet, and mobile: zero browser/request errors
- M0 dimensions, Canvas counts, WebGL2, sampled 144 FPS, and zero slow frames: unchanged
- No screenshot or binary artifact added to Git

## Outcome

M5 is independently complete. The next step is Gate B, a combined audit of M3, M4,
and M5; this review does not itself approve Gate B.
