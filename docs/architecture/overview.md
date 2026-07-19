# Architecture overview

## Current architecture

FARA currently has two renderer paths sharing content and assets unevenly.

```text
Browser
└── React Router
    ├── Public routes
    │   └── LegacySite iframe
    │       ├── mirrored Astro DOM and generated WebGL/GSAP bundles
    │       └── FARA customization, navigation, content, and route adapters
    └── /native-preview
        └── Native React UI
            ├── validated content
            ├── scoped GSAP
            └── R3F Canvas → GLBs + recovered shaders + scroll camera
```

The legacy path is production because it preserves the approved appearance. The native path is the architecture destination but has not passed full parity.

## Architecture problem

Discoverability is reduced by transitional and target code living side by side. A developer cannot infer ownership from the current top-level folders alone. Content, assets, routes, scene configuration, camera behavior, and animation settings are only partially centralized.

## Target architecture

```text
app → routes → pages/layouts → features → components
                    │             │
                    ├── content/config/assets registries
                    └── three/scenes → models/camera/materials/shaders
```

Key principles:

1. React owns DOM composition.
2. R3F owns the Canvas and Three.js lifecycle.
3. GSAP animations are scoped to feature or scene roots and revert on cleanup.
4. Business content does not live in UI or scene implementations.
5. Asset paths and model transforms are registry/config driven.
6. Scene-specific files are colocated; genuinely shared systems live under `three/` shared domains.
7. Legacy adapters are explicit, temporary, and forbidden as dependencies of native modules.
8. Pages compose; features own domain behavior; components remain reusable.

## Data flow

```text
local content / future CMS
        ↓ validate
content registry
        ↓
page or feature props
        ↓
React DOM

asset definitions + scene config
        ↓ validate
scene registry → model loader → camera/material systems → R3F Canvas
```

## Migration strategy

The migration is additive until cutover. New target modules are introduced behind native preview, consumers migrate independently, and Legacy remains the rollback path. Removal happens only after production stability.
