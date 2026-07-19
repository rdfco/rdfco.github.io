# M0 baseline contract

Captured on 2026-07-19 from the dedicated refactoring branch, now named `fara/refactoring-roadmap`.

## Purpose

This baseline protects the approved FARA production appearance and behavior while the native React/R3F migration is reorganized. Production and native preview are deliberately recorded as separate contracts:

- Production `/` is the protected legacy iframe and the visual oracle.
- `/native-preview` records the current migration state and is not an approved replacement.

## Fixed viewports

| Name | Width | Height | DPR |
|---|---:|---:|---:|
| Desktop | 1440 | 900 | 1 |
| Tablet | 768 | 1024 | 1 |
| Mobile | 390 | 844 | 1 |

## Captured checkpoints

Production captures six states per viewport: hero, 25%, 50%, 75%, footer, and the open menu. Native preview captures five scroll states per viewport: hero, 25%, 50%, 75%, and footer.

The PNG files are generated locally under the Git-ignored `work/` directory and are deliberately not committed. Machine-readable layout and performance reports are versioned next to this document.

## Production contract

| Metric | Desktop | Tablet | Mobile |
|---|---:|---:|---:|
| Document height | 7,678 px | 8,453 px | 8,794 px |
| Sections | 5 | 5 | 5 |
| Cards | 10 | 10 | 10 |
| Browser/request errors | 0 | 0 | 0 |
| Canvas elements | 2 | 2 | 2 |
| Approximate FPS | 144 | 144 | 144 |
| Frames over 32 ms | 0 | 0 | 0 |
| Decoded resources | 8,082,773 B | 8,082,773 B | 8,082,773 B |
| Used JS heap | 26,898,410 B | 27,452,005 B | 27,783,987 B |

Production rendered one WebGL2 scene canvas at the viewport dimensions and one 24x24 non-WebGL canvas. Measurements were made on an NVIDIA GeForce RTX 3070 Laptop GPU through ANGLE/D3D11.

## Native preview starting point

| Metric | Desktop | Tablet | Mobile |
|---|---:|---:|---:|
| Document height | 9,530 px | 10,605 px | 10,371 px |
| Browser/request errors | 0 | 0 | 0 |
| Canvas elements | 1 | 1 | 1 |
| Approximate FPS | 144 | 144 | 144 |
| Frames over 32 ms | 0 | 0 | 0 |
| Decoded resources | 15,892,195 B | 15,886,965 B | 15,886,965 B |
| Used JS heap | 38,624,289 B | 40,481,466 B | 40,398,368 B |

These are local comparison values, not universal device guarantees. Performance changes must be compared on the same machine, browser, viewport, DPR, cache conditions, and capture procedure.

## Acceptance contract

A refactoring milestone fails validation if it causes an unapproved change to any of the following:

- visible copy, section/card counts, navigation labels, or legal/footer content;
- document dimensions, horizontal overflow, major layout boxes, or responsive breakpoints;
- hero, scroll checkpoints, menu state, footer, camera framing, materials, shaders, colors, or animation timing;
- route behavior, iframe readiness before cutover, brand-safety guards, asset availability, console errors, or failed requests;
- performance outside an explicitly approved budget.

Visual review remains mandatory. Build success and numeric metrics are not by themselves proof of visual parity. Review screenshots locally, then discard or retain them outside Git as needed.

## Reproduction

1. Run `npm.cmd run verify`.
2. Capture production with `npm.cmd run visual:contract`; output remains under ignored `work/`.
3. Start dev on port 4174 and run `npm.cmd run visual:native`; output remains under ignored `work/`.
4. Run `npm.cmd run baseline:performance` with `SITE_URL`, `BASELINE_MODE`, and `OUTPUT_FILE` set for the target route.
5. Compare new artifacts with the fixed M0 artifacts before approving a milestone.

## Known observations, not M0 fixes

- The build reports the lazy native scene chunk at about 984.94 kB minified (267.71 kB gzip), above Vite's 500 kB warning threshold.
- Native preview currently decodes roughly twice the resource bytes and uses more JS heap than the production legacy path in this local run.
- Captured production text contains legacy encoding artifacts. M0 preserves them as observed behavior; it does not authorize a content fix.

Optimization belongs to M14. Content or encoding corrections require their own approved milestone because they can change the visual contract.
