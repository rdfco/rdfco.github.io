# FARA migration gates

Migration is milestone-driven and gate-approved. Complete and validate one milestone at a time; approve a gate only after every milestone in that phase passes independently.

## Permanent safety boundary

- Production public routes remain on `LegacySite` through M15.
- Native work remains on `/native-preview` through M15.
- M16 switches production with an intact Legacy failback.
- M17 removes Legacy only after a stable production period and explicit removal approval.

## Gates

| Gate | Required milestones | Approval question |
|---|---|---|
| Gate A | M0, M1, M2 | Are baseline, documentation, ownership rules, and target skeleton trustworthy? |
| Gate B | M3, M4, M5 | Are asset, content, and configuration sources predictable and validated? |
| Gate C | M6–M12 | Are app, feature, scene, model, camera, material, shader, and GSAP boundaries complete without parity loss? |
| Gate D | M13, M14 | Are automated enforcement and measured performance acceptable? |
| Gate E | M15 | Is Native visually, behaviorally, operationally, and performance-equivalent enough for production? |

## Current progress

Gate A and Gate B are approved. See `migration/REFACTORING-STATUS.md` and the
corresponding gate review packages. Gate C remains locked until M6–M12 pass
independently.

## Rollback principle

Each milestone is an independent change. A failed milestone returns to the previous validated milestone; it does not redefine the M0 baseline. Baseline replacement requires explicit approval and its own recorded reason.
