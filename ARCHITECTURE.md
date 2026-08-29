# FARA Runtime Architecture

## Source ownership

- `src/app`: React entry shell, routing, error boundary, and shell stylesheet.
- `src/features/legacy-site`: iframe host, readiness gate, parent/iframe messages, and the custom scrollbar.
- `src/content`: canonical shared copy plus content validation and schemas.
- `src/config`: parent application routes and runtime contract values.
- `src/config/theme`: the colour and typography tokens every stylesheet references.
- `src/assets`: the registry for every public model, texture, image, font, sound, and environment asset.
- `src/legacy/runtime`: iframe-side orchestration for route, readiness, scroll, and WebGL lifecycle, one module per responsibility behind the `site-customizer.js` entry point.
- `src/legacy/navigation`: navigation data and the menu interaction lifecycle.
- `src/legacy/pages`: route-owned renderers and route-specific data.
- `src/legacy/site`: DOM customization for the legacy Home document.
- `src/legacy/styles`: source styles used to generate `/custom.bundle.css`.

Generated or protected public files are not source modules:

- `public/_astro`: protected generated Astro/WebGL runtime.
- `public/legacy/main/index.html`: protected iframe entry document.
- `public/custom.bundle.css`: generated from `src/legacy/styles/index.css`.
- `public/site-customizer.bundle.js`: generated from `src/legacy/runtime/site-customizer.js`.
- `public/background-colors.js`: hand-edited WebGL scene colours; its URL is a runtime contract.

## Rendering pipeline

The React app renders `LegacySite`, which loads `/legacy/main/index.html` in an iframe. The parent owns application routing and the loading gate. The iframe owns the production legacy DOM, WebGL renderer, Lenis instance, menu animation, and route-page rendering.

The build copies `src/legacy` and `src/content` to `dist/src` for traceable runtime sources. It also bundles the runtime and styles to the stable public URLs expected by the protected iframe. Reorganizing source files must not change those public URLs.

## Navigation and pages

Navigation labels come from `src/legacy/navigation/navigation.js`. DOM application is under `src/legacy/site/navigation.js`, while menu lifecycle is isolated in `src/legacy/navigation/navigation-events.js`.

Route renderers and route-specific content stay under `src/legacy/pages/<route>`. Shared legal and news rendering stays under `src/legacy/pages/content`; shared page primitives stay under `src/legacy/pages/shared`.

## Scroll, camera, and WebGL

The generated legacy runtime owns the production renderer, camera, GSAP timelines, and Lenis scroll engine. Source organization work must not add another scroll driver, pause the shared ticker, rename generated `_astro` files, or move protected WebGL assets without a separately validated URL migration.

## Asset pipeline

Every public asset path must be registered in `src/assets/asset-registry.json`. Existing legacy-protected paths are runtime contracts even when their public folder placement appears flat. New source-owned consumers should resolve assets through `src/assets`; direct legacy URLs remain protected until their owning runtime is migrated.

## Theme

DOM colours and the display font live in `src/config/theme/color-tokens.css`; every
stylesheet references a token instead of a literal, and `npm.cmd run theme:validate`
fails the build on any raw colour under `src/**/*.css`. WebGL scene colours stay in
`public/background-colors.js` because that script must run before React. See
`src/config/theme/README.md`.

## Validation gates

After any runtime or organization change, run:

1. `npm.cmd run verify`
2. `npm.cmd run browser:contract`
3. `npm.cmd run browser:home-lifecycle`
4. `npm.cmd run browser:menu-performance`
5. `npm.cmd run browser:responsive-interactions`

Visual or performance evidence must be written outside the repository.
