# Theme settings

Everything that decides how the site looks is set in one of two files. They are
split because they are read by two different runtimes, not because the colours
belong to different systems.

| File | Controls | Read by |
| --- | --- | --- |
| `src/config/theme/color-tokens.css` | every DOM colour and the display font | the parent shell and the legacy iframe stylesheet |
| `public/theme/background-colors.js` | every WebGL scene colour and its brightness | the generated WebGL runtime, before React boots |

## Changing a DOM colour

Edit the value in `color-tokens.css` and rebuild. Nothing else needs to change:
every stylesheet references the token rather than the literal, which
`npm run theme:validate` enforces — a raw `#rrggbb` or `rgb(...)` anywhere under
`src/**/*.css` outside this file fails the build.

Colours that need a second alpha are declared twice, once as a hex token and
once as a bare channel triplet, so they can be reused as
`rgba(var(--fara-brand-rgb), .34)`.

## Changing a WebGL colour

Edit `public/theme/background-colors.js`. It stays in `public/` on purpose: the
generated WebGL runtime reads `window.FARA_BACKGROUND_COLORS`, and the script
has to be served from the stable `/theme/background-colors.js` URL and execute before
React mounts. Moving it would change a runtime contract.

## The shared colour

The emerald `#37b478` appears in both files — as `--fara-emerald` here and as
`skyLight` / `mountain` / `hologram` and friends there. There is no mechanism
that keeps them in step, so change both when you change the brand green.
