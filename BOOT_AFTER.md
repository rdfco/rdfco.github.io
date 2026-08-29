# BOOT_AFTER

## Summary

Startup optimization was limited to behavior-preserving changes:

- `sound.mp3` no longer downloads during startup.
- No `AudioContext` is created during startup.
- The sound system remains available and initializes only when the sound button is explicitly used.
- The false 5 second iframe failure path no longer replaces a still-loading app with "FARA could not be loaded. Please refresh the page."
- Legacy menu route navigation now has a bridge fallback so route changes do not wait forever for a missing close event.

No WebGL shaders, GSAP timelines, camera curves, scroll calculations, GLB transforms, lighting, background video behavior, or scene animation logic were changed.

## Files Changed

- `public/_astro/GlobalApp.vK8XqYB9.js`
  - Removed unconditional `this.initSound()` from the Sound constructor.
  - Removed automatic body-click sound startup.
  - Made `initSound()` idempotent and lazy.
  - Made `playSound()` call `initSound()` only after the sound control is used.

- `src/features/legacy-site/LegacySite.jsx`
  - The 5 second timer no longer marks the iframe as failed while route sync is still alive.
  - Readiness still depends on the real `fara:ready` message from the iframe.

- `public/route-bridge.js`
  - Added a missing route fallback for menu links when `fara:menu-closed` is not emitted.
  - Ensures the menu final state is closed before posting `fara:navigate`.

## Before vs After

| Metric | Before | After |
|---|---:|---:|
| Main first paint | ~424 ms | ~428 ms |
| Iframe FCP | ~1904 ms | ~1816 ms |
| Main DOMContentLoaded | ~84 ms | ~76 ms |
| Iframe DOMContentLoaded | ~632 ms observed earlier, ~327 ms in later baseline | ~339 ms |
| Total blocking time | 0 ms local | 0 ms local |
| Startup requests | 92 | 87 |
| Startup transfer | ~5.20 MB including audio | ~4.96 MB |
| `sound.mp3` startup request | Yes, ~242 KB | No |
| Startup `AudioContext` | Possible from constructor path | No |
| Console errors | 0 | 0 |
| Request failures | 0 | 0 |

LCP was not emitted by the headless browser run for this iframe-heavy page. FCP and first paint were captured from both the React shell and the legacy iframe.

## After Startup Waterfall

Measured in Chrome against production preview at `http://localhost:4173/`, cold cache, 1440x900.

| Request | Start | End | Transfer | Blocking | Required For First Screen | Optimization |
|---|---:|---:|---:|---|---|---|
| `/_astro/GlobalApp.vK8XqYB9.js` | 186 ms | 306 ms | 236 KB | non-blocking fetch, heavy parse/eval | Yes | Kept; only audio path changed |
| `/assets/models/mountains.glb` | 469 ms | 483 ms | 1.50 MB | non-blocking fetch | Yes, camera path/mountain base | Not safe to defer |
| `/assets/textures/envmap-min.exr` | 469 ms | 477 ms | 112 KB | non-blocking fetch | Yes, shared environment lighting | Not safe to defer |
| `/assets/textures/noise.webp` | 497 ms | 508 ms | 17 KB | non-blocking image | Yes, shared shader texture | Not safe to defer |
| `/assets/textures/perlinNoise.webp` | 497 ms | 509 ms | 90 KB | non-blocking image | Yes, shared shader texture | Not safe to defer |
| `/assets/textures/noise-solid-normal.webp` | 497 ms | 511 ms | 27 KB | non-blocking image | Yes, shared material texture | Not safe to defer |
| `/assets/textures/rock_normal.webp` | 497 ms | 513 ms | 170 KB | non-blocking image | Yes, mountain material normal | Not safe to defer |
| `/assets/textures/voronoi.webp` | 497 ms | 513 ms | 9 KB | non-blocking image | Yes, shared shader texture | Not safe to defer |
| `/assets/models/energy/hero.glb` | 699 ms | 707 ms | 711 KB | non-blocking fetch | Yes, first energy scene | Not safe to defer |
| `/assets/models/energy/energy-chapter.glb` | 731 ms | 744 ms | 1.33 MB | non-blocking fetch | Below-fold chapter, but near-scroll dependency | Not changed; further deferral risks visible fast-scroll regression |
| `/assets/sounds/sound.mp3` | not requested | not requested | 0 KB | none | No | Removed from startup |

## Assets Removed From Startup

| Asset | Before | After | Notes |
|---|---:|---:|---|
| `/assets/sounds/sound.mp3` | requested during startup | not requested | Now loaded only by explicit sound feature click |

## Assets Deferred

No GLB or texture deferral was applied. The generated runtime already marks `energy-chapter.glb` as a lazy chapter asset, but it starts loading it immediately in the background after the initial page load. Further delaying it was classified as Not Safe because the chapter scroll range can be reached quickly and missing chapter assets would change the perceived WebGL experience.

## Critical Request Chain

```text
index.html
-> /theme/background-colors.js
-> React bundle
-> LegacySite iframe
-> /legacy/main/index.html
-> /route-bridge.js
-> legacy CSS
-> /_astro/WebGL...
-> /_astro/GlobalApp...
-> global WebGL assets
-> Energy page GLB
-> lazy chapter GLB background load
```

Audio is no longer part of this chain.

## Verification

Commands:

- `npm.cmd run build`: passed.
- `npm.cmd run verify`: passed.
- `npm.cmd run browser:contract` with `SITE_URL=http://localhost:4173/`: passed.

Chrome production preview:

- No startup `sound.mp3` request.
- No startup `AudioContext`.
- After explicit sound-button click, `AudioContext` was created at ~3997 ms and `sound.mp3` requested at ~4091 ms.
- Iframe status: ready.
- WebGL canvas: present.
- Console errors: none.
- Request failures: none.

Edge production preview:

- No startup `sound.mp3` request.
- Iframe status: ready.
- WebGL canvas: present.
- Navigation count: 7.
- Console errors: none.
- Request failures: none.

GitHub Pages:

- Not verified for these exact changes because they are local and uncommitted/undeployed.
- The production build that Pages would publish was verified locally from `dist`.

## Not Safe

These were audited but not changed:

- `mountains.glb`: required by global WebGL/camera path and mountain scene setup.
- `envmap-min.exr`: required by shared environment/lighting setup.
- Shared WebP textures: used by shader/material paths active in the first WebGL scene.
- `hero.glb`: required by the first energy scene.
- `energy-chapter.glb`: below-fold/lazy chapter asset, but deferring it further can create visible fast-scroll/chapter pop-in.

