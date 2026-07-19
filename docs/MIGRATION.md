# Migration gates

1. Preserve the current iframe build as the visual oracle.
2. Rebuild DOM sections in React behind a preview flag.
3. Port the existing GLB scene, camera curves, shaders and GSAP timelines without redesign.
4. Compare reference frames and interactions.
5. Switch production only after parity approval.
6. Remove `LegacySite`, `site-customizer`, `public/legacy` and `public/_astro` in one final cleanup change.

The procedural preview scene is exploratory and is not an approved replacement for the production WebGL.
