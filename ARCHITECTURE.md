# FARA Runtime Architecture

## Folder Structure

- `src/app`: React shell, routing, and error boundary.
- `src/features/legacy-site`: production iframe host for the legacy WebGL runtime.
- `src/site-customizer.js`: iframe-side route, content, scroll, and runtime refresh bridge.
- `src/navbar`: navigation data, routed page renderers, menu and navbar interaction lifecycle.
- `src/features/car-scene`: isolated React Three Fiber overlay feature, kept separate from the production legacy WebGL scene.
- `src/assets`: centralized registry for local models, textures, fonts, sounds, and environment assets.

## Rendering Pipeline

The React app renders `LegacySite`, which loads `/legacy/fort-energy/index.html` in a sandboxed iframe. The iframe imports copied runtime files from `src/` during dev and from `dist/src/` after build. Production visual behavior is still owned by the legacy runtime; React acts as the route shell and readiness gate.

## Navigation And Menu Flow

Navigation labels come from `src/navbar/navigation.js` and are applied through `src/js/navigation.js`. Menu and navbar interaction state is centralized in `src/navbar/navigation-events.js`.

The menu state machine prevents duplicate route requests and overlapping animations:

- `closed`: menu can open.
- `opening`: menu is entering the open state.
- `open`: menu links can request navigation.
- `closing`: close animation is running; repeated clicks are ignored.
- `revealing`: navbar items are revealing after close; opening is blocked.
- `navigating`: route message has been sent to the React shell.

Menu route clicks call the existing close animation first. Navigation is posted only after the close and navbar reveal lifecycle completes.

## Scroll And Camera Flow

The production WebGL scroll and camera logic remains inside the legacy runtime. React-side 3D overlay scroll sampling is isolated in `src/features/car-scene/scroll`, while camera presets and transitions live in `src/features/car-scene/camera` and `src/features/car-scene/config`.

## GSAP Flow

Legacy GSAP timelines remain in the legacy runtime and generated assets. Custom menu/navbar coordination uses CSS animation events in `src/navbar/navigation-events.js` so the app does not duplicate GSAP timeline code or guess route timing.

## Model Loading Pipeline

All asset paths must be registered in `src/assets/asset-registry.json`. Feature modules import assets by id through `src/assets`, then pass paths through local config. New models should be added to the registry first, then referenced from the owning feature config.

## Extending Chapters

Future chapters should add configuration before behavior:

- Register assets in `src/assets/asset-registry.json`.
- Add camera presets under the owning feature `camera/`.
- Add scroll ranges under `scroll/` or `config/scroll.js`.
- Add material and light presets under `materials/` and `lights/`.
- Keep debug helpers behind the feature debug flag.
