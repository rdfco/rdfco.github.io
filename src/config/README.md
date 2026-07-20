# Configuration

Intentional application, environment, route, feature, and Legacy-shell settings.
`app-config.ts` is the typed application configuration boundary and `index.ts` is its
public API.

Scene-specific camera, transform, material, lighting, and animation settings remain
colocated with their scenes and are handled by M5 and the later scene milestones.
Visible copy does not belong here; it belongs in `src/content`.
