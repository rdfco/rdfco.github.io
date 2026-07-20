# FARA architecture index

This file is the stable entry point for architecture documentation.

- `architecture/overview.md`: current runtime and target design.
- `architecture/target-folder-architecture.md`: complete destination tree and responsibility of each folder.
- `architecture/folder-ownership.md`: owners, allowed contents, and placement decisions.
- `architecture/dependency-rules.md`: allowed and forbidden dependency directions.
- `architecture/runtime-flows.md`: production, native, content, and rendering flows.
- `decisions/ADR-001-legacy-native-boundary.md`: decision to preserve Legacy until native parity and cutover approval.
- `WEBGL.md`: visual preservation requirements for camera, shaders, models, and animation.
- `baselines/m0/README.md`: measurable acceptance contract.

The target architecture is a migration destination, not a claim that those folders already exist. `PROJECT_MAP.md` remains the source of truth for the current filesystem until each milestone updates it.
