# Three core

Owns the shared `ThreeCanvas` lifecycle and active renderer contract: perspective
camera defaults, DPR, WebGL preferences, Suspense, preload, and adaptive DPR.

Background and fog values are passed by the owning scene. This folder must not own a
specific scene's models, camera path, materials, shaders, content, or scroll behavior.
