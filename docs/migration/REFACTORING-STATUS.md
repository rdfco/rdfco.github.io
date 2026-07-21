# FARA refactoring roadmap status

## Current position

**Gate E — Native Parity Review: not approved**

Gate A is approved. M0 established rollback-safe measurable contracts, M1 documented
the current and target architecture, and M2 materialized the target ownership skeleton.
M3–M5 established validated asset, content, application-configuration, and shared
Canvas-runtime foundations without changing public URLs or the protected visual
contract. Gate B independently approved those sources and rollback boundaries.

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
- [x] M5 shared Canvas, Suspense, preload, and adaptive-DPR lifecycle
- [x] M5 typed active camera, DPR, renderer, and performance-tier contracts
- [x] M5 public Three.js API consumed by Native and the experience store
- [x] M5 architectural validator preserving M8–M11 deferred boundaries
- [x] M5 tests locking active M0 Canvas values and tier invariants
- [x] M5 full verification pipeline and production/native browser contract
- [x] Gate B independent source-of-truth, ownership, rollback, and dependency audit
- [x] Gate B full verification pipeline and built-Production/Native browser contract
- [x] M6 application bootstrap, provider, route, guard, and page ownership boundaries
- [x] M6 full verification and production/native browser contract
- [x] M7 home and navigation feature ownership with compatibility section adapters
- [x] M7 full verification and production/native browser contract
- [x] M8 typed scene registry and colocated FARA scene ownership
- [x] M8 compatibility scene adapters and full browser contract
- [x] M9 canonical model registry derived from the asset source of truth
- [x] M9 shared GLTF loader/preload contracts and model-ID scene consumption
- [x] M9 model boundary validator and full production/native browser contract
- [x] M10 shared camera-path extraction and normalized scroll contracts
- [x] M10 scene-owned camera configuration and isolated frame runtime
- [x] M10 camera boundary validator and full production/native browser contract
- [x] M11 scene-owned recovered material runtime and compatibility adapter
- [x] M11 shared ShaderMaterial factory and typed active-shader manifest
- [x] M11 material/shader validator and full production/native browser contract
- [x] M12 shared GSAP/ScrollTrigger registration and public animation runtime
- [x] M12 feature-owned reveal configuration, lifecycle, and cleanup
- [x] M12 animation validator and full production/native browser contract
- [x] Gate C active Shader colocation and manifest-derived ownership validation
- [x] Gate C DOM-free shared Camera runtime with explicit browser scroll adapter
- [x] Gate C initial and reactive reduced-motion behavior with zero reduced-motion triggers
- [x] Gate C full verification, browser, performance, and runtime ownership audit
- [x] M13 executable dependency-direction, cycle, feature-API, and DOM boundary enforcement
- [x] M13 frame-aware browser interaction contracts with no repository screenshots
- [x] M14 capability-driven initial quality-tier selection with deterministic tests
- [x] M14 Production and Native performance measurements at desktop, tablet, and mobile
- [x] Gate D independent enforcement, browser, runtime, bundle, and performance audit

## Next

- [ ] **M15 — Native Parity Closure (blocked by parity gaps)**

Gate D is approved. Gate E is not approved: Native has measured visual, layout, and
route-ownership gaps against the protected Production contract. M16 and M17 remain
locked. Production remains on Legacy; no cutover, Legacy removal, deployment, or
merge is authorized.
