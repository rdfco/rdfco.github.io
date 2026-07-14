/**
 * Phase 1 boundary: the mirrored Astro document owns its own DOM and runtime.
 * Do not add markup inside this component or manipulate the frame document.
 */
export default function LegacySite() {
  return (
    <iframe
      className="legacy-site"
      title="Fort Energy"
      src="/legacy/fort-energy/index.html"
    />
  )
}
