# Add or replace a GLB model

Target workflow; implement only after M3 and M9 establish complete registries and loader contracts.

1. Inspect provenance, license, file size, extensions, nodes, meshes, materials, animations, and cameras.
2. Store the binary under `public/assets/models/<scene-or-domain>/<model-id>/` using lowercase kebab-case naming.
3. Add the asset to the asset registry with ownership and lifecycle status.
4. Add a typed model definition with path, version, transform, preload, compression, LOD, material, animation, node, and fallback policy.
5. Validate required node names such as camera and target paths.
6. Bind the model to a scene through the scene's asset definition.
7. Capture model, camera, shader, loading, memory, and performance evidence.
8. For replacement, keep the previous approved binary available until validation and rollback approval.

Never overwrite a production GLB merely because the new file has the same name. Replacement is a versioned, validated migration.
