# M14 measured performance and automatic quality selection

## Outcome

Canvas quality is selected once, before renderer creation, from stable browser device
capabilities. The policy keeps the approved `high` contract on capable or unknown
devices, selects `medium` for constrained 4 GB/4-core devices, `low` at 2 GB/2-core,
and reserves `fallback` for an explicitly unavailable WebGL capability. DPR,
antialiasing, and AdaptiveDpr remain owned by the existing quality-tier table.

The selector is pure and unit-tested. Browser detection, the Canvas runtime config,
and the experience store all consume the same selected tier. No scene geometry,
camera path, material, shader, content, layout, route, or animation value changed.

## Measurements

Measured from the production build on the M0 reference machine with Chrome headless,
WebGL2/AMD Radeon, device scale factor 1, and 2-second animation samples:

| Runtime | Desktop FPS | Tablet FPS | Mobile FPS | Frames over 32 ms | Errors |
|---|---:|---:|---:|---:|---:|
| Production Legacy | 124.6 | 139 | 144 | 0 / 0 / 0 | 0 |
| Native Preview | 103 | 141 | 144 | 0 / 0 / 0 | 0 |

The M0 reference was 144 FPS with zero slow frames. Sampling variance is present,
but every measured target remains above 100 FPS with no frame over 32 ms and no
runtime error. Document dimensions and Canvas counts match M0 exactly: Production
7678/8453/8794 with two canvases; Native 9530/10605/10371 with one canvas.

The Native scene chunk is 988.68 kB minified / 268.50 kB gzip, below the approved
1.1 MB per-file budget and slightly below the M13 pre-change 989.06 kB / 268.63 kB.
The existing Vite advisory remains non-blocking because measured frame behavior and
the enforced bundle budget pass; arbitrary chunk reshaping was not justified by the
measurements and would add risk without reducing transferred code.

## Rollback

Revert the M14 commit. The runtime then returns to the static `high` tier from M5;
public routes and the Legacy production shell are unaffected.
