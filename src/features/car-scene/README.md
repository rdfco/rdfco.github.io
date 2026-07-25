# Car Scene Feature

This feature owns the optional React Three Fiber car overlay. It is intentionally isolated from the production legacy WebGL iframe so visual and scroll behavior can be verified independently.

## Responsibilities

- Load the registered car GLB through the asset registry.
- Define camera, scroll, material, light, performance, and debug configuration in one place.
- Keep overlay rendering and frame scroll sampling outside the legacy runtime.

## Dependencies

- `@react-three/fiber` for the Canvas and render loop.
- `@react-three/drei` for GLB loading.
- `three` for bounds, vectors, and materials.
- `src/assets` for registered asset lookup.

## How To Modify

- Change model paths in `src/assets/asset-registry.json`, then reference the asset id in `config/assets.js`.
- Change camera presets in `config/camera.js`.
- Change reveal ranges in `config/scroll.js`.
- Change quality limits in `config/performance.js`.
- Add debug helpers under `debug/` and guard them with `config/debug.js`.

## How To Extend

Add new scene objects as small modules under `models/`, with materials and lights passed in through config. Avoid hardcoded paths, timing values, or camera numbers inside React components.
