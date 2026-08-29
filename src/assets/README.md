# src/assets

The registry of every file under `public/assets`, and the named API the site's
own code uses to reach them.

| File | Purpose |
| --- | --- |
| `asset-registry.json` | one record per physical asset: what it is, who owns it, who consumes it, where it came from, and whether its path is a contract |
| `asset.types.ts` | the shape of a record |
| `asset-registry.ts` | loads the registry and indexes it by id and by path |
| `catalog.ts` | grouped, named constants for the assets our code loads |
| `index.ts` | the barrel everything else imports |

## Using an asset

Import the name, not the URL:

```js
import { brand, whoWeAreImages } from '../../assets'

logo.src = brand.markWhite
partner.src = whoWeAreImages.partners.itonics
```

`catalog.ts` resolves every name through the registry when the module loads, so
an id that does not exist throws immediately instead of becoming a missing
image on one route that nobody opens for a month. It also means a file can be
moved by editing its `path` in the registry alone.

Stylesheets cannot import from here, so `fonts.css` and `sections.css` still
write their URLs directly. `assets:validate` checks those references against
the registry, so they cannot drift either.

## Adding an asset

1. Put the file under `public/assets/`, in the folder its purpose belongs to —
   `brand/`, `icons/`, or `pages/<route>/`. See `public/assets/README.md`.
2. Add a record to `asset-registry.json`. Every field is required except
   `fallback`, and `provenance` should say where the file actually came from.
3. Set `placement` to `movable`. It is only `pinned` for assets the generated
   WebGL runtime addresses, and `assets:validate` recomputes it either way — if
   you guess wrong, the check tells you what it should be.
4. Add a name to `catalog.ts` if code will load it.

`npm run assets:validate` fails on an unregistered file, a registered file that
is missing, a duplicate id or path, an extension that does not match `kind`, a
`placement` that disagrees with the asset's real consumers, and any `/assets/…`
URL in source that is not registered.

## What `placement` means

`pinned` — a generated or protected file addresses this asset by URL. The path
is a runtime contract; moving the file breaks the scene at runtime rather than
at build time. 33 of the 67 assets are pinned, all of them WebGL inputs.

`movable` — only our own source names it, so it can be reorganised.
