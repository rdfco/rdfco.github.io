# Add an asset

Target workflow; applies to textures, HDR/EXR, images, icons, logos, fonts, audio, video, documents, and downloads.

1. Identify the owning scene, feature, content domain, or shared consumer.
2. Verify provenance, license, format, dimensions, color space, size, and optimization state.
3. Place the runtime binary in the matching `public/assets/<type>/` ownership folder.
4. Register it in the typed asset registry; do not scatter string paths through components.
5. Define loading, preload, caching, fallback, and replacement policy.
6. Add usage validation so missing and unreferenced files are reported.
7. Verify browser requests, rendering/playback, responsive behavior, accessibility text where applicable, and bundle/runtime budgets.

Use lowercase kebab-case names. Do not mix source-authoring files, runtime-optimized files, and generated derivatives without an explicit convention.
