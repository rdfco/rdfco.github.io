# Legacy source boundary

This directory contains source-owned code that customizes or coordinates the protected legacy iframe. Moving code here does not make it generated; it makes ownership explicit.

- `runtime/`: iframe orchestration, one module per responsibility.
  - `site-customizer.js`: the entry point - route lifecycle and boot order.
  - `routes.js`: route tables and normalisation.
  - `scroll.js` / `scroll-state.js`: everything that writes the scroll position.
  - `navigation-sync.js`: which navigation entry reads as active.
  - `section-routes.js`: links that address a section of the home document.
  - `readiness.js`: per-surface readiness, including the WebGL warm-up.
  - `scene.js`, `lenis.js`, `legacy-gsap.js`, `shell-signals.js`, `menu-bridge.js`: the seams onto the generated runtime and the shell.
- `navigation/`: menu data and interaction lifecycle.
- `pages/`: route-specific page renderers and data.
- `site/`: customization of the legacy Home DOM.
- `styles/`: source of the generated public CSS bundle.

The public URLs `/site-customizer.bundle.js` and `/custom.bundle.css` are stable runtime contracts. `vite.config.js` generates them from this directory. The protected files in `public/_astro` and the legacy WebGL asset URLs are outside the scope of source-only organization.
