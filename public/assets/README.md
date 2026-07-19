# Runtime assets

Files fetched by public URL. Binary placement is organized by asset type and, where useful, owning scene/domain. Typed identity, provenance, lifecycle, and loading policy belong in `src/assets` or `src/three/models`.

Existing paths remain stable. The complete ownership and provenance registry is
`src/assets/asset-registry.json`; governance and replacement rules are documented in
`docs/assets/README.md`. Do not add an asset here without adding its registry record.
