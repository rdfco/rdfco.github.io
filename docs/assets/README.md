# Asset governance

## Source of truth

`src/assets/asset-registry.json` is the canonical inventory for every file served from
`public/assets` and for the root favicon. `src/assets/asset-registry.ts` adds typed
lookup helpers. `src/data/assetRegistry.ts` is a compatibility adapter for existing
scene consumers; it is not a second registry.

The registry records stable identity, public path, kind, runtime scope, lifecycle,
preload policy, owner, known consumers, provenance, approval, and fallback.

## Current inventory

- 51 physical runtime files: 15 models, 15 textures/environments, 19 fonts, 1 audio, 1 image.
- No binary file or public URL was relocated in M3.
- `docs/generated/asset-inventory.json` records exact file sizes and classifications.
- `npm run assets:validate` fails on duplicate IDs/paths, missing files, unregistered
  files, invalid metadata, kind/extension mismatches, or unregistered source references.

## Naming and placement

- Use lowercase kebab-case for new files and IDs.
- Group scene-owned models and baked textures under their scene/domain folder.
- Put cross-scene textures directly under `textures`; put brand fonts under `fonts`.
- Public paths are compatibility contracts. Renaming or moving one requires a separate
  migration with consumer search, redirect/fallback review, and browser validation.
- IDs describe purpose, not implementation details: `model-fara-hero`, not `glb-01`.

## Lifecycle

- `active`: intentionally consumed by the native/shared runtime.
- `legacy-protected`: required by the preserved legacy runtime or retained until its
  consumer is migrated and independently verified.
- `approved`, `review-required`, and `rejected` describe provenance approval. Approval
  is explicit; it is never inferred from file presence.

## Add, replace, and remove workflow

1. Add or replace the physical file without changing an existing public path silently.
2. Add/update its single registry record, including owner, consumers, and provenance.
3. Run `npm run assets:validate` and `npm run assets:inventory`.
4. Run the complete `npm run verify` pipeline and the relevant browser contract.
5. Remove an asset only after source and legacy-runtime consumers are proven absent.

## Known legacy debt

Generated legacy CSS references font variants that are not present in the repository
(additional Josefin Sans and Century Gothic italic variants). M3 does not invent,
download, or register nonexistent files. These dangling legacy references remain
documented debt and must be resolved inside a legacy-runtime migration milestone.
