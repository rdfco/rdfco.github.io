# Gate E review — Not Approved

## Decision

**Not Approved.** M15 does not satisfy the Gate E question: Native is not visually,
behaviorally, and operationally equivalent enough for Production.

## Blocking findings

1. The Native hero is materially different from the M0 Production hero in scene
   composition, overlay, geometry, navigation styling, and hero placement.
2. Native document heights diverge by +1,852 px (Desktop), +2,152 px (Tablet), and
   +1,577 px (Mobile).
3. Native navigation sends public routes to the Legacy renderer because Native
   equivalents for those routes do not exist.

Browser errors are zero and Gate D performance remains acceptable; neither fact
overrides these parity failures.

## Consequence

M16 production cutover and M17 Legacy removal are locked. Keeping the Legacy shell
as Production preserves the approved result and remains the only safe rollback path.

## Re-entry criteria

Complete the corrective work listed in `M15-PARITY-AUDIT.md`, then run a new,
independent Gate E review. M17 additionally requires an actual stable Production
period after an approved M16 cutover; local validation cannot substitute for it.
