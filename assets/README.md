# public/assets/

Every file here is served at `/assets/…`, so its path is its URL. Some of those
URLs are ours to change and some are not, and the folders are arranged so you
can tell which is which at a glance.

## What we own — reorganise freely

| Folder | Holds |
| --- | --- |
| `brand/` | the FARA marks, the wordmark and the favicon |
| `icons/` | standalone UI icons |
| `pages/<route>/` | images that belong to one route and nothing else |
| `fonts/gotham/` | the Gotham family the site's own CSS declares |

These are named only by our own source, so moving or renaming one is a normal
change: update the path in `src/assets/asset-registry.json` and the code picks
it up, because code refers to them through `src/assets` rather than by URL.

## What the WebGL runtime owns — do not move or rename

| Folder | Holds |
| --- | --- |
| `models/` | the `.glb` scenes for every chapter |
| `textures/` | lightmaps, noise, normals and the `.exr` environment |
| `sounds/` | the interface sound |
| `fonts/*.woff2` | Century Gothic and Josefin Sans, at the top level |

The generated bundles under `public/_astro/` load these by their exact URLs, and
those bundles are not ours to rewrite. Moving one of these files does not break
the build — it breaks the scene at runtime, with a 404 and a black frame.

## How that line is kept honest

Every record in `src/assets/asset-registry.json` carries a `placement` of
`pinned` or `movable`. It is not maintained by hand: `npm run assets:validate`
recomputes it from which files actually name the asset, and fails if the
registry disagrees. So if the generated runtime ever changes, or a pinned file
is moved, you find out at build time rather than on a black home page.

The same check fails on any file here that is not registered, and on any
registered path that is missing.
