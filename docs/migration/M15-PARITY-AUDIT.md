# M15 native parity audit

## Result

**Not complete.** Native Preview is healthy as an independently owned React/R3F
experience, but it is not yet equivalent to the protected Production visual oracle.
This audit records the exact blockers rather than redefining the M0 contract.

## Evidence captured

Production and Native were captured from the current build at Desktop (1440x900),
Tablet (768x1024), and Mobile (390x844). Five Native scroll checkpoints and six
Production checkpoints, including the open menu, were rendered under ignored
`work/m15/` evidence only. Both capture runs completed with zero browser errors.

Manual visual review at the Desktop hero checkpoint found a material scene mismatch:
Native has a gray diagonal overlay, different background/geometry composition,
different hero placement, and different navigation styling from Production. This is
not a pixel-level or compositional match and blocks public cutover.

## Measured blockers

| Contract | Production height | Native height | Delta |
|---|---:|---:|---:|
| Desktop | 7,678 | 9,530 | +1,852 px |
| Tablet | 8,453 | 10,605 | +2,152 px |
| Mobile | 8,794 | 10,371 | +1,577 px |

The height differences exceed the M0 layout contract at every fixed viewport.

Native navigation also links public labels such as `/knowing-fara` and `/solution`
to routes that are still owned by `LegacyPage`. No Native equivalents exist for those
public pages, so a user leaves the Native renderer after navigation. This blocks both
behavioral parity and independent Native route ownership.

## Passing observations

- Native Desktop, Tablet, and Mobile visual/runtime captures had zero browser errors.
- M13 architecture enforcement, M14 quality selection, bundle budget, and runtime
  audit remain passing from Gate D.
- Native performance remains within the Gate D measured budget, but performance alone
  cannot approve visual or behavioral parity.

## Required work before another Gate E review

1. Recreate the Production hero camera, geometry, material, shader, and layout result
   in the Native scene at all fixed viewports.
2. Align Native section, Footer, navigation, open-menu, hover, and responsive layout
   contracts with Production.
3. Provide Native-owned equivalents for every public Production route or an approved
   route strategy that preserves the exact public behavior.
4. Run fresh visual diffs against M0 at all checkpoints and fixed viewports, then
   repeat browser, performance, and production-build validation.
