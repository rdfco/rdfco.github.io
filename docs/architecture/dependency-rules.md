# Dependency rules

## Allowed direction

```text
app
└── routes
    └── pages/layouts
        └── features
            ├── components
            ├── content/config/assets
            ├── animations/hooks/stores/services
            └── three scene public APIs

three/scenes
├── three/models
├── three/camera
├── three/materials/shaders/lights/animations/loaders/performance
└── assets/config
```

Dependencies point toward lower-level contracts. Lower-level modules must not import their consumers.

## Forbidden dependencies

- Native modules importing from `LegacySite`, `src/js`, `src/navbar`, `public/legacy`, or generated Astro bundles.
- Components importing route state, page modules, or business content directly.
- Scene or shader modules importing page copy, navigation, or DOM components.
- Content/config modules importing React components or Three.js implementations.
- Shared utilities importing features or pages.
- Direct imports from another feature's internal files; use its public API.
- Circular imports hidden by barrel files.
- New global DOM selectors or `innerHTML` in native code.

## Public APIs

Each page, feature, and scene may expose a small `index.ts`. Internal files are not cross-module APIs. Avoid project-wide barrels because they hide ownership, create cycles, and reduce tree-shaking clarity.

## State rules

- Keep state local by default.
- Feature state stays within the feature.
- Use a global store only for state consumed by multiple independent domains.
- Scene frame state should not trigger React renders every frame.

## Enforcement plan

M2 establishes paths without changing runtime. M13 converts these rules into automated checks. Until then, code review and the existing native-boundary script enforce the contract.
