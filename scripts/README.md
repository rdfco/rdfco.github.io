# Scripts

Grouped by what they are for. Everything is run through an npm script; nothing
here is meant to be invoked by a path you have to remember.

## `validate/`

Source-integrity gates. They read the repository, need no browser and no server,
and every one of them runs as part of `npm run verify`.

| Script | npm script | Checks |
| --- | --- | --- |
| `validate-asset-registry.mjs` | `assets:validate` | every public asset is registered, and every registered asset exists |
| `validate-content-boundaries.mjs` | `content:validate` | every owned content source is declared and present |
| `validate-theme-tokens.mjs` | `theme:validate` | no raw colour literal outside the token file |
| `audit-runtime.mjs` | `audit:runtime` | no external URLs in runtime sources |
| `verify-public-bundles.mjs` | `public:bundles` | `public/` and `dist/` bundles are in sync |
| `check-bundle-budget.mjs` | `check:bundle` | the shipped bundle is within budget |
| `verify-brand-safety.mjs` | runs at the end of `build` | the retired brand is absent from `dist/` |

## `browser/`

Puppeteer gates. They drive a real Chrome against a running server, so start one
first and point `SITE_URL` at it if it is not on the script's default port.

| Script | npm script |
| --- | --- |
| `verify-navigation.mjs` + `browser-check.mjs` | `browser:contract` |
| `verify-home-lifecycle.mjs` | `browser:home-lifecycle` |
| `verify-menu-performance.mjs` | `browser:menu-performance` |
| `verify-responsive-interactions.mjs` | `browser:responsive-interactions` |
| `verify-network.mjs` | `browser:network` |

`verify-legal-navigation.mjs`, `verify-background-colors.mjs` and
`navigation-reveal.spec.mjs` are run by hand when their area changes.

## `visual/`

Screenshot and performance baselines: `visual:baseline`, `visual:compare`,
`visual:contract`, `baseline:performance`. Their output belongs outside the
repository.

## `build/`

`rebuild-customizer.mjs` re-bundles the legacy runtime on its own, without a
full `vite build`. The build itself does this from `vite.config.js`.

## `archive/`

One-off probes kept for reference. Nothing runs them, and nothing should
depend on them.
