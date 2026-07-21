# FARA website

The production FARA website runs from the repository root with React and Vite.
Public routes render the protected legacy FARA experience through `LegacySite`,
with source-owned navigation, content customization, and the car-scene overlay.

## Local development

From Windows PowerShell:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run verify
```

The local site is available at `http://localhost:5173/`.

## Active code

- `src/app/`: application entry, routing, and error boundary.
- `src/features/legacy-site/`: production iframe bridge and route sync.
- `src/features/car-scene/`: production Three.js car overlay, configuration, and styles.
- `src/content/`: validated shared site content.
- `src/js/`, `src/navbar/`, `src/styles/`: source-owned legacy customization.
- `public/legacy/`, `public/_astro/`: protected legacy runtime.
- `public/assets/`: production fonts, models, textures, and audio.
- `scripts/`: production validation and browser checks.

Do not hand-edit generated files in `public/_astro/` or `dist/`. Run
`npm.cmd run verify` and the browser contract after production changes.
