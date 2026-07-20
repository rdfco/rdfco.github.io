# Three.js and R3F

The shared Native 3D subsystem. R3F owns Canvas and scene lifecycle; React page code
consumes its public API rather than renderer internals.

M5 establishes the shared Canvas boundary, immutable active runtime configuration,
quality-tier contracts, and cross-domain types. The current FARA scene composition,
camera path, materials, and shaders remain under `src/native` and `src/scenes` until
their approved M8–M12 milestones.

Shared modules must not import page content, UI components, routes, Legacy adapters,
scene implementations, or browser/DOM state.
