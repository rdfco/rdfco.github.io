# Runtime flows

## Production flow

```text
request public route
→ React Router
→ LegacySite
→ protected iframe HTML
→ generated Astro/WebGL/GSAP runtime
→ site-customizer + data + navbar adapters
→ faraReady signal
→ iframe revealed to the user
```

`LegacySite` fails closed: it displays a loading gate until the iframe reports FARA readiness and shows an error state on timeout. Same-origin messages synchronize navigation between iframe and React Router.

## Native preview flow

```text
request /native-preview
→ React Router preview guard
→ NativeApp
├── React header/sections/footer from validated content
├── scoped GSAP ScrollTriggers
└── lazy FaraScene
    → R3F Canvas
    → GLB assets
    → recovered materials and shaders
    → GLB-derived camera/target curves
    → scroll progress updates camera and visibility
```

## Build and GitHub Pages flow

```text
Vite build
→ dist application shell and native chunks
→ copyLegacyRuntime plugin copies transitional src runtime to dist/src
→ creates 404.html and route-specific index.html files
→ brand-safety and bundle-budget checks
```

Development success does not prove this production copy flow. The production preview must be checked after changes to routes, legacy adapters, or asset paths.

## Error flow

- Top-level React failures are handled by `AppErrorBoundary`.
- Legacy readiness timeout is handled by `LegacySite`.
- Native Canvas is wrapped by Suspense; the target architecture adds explicit scene error boundaries and fallbacks in M8.
- Missing content fails through schema validation.
- Asset/model validation becomes comprehensive in M3 and M9.

## Cutover flow

M16 changes route ownership to Native while retaining Legacy failback. M17 removes the iframe, customization adapters, mirrored HTML, generated Astro runtime, and copy plugin only after an approved stability period.
