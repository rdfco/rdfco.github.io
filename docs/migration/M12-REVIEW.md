# M12 review — GSAP and Animation Boundaries

- Status: Complete
- Date: 2026-07-20

GSAP and ScrollTrigger registration now belong to the shared animation runtime. The
home reveal preset and lifecycle are feature-owned, and `NativeApp` only activates the
feature through its public API. All existing reveal values and cleanup behavior remain
unchanged.

Full verification, animation boundary validation, build, bundle budget, and temporary
Production/Native browser captures at desktop, tablet, and mobile passed with zero
runtime errors. All temporary screenshots were removed after validation.
