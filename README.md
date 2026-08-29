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
- `public/legacy/`, `public/_astro/`: protected legacy distribution.
- `public/assets/`: production fonts, models, textures, images, and audio.
- `scripts/`: production validation, browser contracts, visual baselines and archived probes; see `scripts/README.md`.

Do not hand-edit generated files in `public/_astro/`, `public/custom.bundle.css`, `public/site-customizer.bundle.js`, or `dist/`. Change their source-owned entries and run `npm.cmd run verify` to regenerate synchronized outputs.
