# Add a page

Target workflow; implement only after the relevant routing/page milestone is approved.

1. Add validated page content under `src/content/locales/<locale>/pages/`.
2. Create `src/pages/<page>/<PageName>Page.tsx` for route composition only.
3. Put domain behavior in `src/features/<feature>/`, not in the page.
4. Register route path, lazy import, metadata, and fallback in `src/routes/route.config.ts`.
5. Add navigation content through the content registry if required.
6. Add unit tests for route metadata and browser tests for direct/deep navigation.
7. Verify GitHub Pages entry generation and 404 fallback.

Do not add a new route only to the legacy page registry and call it native. During migration, legacy and native route coverage must be reported separately.
