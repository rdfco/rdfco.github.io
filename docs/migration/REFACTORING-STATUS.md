# FARA refactoring roadmap status

## Current position

**M2 — Target Architecture Skeleton: complete**

Runtime implementation has not moved. M0 established rollback-safe measurable contracts. M1 documented the current and target architecture. M2 materialized the target ownership skeleton, empty public boundaries, and a consistent `@/*` source alias without changing active runtime imports.

## Completed

- [x] Dedicated branch: `codex/fara-refactor-roadmap`
- [x] M0 production contract at desktop, tablet, and mobile
- [x] M0 native-preview snapshot at desktop, tablet, and mobile
- [x] M0 performance and WebGL environment snapshot
- [x] M0 acceptance and reproduction contract
- [x] M1 current project map and documentation index
- [x] M1 target folder architecture and folder ownership rules
- [x] M1 dependency rules and runtime flows
- [x] M1 page, scene, model, and asset guides
- [x] M1 ADR-001 Legacy/Native boundary
- [x] M2 target `src`, `src/three`, `public/assets`, `docs`, and `tests` skeleton
- [x] M2 local ownership README files and empty public boundaries
- [x] M2 TypeScript, Vite, and Vitest `@/*` alias with resolver test

## Next

- [ ] **Gate A — Architecture foundation approval**

Gate A is ready for review after M2 validation. No Gate B implementation may begin until Gate A is explicitly approved.
