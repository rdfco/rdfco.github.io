# FARA current project map

This file describes the repository as it exists now. It is not the target folder tree. See `docs/architecture/target-folder-architecture.md` for the approved destination.

## Application entry and routes

```text
index.html
└── src/main.tsx
    └── src/App.tsx
        ├── public routes → src/components/LegacySite.jsx
        │   └── public/legacy/fort-energy/index.html (iframe)
        │       ├── public/_astro/* (generated Astro/WebGL/GSAP runtime)
        │       └── src/site-customizer.js → src/js/* + src/navbar/* + src/data/*
        └── /native-preview → src/native/NativeApp.tsx
            ├── src/components/* + src/sections/* + src/data/*
            └── src/native/FaraScene.tsx → src/scenes/* → public/assets/*
```

`src/main.tsx` mounts React and the application error boundary. `src/App.tsx` owns route selection. Public routes currently render the protected legacy iframe. Native preview is enabled in development or with `VITE_ENABLE_NATIVE_PREVIEW=true`.

## Current folder responsibilities

| Path | Current responsibility | Classification |
|---|---|---|
| `src/components/` | Shared/native UI plus the transitional `LegacySite` bridge | Mixed; source-owned |
| `src/data/` | Site content, schemas, footer data, and initial asset registry | Source-owned; awaiting M4/M5 separation |
| `src/hooks/` | Shared React hooks such as reduced-motion | Source-owned |
| `src/js/` | Imperative FARA customization inside the legacy iframe | Transitional legacy adapter |
| `src/native/` | Native preview composition and Canvas entry | Source-owned migration code |
| `src/navbar/` | Legacy iframe navigation, route pages, and data | Transitional legacy adapter |
| `src/scenes/` | Native R3F scene, recovered materials, colors, and shaders | Source-owned migration code |
| `src/sections/` | Native semantic home sections | Source-owned migration code |
| `src/store/` | Initial Zustand experience state | Source-owned; target is `src/stores/` |
| `src/styles/` | Legacy-customizer CSS modules | Transitional styling |
| `src/test/` | Vitest setup | Source-owned test infrastructure |
| `public/assets/` | Runtime models, textures, fonts, audio, and reserved logos | Protected runtime assets |
| `public/legacy/` | Mirrored HTML visual oracle | Protected legacy |
| `public/_astro/` | Generated Astro bundles used by the legacy iframe | Generated/read-only |
| `scripts/` | Build, audit, migration, browser, visual, shader, and asset tools | Developer tooling |
| `docs/baselines/m0/` | M0 machine-readable contracts and acceptance rules | Architecture evidence |
| `dist/` | Vite build output | Generated/read-only |

## Public production routes

`/`, `/knowing-fara`, `/solution`, `/consulting`, `/industries`, `/case-studies`, `/think-together`, `/privacy-policy`, `/terms-of-use`, `/news`, and `/news/:slug` currently render `LegacySite`.

The iframe and React Router synchronize route state through same-origin `postMessage`. `vite.config.js` copies the legacy customization modules to `dist/src` and creates static route entry files for GitHub Pages.

## Native preview flow

`src/native/NativeApp.tsx` renders the native header, content sections, footer, and a lazy R3F scene. `src/native/FaraScene.tsx` owns the Canvas configuration. `src/scenes/fara/FaraLegacyScene.tsx` loads GLBs, derives camera curves, applies recovered materials, and maps scroll progress to scene visibility and camera state.

Native preview is a migration implementation, not the approved production renderer.

## Generated and protected paths

Do not manually edit:

- `public/_astro/`
- `dist/`
- versioned M0 reports in `docs/baselines/m0/` without an explicitly approved baseline reset

Visual screenshots are generated locally under the Git-ignored `work/` directory. They are review artifacts, not repository content.

Do not structurally change `public/legacy/fort-energy/index.html` without visual and interaction evidence. Generated bundles depend on its ids, classes, `data-*` attributes, canvas containers, and section order.

## Where work belongs now

M2 created the documented target skeleton and ownership README files, but it did not move any runtime implementation. Existing files remain owned by the current-path table above until their dedicated milestone. New work may use a target folder only when that folder's README and the approved milestone assign ownership to it.

The `@/*` alias resolves to `src/*` consistently in TypeScript, Vite, and Vitest. Existing runtime imports remain unchanged; modules adopt the alias only as they migrate.
