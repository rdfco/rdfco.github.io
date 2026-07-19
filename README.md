# FARA 3D platform

FARA is a React, Vite, Three.js/R3F, and GSAP application undergoing a guarded migration from a visually approved legacy Astro/WebGL experience to a native React architecture.

## Runtime modes

| Route | Renderer | Status |
|---|---|---|
| `/` and public content routes | `LegacySite` iframe plus FARA customization runtime | Production visual oracle |
| `/native-preview` | Native React sections, R3F scene, and scoped GSAP | Migration preview; not approved for production |

Do not treat these modes as interchangeable. Production remains protected until native visual, interaction, route, brand-safety, and performance contracts pass.

## Start and verify

Use Windows PowerShell from the repository root, where `package.json` is located:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run verify
```

`verify` runs TypeScript, ESLint, Vitest, native-boundary checks, runtime URL auditing, the production build, brand-safety checks, and bundle budgets. Build success does not replace browser or visual verification.

## Find the right file

| Change | Current source | Important boundary |
|---|---|---|
| Public production behavior | `src/components/LegacySite.jsx`, `src/site-customizer.js`, `src/js/`, `src/navbar/` | Preserve iframe selectors and compare against M0 |
| Native preview UI | `src/native/`, `src/sections/`, `src/components/` | React owns the DOM; no imperative replacement |
| Native R3F scene | `src/scenes/`, `src/native/FaraScene.tsx` | R3F owns the canvas; preserve camera and shader contracts |
| Shared content | `src/data/` | Zod-validated for native; legacy adapters still exist |
| Runtime assets | `public/assets/` | Register provenance and usage before replacement |
| Legacy visual oracle | `public/legacy/`, `public/_astro/` | Protected/generated; do not hand-edit generated bundles |
| Baseline contract | `docs/baselines/m0/` | Versioned metrics and acceptance rules; screenshots remain local in ignored `work/` |

## Documentation

- [Current project map](PROJECT_MAP.md)
- [Architecture overview](docs/architecture/overview.md)
- [Target folder architecture](docs/architecture/target-folder-architecture.md)
- [Folder ownership](docs/architecture/folder-ownership.md)
- [Dependency rules](docs/architecture/dependency-rules.md)
- [Runtime flows](docs/architecture/runtime-flows.md)
- [Development guides](docs/DEVELOPMENT.md)
- [Migration gates](docs/MIGRATION.md)
- [WebGL preservation contract](docs/WEBGL.md)
- [M0 baseline contract](docs/baselines/m0/README.md)
- [Refactoring status](docs/migration/REFACTORING-STATUS.md)

## Safety rules

1. Do not change production appearance, selectors, behavior, or assets as part of structural refactoring.
2. Keep native work behind `/native-preview` until explicit parity approval.
3. Never hand-edit `public/_astro/` or `dist/`.
4. Do not remove Legacy until production cutover has remained stable and an explicit removal approval is given.
5. Implement one milestone at a time and validate it against the M0 contract.
