# Legacy source boundary

This directory contains source-owned code that customizes or coordinates the protected legacy iframe. Moving code here does not make it generated; it makes ownership explicit.

- `runtime/`: iframe orchestration entry point.
- `navigation/`: menu data and interaction lifecycle.
- `pages/`: route-specific page renderers and data.
- `site/`: customization of the legacy Home DOM.
- `styles/`: source of the generated public CSS bundle.

The public URLs `/site-customizer.bundle.js` and `/custom.bundle.css` are stable runtime contracts. `vite.config.js` generates them from this directory. The protected files in `public/_astro` and the legacy WebGL asset URLs are outside the scope of source-only organization.
