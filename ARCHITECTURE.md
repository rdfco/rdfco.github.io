# FARA Runtime Architecture

## Source ownership

- `src/app`: React entry shell, routing, error boundary, and shell stylesheet.
- `src/features/legacy-site`: iframe host, split into the component, the route/readiness message bridge, the custom scrollbar, and the footer fixups.
- `src/content`: canonical shared copy plus content validation and schemas.
- `src/config`: parent application routes, runtime contract values, and the route normalisation both sides share.
- `src/config/theme`: the colour and typography tokens every stylesheet references.
- `src/assets`: the registry for every public asset, plus the named catalog our code loads them through.
- `src/legacy/runtime`: iframe-side orchestration for route, readiness, scroll, and WebGL lifecycle, one module per responsibility behind the `site-customizer.js` entry point.
- `src/legacy/navigation`: navigation data and the menu interaction lifecycle.
- `src/legacy/pages`: route-owned renderers and route-specific data.
- `src/legacy/site`: DOM customization for the legacy Home document.
- `src/legacy/styles`: source styles used to generate `/generated/custom.bundle.css`; the larger sheets are folders of parts behind a barrel whose import order is the cascade order.

Generated or protected public files are not source modules:

- `public/_astro`: protected generated Astro/WebGL runtime.
- `public/legacy/main/index.html`: protected iframe entry document.
- `public/generated/custom.bundle.css`: generated from `src/legacy/styles/index.css`.
- `public/generated/site-customizer.bundle.js`: generated from `src/legacy/runtime/site-customizer.js`.
- `public/runtime`: source-owned loaders used by the protected iframe and generated WebGL modules.
- `public/theme/background-colors.js`: hand-edited WebGL scene colours; its URL is a runtime contract.

## Rendering pipeline

The React app renders `LegacySite`, which loads `/legacy/main/index.html` in an iframe. The parent owns application routing and the loading gate. The iframe owns the production legacy DOM, WebGL renderer, Lenis instance, menu animation, and route-page rendering.

The build copies `src/legacy` and `src/content` to `dist/src` for traceable runtime sources. It also bundles the runtime and styles to the stable public URLs expected by the protected iframe. Reorganizing source files must not change those public URLs.

## Navigation and pages

Menu lifecycle is isolated in `src/legacy/navigation/navigation-events.js`.

Navigation labels come from `src/legacy/navigation/navigation-items.js`; `src/legacy/site/apply-navigation.js` writes them into the legacy DOM.

Every route page is a folder holding its renderer and its data: `src/legacy/pages/<route>/component.js` beside `data.json`. The two document-driven groups follow the same shape - `pages/legal/` and `pages/news/` each hold their renderers and their data. Shared page primitives stay in `pages/shared/`, and all route resolution, including the legal and news routes, lives in `pages/registry.js`.

## Scroll, camera, and WebGL

The generated legacy runtime owns the production renderer, camera, GSAP timelines, and Lenis scroll engine. Source organization work must not add another scroll driver, pause the shared ticker, rename generated `_astro` files, or move protected WebGL assets without a separately validated URL migration.

## Asset pipeline

Every public asset path must be registered in `src/assets/asset-registry.json`. Each record carries a `placement`: `pinned` when a generated or protected file addresses the asset by URL, `movable` when only our own source names it. `npm.cmd run assets:validate` recomputes placement from the real consumers and fails when the registry disagrees, so the boundary cannot go stale.

33 assets are pinned, all of them WebGL inputs under `models/`, `textures/`, `sounds/` and the two top-level webfont families. The other 34 are organised by purpose under `brand/`, `icons/`, `pages/<route>/` and `fonts/gotham/`, and code reaches them by name through `src/assets` rather than by URL. See `public/assets/README.md` and `src/assets/README.md`.

## Theme

DOM colours and the display font live in `src/config/theme/color-tokens.css`; every
stylesheet references a token instead of a literal, and `npm.cmd run theme:validate`
fails the build on any raw colour under `src/**/*.css`. WebGL scene colours stay in
`public/theme/background-colors.js` because that script must run before React. See
`src/config/theme/README.md`.

## Validation gates

After any runtime or organization change, run:

1. `npm.cmd run verify`
2. `npm.cmd run browser:contract`
3. `npm.cmd run browser:home-lifecycle`
4. `npm.cmd run browser:menu-performance`
5. `npm.cmd run browser:responsive-interactions`
6. `npm.cmd run browser:network`

Visual or performance evidence must be written outside the repository.
