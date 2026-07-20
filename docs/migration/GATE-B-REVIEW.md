# Gate B review package

- Status: Approved
- Approved: 2026-07-20
- Scope: M3 Asset Registry, M4 Content/Configuration, M5 Three.js Foundations
- Branch: `fara/refactoring-roadmap`
- Production cutover: Not authorized

## Approval question

Are asset, content, and configuration sources predictable and validated?

**Decision: Yes.** Each domain has one documented source of truth, an explicit public
boundary, ownership metadata, automated validation, a compatibility/rollback strategy,
and fresh runtime evidence against the fixed M0 contract.

## M3 independent audit

- `src/assets/asset-registry.json` is the only canonical asset inventory.
- 50 records have 50 unique IDs and 50 unique public paths.
- All 50 records have explicit ownership, consumers, provenance, lifecycle, and
  approved status.
- The registry matches all 50 physical runtime files totaling 20,350,937 bytes.
- All 18 source-owned runtime references resolve to registered physical files.
- Regenerating `docs/generated/asset-inventory.json` produces no Git diff.
- `asset-ownership.json` is a compatibility pointer, not a duplicate registry.
- No binary asset or public URL changed during M3–M5.

## M4 independent audit

- `src/content` is the canonical shared content and schema boundary.
- The complete shared object passes its Zod contract.
- 12 content sources have 12 unique paths and explicit consumers/ownership.
- Five `src/data` compatibility adapters point to the canonical content boundary.
- 14 Native-owned consumers do not bypass the public content API.
- `src/config/app-config.ts` owns routes, environment gate, Legacy shell protocol,
  sandbox, iframe source, and readiness timing.
- Route-specific `src/navbar/pages` content remains explicitly legacy-protected.
- Production build contains the canonical plain-JavaScript content and its adapters.

## M5 independent audit

- `src/three/core/ThreeCanvas.tsx` is the only shared owner of the R3F Canvas lifecycle.
- Active camera, DPR, renderer, preload, and adaptive-DPR values are typed and tested.
- One Native entry consumes the public Three.js boundary.
- 13 shared Three.js files pass dependency and DOM-ownership validation.
- Scene, model, camera, and material boundaries reserved for M8–M11 remain deferred.
- `FaraLegacyScene`, model paths, camera curves, scroll mapping, materials, shaders,
  background colors, and fog values remain unchanged.

## Rollback and commit isolation

Each milestone is independently revertible:

| Milestone | Commit |
|---|---|
| M3 | `c545435` — complete asset registry |
| M4 | `5f6a33d` — content and config boundaries |
| M5 | `0230907` — shared Three.js runtime foundations |

Production remains on `LegacySite`; `/native-preview` remains non-production. No M3–M5
commit changes the M0 baseline, performs a cutover, removes Legacy, or requires a binary
rollback.

## Fresh Gate B validation

- Clean branch and synchronized remote before review: passed
- TypeScript: passed
- ESLint with zero warnings: passed
- Vitest: 7 files and 12 tests passed
- Native boundary: passed
- Three.js boundary: passed
- Content boundary: 12 sources, 14 consumers, 5 adapters passed
- Asset registry: 50 records, 50 files, 18 source references passed
- Runtime audit: 124 source files, zero external URLs
- Production build and brand safety: passed
- Bundle budget: passed
- Production **built preview** at 1440×900, 768×1024, and 390×844: zero errors
- Native Preview at the same viewports: zero errors
- M0 dimensions and Canvas counts: exact match in all six comparisons
- WebGL2, sampled 144 FPS, and zero frames over 32 ms: passed
- No screenshot, image, binary, or generated-inventory drift: passed

## Known debt carried forward

- Generated Legacy CSS still references missing historical font variants.
- Legacy route datasets stay protected until their owning route migrates.
- Native scene chunk remains above Vite's generic 500 kB warning but within the
  project bundle budget; measured optimization remains M14.
- Automatic performance-tier selection is not enabled.
- The known stale interaction assumptions in `browser-check.mjs` and
  `verify-navigation.mjs` remain separately scoped tooling debt.

None of these items was introduced by M3–M5 or invalidates the Gate B ownership,
validation, rollback, or runtime-contract criteria.

## Gate B decision

Gate B is approved. M3–M5 establish predictable and validated asset, content,
application-configuration, Canvas-runtime, and performance-policy sources without
parity loss.

Approval authorizes planning and implementation of M6 on the same protected branch.
It does not authorize Gate C, production cutover, Legacy removal, deployment, or merge.
