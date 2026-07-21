# M13 automated architecture enforcement

## Outcome

The dependency rules documented in `docs/architecture/dependency-rules.md` are now
an executable contract. `npm run architecture:validate` checks runtime modules for
forbidden ownership direction, Legacy leakage into Native, internal cross-feature
imports, circular dependencies, and new global DOM mutation/query patterns.

The validator runs inside `npm run verify`, so architecture regressions block the
same pipeline as TypeScript, lint, tests, runtime audits, production build, bundle
budget, and brand safety.

## Browser enforcement

`npm run browser:contract` runs the navigation and responsive interaction contracts
against the built Production shell. Both scripts locate the Legacy iframe explicitly,
fail on browser/runtime errors, and create no screenshots in the repository.

## Ownership correction

`SiteFooter` is presentation-only and receives business content through props from
`NativeApp`. `LegacySite` remains an explicit compatibility boundary until the
approved production cutover milestone.

## Rollback

Revert the M13 commit. This removes the new enforcement command and restores the
previous Footer composition without changing public routing, assets, or scene output.
