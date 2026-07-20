# Folder ownership

Ownership identifies the module responsible for placement, public API, validation, and cleanup. It does not refer to a person.

| Folder | Owns | Must not own |
|---|---|---|
| `app` | Bootstrap, global providers, top-level error handling | Page content, scene logic |
| `routes` | Route matching, lazy boundaries, route metadata | Page markup, feature implementation |
| `pages` | Route-level composition and page metadata | Shared UI primitives, low-level Three.js systems |
| `layouts` | Reusable structural shells | Route decisions, business content |
| `features` | Domain behavior, feature UI, feature state, feature animation | Global bootstrap, unrelated shared utilities |
| `components` | Reusable presentational/accessibility UI | Route access, business copy, asset path decisions |
| `content` | Copy, navigation content, SEO, locales, CMS adapters, validation | DOM rendering, WebGL state |
| `config` | Intentional configurable application values | Runtime mutation, fetched content |
| `assets` | Typed asset metadata, provenance and general asset lookup | Scene implementation, binary storage |
| `three/scenes` | Scene composition and scene-specific colocation | Global routing, business content |
| `three/models` | GLB loader, definitions, node contracts, transform policy | Page layout, copy |
| `three/camera` | Camera rigs, paths, targets and interpolation | DOM scrolling implementation outside adapters |
| `three/materials/shaders` | Shared rendering factories and sources | Scene-specific files with one owner |
| `animations` | Shared DOM/GSAP lifecycle and policies | Scene graph ownership |
| `stores` | Truly cross-feature state | State used by only one component/feature |
| `services` | External integration boundaries | Presentational UI |
| `utils` | Pure domain-neutral functions | Stateful services, business configuration |

## Decision sequence for a new file

1. Is it owned by one scene or feature? Colocate it there.
2. Is it route composition only? Put it in `pages` or `routes`.
3. Is it reusable visual UI with no domain knowledge? Put it in `components`.
4. Is it editable business information? Put it in `content`.
5. Is it an intentional behavior setting? Put it in the nearest `config`.
6. Is it shared infrastructure with multiple real consumers? Put it in the relevant shared domain.
7. If none applies, document the missing responsibility before creating a new top-level folder.

## Transitional ownership

Until M17, `LegacySite`, `src/site-customizer.js`, `src/js`, `src/navbar`, `public/legacy`, and `public/_astro` are owned by the Legacy adapter boundary. Native code must not depend on them. Their existence does not justify placing new native work there.
