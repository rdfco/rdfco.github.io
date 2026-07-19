# Development guide index

## Standard workflow

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run verify
```

Run commands from the repository root containing `package.json`. Use `npm.cmd` in PowerShell. For UI, iframe, WebGL, GSAP, routing, or asset work, verify real browser behavior in addition to the automated pipeline.

## Task guides

- `development/add-a-page.md`
- `development/add-a-scene.md`
- `development/add-a-model.md`
- `development/add-an-asset.md`

These guides describe the target workflow. Until the relevant migration milestone is complete, do not create missing target folders or bypass current adapters.

## Definition of done

- Scope is limited to one approved milestone.
- Production appearance and behavior match M0 unless a change was explicitly approved.
- Typecheck, lint, tests, native-boundary audit, runtime audit, build, brand-safety, and bundle budget pass.
- Browser behavior is checked at the affected routes and viewports.
- Documentation and registries affected by the change are updated.
- Rollback is possible without recovering unrelated changes.
