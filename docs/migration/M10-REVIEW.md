# M10 review — Camera Runtime and Path Extraction

- Status: Complete
- Date: 2026-07-20

Camera-path extraction and normalized scroll progress now live behind the public camera
boundary. FARA-specific path names, visibility thresholds, and progress ranges are
explicit scene configuration, while `FaraCameraRig` exclusively owns frame updates.

Full verification, camera boundary validation, build, bundle budget, and temporary
Production/Native browser captures at desktop, tablet, and mobile passed with zero
runtime errors. All temporary screenshots were removed after validation.
