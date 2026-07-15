# FARA architecture

Production remains on the visually approved legacy boundary while native React sections are developed on the migration branch. No native component may replace production until desktop, tablet and mobile visual contracts pass.

## Target boundaries

- `src/components`: reusable UI without page content.
- `src/sections`: semantic page sections.
- `src/scenes`: R3F scenes, materials and shaders.
- `src/data`: validated content and asset registry.
- `src/hooks`: lifecycle-safe GSAP, media and WebGL hooks.
- `src/pages`: route composition only.

React owns DOM. R3F owns the canvas. GSAP animations must be created through scoped contexts and reverted on cleanup. Direct DOM replacement is forbidden in native code.
