# Content and configuration architecture

## Purpose

M4 separates reader-facing content from application configuration and makes both
discoverable through small public APIs. The migration preserves every current value,
route, Legacy message, timeout, and public path.

## Ownership map

```text
src/content
├── site-data.js                canonical shared FARA copy
├── site-content.schema.ts      complete runtime schema
├── site-content.ts             parsed TypeScript content
├── footer-content.ts           Native footer office/legal data
├── content-sources.json        canonical and Legacy ownership registry
└── index.ts                    public content API

src/config
├── app-config.ts               routes, environment gate, Legacy shell protocol
└── index.ts                    public configuration API

src/data                        compatibility adapters only
src/navbar/pages/**/data.*      route-owned, legacy-protected content
```

## Dependency contract

```text
React consumers ────────→ src/content/index.ts
App / Legacy shell ─────→ src/config/index.ts
Legacy customizer ──────→ src/data adapters ─────→ src/content
src/content/site-data.js → src/navbar/navigation.js (protected Legacy dependency)
```

Native consumers may not import shared content through `src/data`. Content and config
must not import React components, Three.js implementations, or browser state.

## Content rules

- Reader-facing copy, accessibility labels, legal text, and navigation labels belong
  to content.
- `site-data.js` remains plain JavaScript because the copied Legacy runtime executes it
  directly in the browser.
- TypeScript consumers receive the same object only after complete Zod validation.
- Route-specific Legacy datasets migrate with their route to avoid a high-risk global
  rewrite.
- Locale trees can be introduced behind the public content API without changing UI
  ownership.

## Configuration rules

- Routes, feature/environment gates, iframe source, postMessage names, sandbox policy,
  readiness timing, and shell timing belong to application configuration.
- Visible copy never belongs in configuration.
- Camera, model transform, material, lighting, and animation values stay scene-owned;
  M5 and later scene milestones will provide their shared contracts.
- Environment values are read once at the configuration boundary.

## Validation and rollback

`npm run content:validate` verifies the ownership registry, compatibility adapters, and
Native consumer imports. Vitest validates the complete canonical content and protected
route/shell values. Rollback is one commit because adapters preserve all old import
paths and no Legacy dataset or public route was removed.
