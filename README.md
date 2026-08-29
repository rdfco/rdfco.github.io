# FARA website

The production FARA website runs from the repository root with React and Vite. Public routes render the protected legacy FARA WebGL experience through `LegacySite`, with source-owned routing, content, navigation, and loading coordination.

## Local development

From Windows PowerShell:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run verify
```

The local site is available at `http://localhost:5173/`.

## Active code

- `src/app/`: application entry, routing, error boundary, and shell styles.
- `src/features/legacy-site/`: iframe bridge, loading gate, route sync, and parent scrollbar.
- `src/content/`: validated shared site content.
- `src/config/`: application and runtime contract configuration.
- `src/assets/`: typed public-asset registry.
- `src/legacy/`: source-owned iframe runtime, navigation, pages, DOM customization, and styles.
- `public/`: folder-only distribution; see `docs/public-runtime.md` for generated, protected, runtime, theme, and asset ownership.
- `public/assets/`: fonts, models, textures, images and audio; see `public/assets/README.md`.
- `scripts/`: production validation, browser contracts, visual baselines and archived probes; see `scripts/README.md`.
- `docs/`: notes that record why something is the way it is.

Each of those folders carries its own README where the rules are not obvious
from the code: `public/`, `public/assets/`, `src/assets/`, `src/config/theme/`,
`src/legacy/`, `src/legacy/navigation/` and `scripts/`.

Do not hand-edit generated files in `public/_astro/`, `public/generated/`, or `dist/`. Change their source-owned entries and run `npm.cmd run verify` to regenerate synchronized outputs.
