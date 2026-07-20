# FARA refactoring roadmap status

## Current position

**M4 — Configuration and Content Boundaries: complete**

Gate A is approved. M0 established rollback-safe measurable contracts, M1 documented
the current and target architecture, and M2 materialized the target ownership skeleton.
M3 has now established one complete, typed asset registry without relocating assets or
changing public URLs.

## Completed

- [x] Dedicated branch: `fara/refactoring-roadmap`
- [x] M0 production and native-preview contracts at desktop, tablet, and mobile
- [x] M0 performance, WebGL environment, acceptance, and reproduction contracts
- [x] M1 current/target architecture, ownership rules, runtime flows, and ADR-001
- [x] M2 target folder skeleton, public boundaries, and `@/*` alias
- [x] Gate A independent audit, full verification pipeline, and browser smoke approval
- [x] M3 complete inventory of all 50 physical runtime assets
- [x] M3 typed canonical registry with ownership, consumers, provenance, and lifecycle
- [x] M3 compatibility adapter preserving current scene asset paths
- [x] M3 registry validator, generated size inventory, and runtime-audit integration
- [x] M3 asset naming, placement, lifecycle, and replacement governance
- [x] M3 full verification pipeline and production/native browser contract
- [x] M4 canonical shared content boundary and complete Zod contract
- [x] M4 typed application, route, environment, and Legacy-shell configuration
- [x] M4 compatibility adapters preserving Legacy and pre-M4 imports
- [x] M4 content-source ownership registry and automated boundary validation
- [x] M4 Native consumers migrated to the public content API
- [x] M4 full verification pipeline, production build-copy check, and browser contract

## Next

- [ ] **M5 — Shared Three.js Runtime Foundations**

Gate B remains unavailable until M3, M4, and M5 independently pass validation.
