# Development

Run `npm run dev` for local work and `npm run verify` before every push. `verify` performs typecheck, lint, unit tests, native-boundary checks and production build.

Content belongs in `src/data`; never hard-code business copy into scene code. New UI belongs in a component or section and must not use `innerHTML` or global DOM selectors. Add assets to the registry with ownership status before importing them.

The stable production rollback is tagged `rollback-stable-fara-2026-07-15`. Migration work stays on `migration/react-native-architecture` until visual approval.
