# Project map - Fort Energy

## Read this first

The active site is a **Phase 1 React wrapper around the unmodified mirrored Astro page**. React does not render the site sections yet.

- React starts at `src/main.jsx`, renders `src/App.jsx`, and hosts `src/components/LegacySite.jsx`.
- The browser-visible page is the document loaded by the iframe: `public/legacy/fort-energy/index.html`.
- Keep its element hierarchy, `id` values, classes, and `data-*` attributes unchanged. WebGL, GSAP, and direct DOM code select those exact elements.
- Files with a content-hashed name in `public/_astro/` are generated Astro build artifacts. Do not hand-edit them.

## Quick edit guide

| I want to change | Edit here | Notes |
|---|---|---|
| Text, labels, addresses, ordinary links | `public/legacy/fort-energy/index.html` | Change text or an existing `href` only; preserve tags, classes, ids, and data attributes. |
| Hero/footer logo | Inline SVG in `public/legacy/fort-energy/index.html` | There is no active standalone logo asset at present. Replace only after visual testing. |
| 3D scene/model | `public/assets/models/` | Keep file names and formats unless the WebGL runtime is updated and tested too. |
| 3D textures/environment maps | `public/assets/textures/` | Same path/name contract applies. |
| Sound | `public/assets/sounds/sound.mp3` | Safe asset replacement if the format and path remain compatible. |
| Fonts | `public/assets/fonts/` | Referenced by generated CSS; do not rename casually. |
| Page styling | `public/_astro/_slug_.B97dlsMJ.css` | Generated artifact: inspect only. Add a separate override only with visual regression testing. |
| WebGL / GSAP / scroll behavior | `public/_astro/*.js` | Generated artifacts: do not edit. |

## Section map

| Section | Source HTML and text | Images / logo | Styles | Animation / WebGL / GSAP | Safe edits |
|---|---|---|---|---|---|
| Global cursor | `public/legacy/fort-energy/index.html` (`.cursor`) | None | `public/_astro/_slug_.B97dlsMJ.css` | `public/_astro/GlobalApp.vK8XqYB9.js` | None; preserve the full DOM. |
| Header and primary navigation | `public/legacy/fort-energy/index.html` (`#header`, `.menu-links-w`) | No image; text is inline | Generated CSS above | `GlobalApp…js`, `index.Brfk6Bdo.js` | Navigation labels and existing link URLs only. |
| Overlay menu | `public/legacy/fort-energy/index.html` (`.montfort-menu`) | Inline arrow SVGs | Generated CSS above | `GlobalApp…js`, `index.Brfk6Bdo.js` | Existing menu text/URLs only. Do not remove menu items or classes. |
| Fixed controls: scroll top and sound | `public/legacy/fort-energy/index.html` (`.buttons-container`) | `public/assets/sounds/sound.mp3`; inline SVG | Generated CSS above | `GlobalApp…js` | The sound file can be replaced; do not rename controls/canvas ids. |
| Hero | `public/legacy/fort-energy/index.html` (`section.hero`, `data-chapter="Hero"`) | Hero logo is inline SVG (`.logo-mb`, `.logo-dk`) | Generated CSS above | `public/_astro/WebGL.astro_astro_type_script_index_0_lang.ClLv70z8.js` loads the scene; supporting code is in `GlobalApp.vK8XqYB9.js` | Hero labels and CTA text/link target only. Do not alter `#canvas-wrapper`, `canvas`, `data-chapter`, or logo containers. |
| Intro / company description | `public/legacy/fort-energy/index.html` (`#grid`, `data-chapter="FortEnergyChapter"`) | Inline decorative SVG | Generated CSS above | `GlobalApp…js`; read-more behavior is selector-based | Heading/body text and existing link URL only. Preserve `.read-more`, `.content-wrapper`, `.inner`, and `data-animation`. |
| Fort Energy Advantage cards | `public/legacy/fort-energy/index.html` (`.advantages-informations`, `.advantages-container`) | Inline decorative SVG | Generated CSS above | `GlobalApp…js`, `ScrollTrigger.6qCihK2t.js` | Card titles/body text and external Fort Energy URL only. Do not add/remove/reorder cards in Phase 1. |
| Footer | `public/legacy/fort-energy/index.html` (`#footer`) | Footer brand is inline SVG (`#footer .logo`) | Generated CSS above | `Layout.astro_astro_type_script_index_0_lang.DbdhcTQd.js`, `GlobalApp…js` | Office text, telephone links, and existing URLs only. Keep footer ids/classes and inline script. |

## Assets by responsibility

| Path | Responsibility | Status |
|---|---|---|
| `public/assets/models/` | GLB/GLTF 3D models for scenes | Source asset; replace cautiously. |
| `public/assets/textures/` | WebGL textures, EXR environment maps, normals/lightmaps | Source asset; replace cautiously. |
| `public/assets/sounds/sound.mp3` | Sound-control audio | Source asset; safe to replace at the same path. |
| `public/assets/fonts/` | Site fonts | Source asset; retain names/formats. |
| `public/assets/logos/` | Reserved asset folder | Not currently used for the visible hero/footer logo. |
| `public/_astro/` | Mirrored generated Astro CSS and JavaScript bundles | Generated artifact; never manually edit. |
| `dist/` | Vite production output | Generated artifact; never edit. Recreated by `npm run build`. |

## Files deliberately not used to render the current page

`src/data/`, `src/js/`, `src/site-customizer.js`, and `src/custom.css` are legacy/refactor remnants. They are not the source of the document currently shown by `LegacySite.jsx`; editing them is not a reliable way to change the live page.

## Safe workflow for a content change

1. Edit only the intended text, URL, or same-path asset in `public/legacy/fort-energy/index.html` or `public/assets/`.
2. Do not rename or delete classes, ids, `data-*` attributes, canvas markup, or cards.
3. Run `npm.cmd run build`.
4. Check desktop and mobile manually, including initial hero load, scrolling, menu open/close, sound, and expandable text.
5. For any CSS, WebGL, GSAP, DOM-structure, or asset-path change, capture and compare visual regression screenshots before shipping.

## Generated/runtime files — do not modify

- `public/_astro/_slug_.B97dlsMJ.css`
- `public/_astro/WebGL.astro_astro_type_script_index_0_lang.ClLv70z8.js`
- `public/_astro/GlobalApp.vK8XqYB9.js`
- `public/_astro/ScrollTrigger.6qCihK2t.js`
- Other files in `public/_astro/`
- `dist/`

These files encode the legacy Astro runtime, WebGL setup, GSAP/ScrollTrigger behavior, and compiled styling. Any modification can cause selector, animation, or rendering regressions.
