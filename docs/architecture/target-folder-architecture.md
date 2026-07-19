# Target folder architecture

This tree is the approved destination. M2 creates only the skeleton; later milestones move responsibilities into it.

```text
src/
├── app/                 # Application bootstrap, global providers, top-level error boundaries
├── routes/              # Route declarations, guards, lazy boundaries, route metadata
├── pages/               # Route-level composition; no reusable domain implementation
├── layouts/             # Shared page shells and structural composition
├── features/            # User-facing/domain capabilities with explicit public APIs
├── components/          # Reusable presentational and accessibility UI
├── content/             # Validated business content, locales, CMS/local adapters
├── config/              # Application, brand, environment, route, and feature configuration
├── assets/              # Typed runtime asset registry and definitions, not public binaries
├── three/
│   ├── core/            # Canvas/scene boundaries and Three.js lifecycle infrastructure
│   ├── scenes/          # Colocated scene modules and scene registry
│   ├── models/          # GLB definitions, loader, node contracts, transforms, LOD
│   ├── camera/          # Camera rigs, curves, targets, and progress mapping
│   ├── materials/       # Shared material factories and lifecycle
│   ├── shaders/         # Genuinely shared shader sources and typed uniforms
│   ├── lights/          # Shared lighting rigs and definitions
│   ├── animations/      # Three.js animation mixers and clip binding
│   ├── loaders/         # Shared texture/environment/model loading infrastructure
│   ├── performance/     # Quality tiers, monitoring, render policies
│   └── types/           # Three-specific shared contracts
├── animations/          # DOM/GSAP animation infrastructure and reduced-motion policy
├── hooks/               # Reusable React hooks without feature ownership
├── services/            # External-system adapters and application services
├── stores/              # Cross-feature client state; local state stays local
├── styles/              # Global tokens, resets, themes, and shared style layers
├── i18n/                # Locale selection, formatting, and translation infrastructure
├── lib/                 # Wrapped third-party integration helpers
├── utils/               # Pure, domain-neutral utilities
├── constants/           # Stable non-configurable constants
├── types/               # Cross-domain TypeScript contracts
└── test/                # Shared unit/integration test setup, helpers, and fixtures

public/
├── assets/
│   ├── models/          # Runtime GLB binaries grouped by scene/domain
│   ├── textures/        # Runtime textures grouped by scene/shared ownership
│   ├── hdr/             # HDR/EXR environments
│   ├── images/          # Content imagery and backgrounds
│   ├── icons/           # Standalone runtime icons
│   ├── logos/           # Brand marks and approved variants
│   ├── fonts/           # Self-hosted fonts
│   ├── audio/           # Runtime audio
│   ├── videos/          # Runtime video
│   ├── documents/       # Public documents
│   └── downloads/       # Explicit downloadable artifacts
└── legacy/              # Temporary protected visual oracle; removed only at M17

docs/
├── architecture/        # Current/target architecture, ownership, dependency and flows
├── decisions/           # Architecture Decision Records
├── development/         # Task-oriented developer guides
├── assets/              # Asset conventions, provenance and optimization workflow
├── scenes/              # Scene-specific operational documentation
├── migration/           # Milestone/gate status, risks and cutover records
├── performance/         # Budgets, profiling results and quality tiers
├── baselines/           # Versioned measurable contracts
└── generated/           # Tool-generated inventories; not hand-authored truth

tests/
├── integration/         # Cross-module behavior
├── e2e/                 # Browser route and interaction contracts
├── visual/              # Screenshots and visual comparison
├── performance/         # Repeatable performance budgets and captures
└── accessibility/       # Automated accessibility contracts
```

## Placement rule

Prefer colocation when a file has one clear owner. A shader, material, camera config, model binding, animation, hook, test, and README used by only one scene belong inside that scene. Move a file to a shared domain only after at least two real consumers require the same abstraction.

## Public binaries versus source definitions

`public/assets/` contains files fetched by URL. `src/assets/` and `src/three/models/` contain typed metadata, ownership, transforms, loading policy, and validation. Binary files must not be imported as business configuration.
