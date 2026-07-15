# WebGL preservation contract

The approved appearance depends on `fort-energy.glb`, `energy-chapter.glb`, `mountains.glb`, embedded animation clips and custom shaders. These assets must not be removed, renamed or optimized without before/after visual evidence.

## Recovered hero settings

`EnergyCylinder`: `iSteps=2`, `uSpeed=.08`, `uHeadLength=.1`, `uLineCount=30`, `uOpacity=.5`.

`Grid`: line width `.01`, line `#4e8399`, background `#1a697f`, accent `#7a9fb6`, point `#519abc`, brightness `1.6`, grid scale `150`, depth `100`.

The chapter model contains named `Camera*`, `LookAt*`, `Line*` and `Hologram*` nodes. Native migration must derive the same centripetal camera/look-at curves and scroll timelines from those nodes.

## Acceptance

- Same GLB animation state at reference scroll points.
- Same camera framing at three viewports.
- Same colors, fog, reflection, grid and cylinder behavior.
- Reduced-motion and static fallback may differ only when explicitly requested by the user agent.
