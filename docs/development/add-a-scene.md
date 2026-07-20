# Add a scene

Target workflow; implement only after M8 establishes the Scene Registry.

1. Create `src/three/scenes/<scene-id>/`.
2. Add the scene component, config, asset bindings, camera config, animation config, tests, and README inside that folder.
3. Register models through typed model definitions; do not hard-code public paths in the scene.
4. Keep scene-specific materials and shaders colocated.
5. Use shared Three.js systems only when they already serve multiple scenes.
6. Register the scene in `src/three/scenes/registry.ts` with loading and fallback metadata.
7. Add visual checkpoints, error/fallback tests, performance budget, and disposal verification.

Scenes do not own business copy, React routes, global DOM selectors, or page layout.
