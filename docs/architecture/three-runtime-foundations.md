# Shared Three.js runtime foundations

## Purpose

M5 establishes the smallest reusable R3F runtime layer needed by the current Native
scene. It removes Canvas lifecycle literals from the scene entry point while preserving
the complete M0 rendering contract.

## Runtime flow

```text
NativeApp
└── lazy FaraScene
    └── ThreeCanvas (shared foundation)
        ├── active camera and renderer configuration
        ├── scene-provided background and fog
        ├── Suspense + global preload policy
        ├── adaptive DPR policy
        └── FaraLegacyScene (unchanged composition)
            ├── current GLB loading
            ├── current camera curves
            ├── current recovered materials
            └── current scroll mapping
```

## Ownership

```text
src/three/core
├── ThreeCanvas.tsx        Canvas, Suspense, preload, AdaptiveDpr lifecycle
└── runtime-config.ts      active camera, DPR, and WebGL contract

src/three/performance
└── quality-tiers.ts       typed tier vocabulary and renderer-facing policy

src/three/types
└── runtime.ts             cross-foundation runtime contracts
```

The owning scene still supplies background and fog. It continues to own its models,
camera path, scroll mapping, transforms, private materials, shaders, and composition.

## M0-preserved active configuration

| Setting | Value |
|---|---|
| Camera FOV | 35 |
| Camera near/far | 0.1 / 1000 |
| DPR | 1–1.75 |
| Antialias | true |
| Power preference | high-performance |
| Preload | all |
| Adaptive DPR | enabled, pixelated transition |
| Active quality tier | high |

The medium, low, and fallback tiers are typed policy definitions only. M5 does not
activate automatic selection or alter quality at runtime.

## Dependency rules

Shared Three.js foundation files may depend on React, R3F, Drei, Three.js, and other
lower-level `src/three` contracts. They may not import content, UI components, pages,
routes, Native/Legacy implementations, scene implementations, stores, or DOM state.

## Deferred ownership

- M8: scene registry and colocated scene migration
- M9: model registry and loader implementation
- M10: camera runtime and path extraction
- M11: material and shader boundary
- M12: scene-scoped animation integration
- M14: measurement-driven optimization and automatic quality selection

M5 validates that these boundaries remain unimplemented until their approved milestone.
