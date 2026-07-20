# M11 review — Material and Shader Boundaries

- Status: Complete
- Date: 2026-07-20

The recovered FARA materials are now scene-owned, while reusable ShaderMaterial
construction is exposed by the shared material boundary. A typed manifest records all
seven active recovered shader pairs, and the previous material import remains an adapter.

Full verification, material/shader boundary validation, build, bundle budget, and
temporary Production/Native browser captures at desktop, tablet, and mobile passed with
zero runtime errors. All temporary screenshots were removed after validation.
