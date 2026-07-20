# Gate C review — Runtime Ownership

- Status: Approved
- Date: 2026-07-20
- Branch: `fara/refactoring-roadmap`
- Scope: M6–M12

## Approval decision

Gate C is approved. Application, feature, scene, model, camera, material, shader, and
GSAP ownership boundaries are complete for this phase without an observed M0 contract
regression. Production remains on the protected Legacy path and Native remains isolated
at `/native-preview`; this approval does not authorize cutover, Legacy removal, merge,
or deployment.

## Gate C remediation audit

### M11 — Shader ownership

- All seven active recovered shader pairs are colocated under
  `src/three/scenes/fara/shaders`.
- Their normalized Git blobs exactly match the original recovered sources.
- The canonical JSON manifest records all ten recovered shaders: seven `active` and
  three `unused` (`Cloud`, `Mountain`, and `Sky`), with owner and provenance.
- Runtime shader discovery and the validator both consume the manifest.
- The validator derives its inventory from the manifest and physical shader roots; it
  contains no hard-coded shader-name inventory.
- No active FARA runtime module imports `src/scenes/shaders/legacy`.

### M10 — Browser scroll adapter

- Shared camera progress calculation remains in `src/three/camera`.
- Browser scroll acquisition belongs to the explicit FARA scene adapter.
- All executable files under the shared camera boundary are free of `window`,
  `document`, `scrollY`, and `matchMedia`.

### M12 — Reduced motion

- The home reveal lifecycle consumes the existing `useReducedMotion` policy.
- The preference is available on the initial render and reacts to preference changes.
- Reduced motion creates zero ScrollTrigger instances, runs no moving reveal animation,
  and clears transform/opacity so every reveal element remains visible.
- Normal motion retains the approved reveal values and four active ScrollTriggers.

## Automated validation

- TypeScript: passed.
- ESLint: passed with zero warnings.
- Vitest: 7 files / 12 tests passed.
- Application, feature, scene, model, camera, material, animation, Three.js, content,
  asset, Native-boundary, and runtime-audit validators: passed.
- Production build and brand-safety verification: passed.
- Bundle budget: passed.
- Known Vite warning for the lazy Native scene chunk remains within the approved M0/M14
  boundary and is not a Gate C regression.

## Browser contract

Production and Native were checked at desktop (1440×900), tablet (768×1024), and mobile
(390×844). Production text, counts, dimensions, menu states, and browser errors match the
versioned M0 JSON contract. Native dimensions and browser errors also match its M0
contract. Generated screenshots were visually reviewed and removed after validation.

| Runtime | Desktop height | Tablet height | Mobile height | Errors |
|---|---:|---:|---:|---:|
| Production | 7,678 | 8,453 | 8,794 | 0 |
| Native Preview | 9,530 | 10,605 | 10,371 | 0 |

## Performance contract

| Runtime | Canvas | Context | FPS | Frames over 32 ms | Errors |
|---|---:|---|---:|---:|---:|
| Production, all viewports | 2 | WebGL2 | 144 | 0 | 0 |
| Native Preview, all viewports | 1 | WebGL2 | 144 | 0 | 0 |

Production decoded resources changed by approximately 0.007% from M0. Native decoded
resources changed by approximately 0.54% after introducing the manifest-backed shader
library. Document dimensions, Canvas ownership, WebGL context, sampled frame rate,
slow-frame count, runtime errors, and the approved bundle budget remain within contract.
Measured heap remained environment-sensitive as documented in M0 and introduced no
frame or budget failure.

## Rollback and next boundary

M6–M12 remain linear independent commits, followed by this Gate C closure commit. The
previous validated rollback point is Gate B. Gate D remains locked until M13 and M14
independently pass. No merge to `main` is part of this approval.
