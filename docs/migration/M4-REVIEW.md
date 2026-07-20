# M4 review — Configuration and Content Boundaries

- Status: Complete
- Completed: 2026-07-20
- Branch: `fara/refactoring-roadmap`
- Production cutover: Not authorized

## Objective

Make shared content and application configuration predictable, typed, validated, and
discoverable without changing visible copy, routes, Legacy behavior, or Native layout.

## Delivered

- Canonical shared content and footer ownership under `src/content`.
- Complete Zod contract for the current shared site content.
- Public content API used by Native UI and section consumers.
- Typed application configuration for routes, environment gate, iframe contract,
  sandbox, message protocol, and readiness timing.
- Five compatibility adapters preserving pre-M4 and Legacy import paths.
- Content-source registry classifying 12 canonical or legacy-protected sources.
- Automated boundary validation and focused content/config tests.
- Production build copies the canonical plain-JavaScript content required by the
  direct browser-executed Legacy runtime.

## Preserved boundaries

- Production `/` remains the protected Legacy iframe.
- `/native-preview` remains the non-production Native renderer.
- All route paths, postMessage names, timeout values, visible strings, section/card
  counts, public asset paths, and Legacy page datasets remain unchanged.
- Route-specific data under `src/navbar/pages` remains legacy-protected.
- Scene/camera/material/animation configuration remains scene-owned for M5 and later.

## Validation

- TypeScript: passed
- ESLint with zero warnings: passed
- Vitest: 6 files and 9 tests passed
- Native boundary: passed
- Content boundary: 12 sources, 14 consumers, and 5 adapters passed
- Asset registry: 50 records and 50 physical files passed
- Runtime audit: zero external URLs passed
- Production build, brand safety, and bundle budget: passed
- Required `dist/src/content` and compatibility adapter files: present
- Production and Native browser checks at desktop, tablet, and mobile: zero errors
- M0 document dimensions, Canvas counts, WebGL2, and sampled 144 FPS: unchanged
- No screenshots or image artifacts added to Git

## Rollback

Revert the single M4 commit. Existing import paths remain represented by adapters, no
Legacy dataset was deleted, and no public URL or production-route ownership changed.

## Next

M5 may establish shared Three.js runtime contracts. Gate B remains locked until M5
passes independently and M3–M5 receive a combined gate review.
