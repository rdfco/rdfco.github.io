/**
 * Phase 1 boundary: the mirrored Astro document owns its own DOM and runtime.
 * Do not add markup inside this component or manipulate the frame document.
 */
export default function LegacySite() {
  const updateFooter = document => {
    const footer = document?.querySelector('#footer')
    if (!footer) return

    // Preserve the legacy footer DOM and selectors while removing the retired brand menu.
    const brandMenu = footer.querySelector('.menu-links')
    brandMenu?.replaceChildren()

    const logo = footer.querySelector('.legal-info-container .logo')
    if (logo?.tagName.toLowerCase() === 'svg') {
      logo.replaceChildren()
      logo.setAttribute('viewBox', '0 0 667 80')
      logo.setAttribute('aria-label', 'FARA')

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      label.setAttribute('x', '0')
      label.setAttribute('y', '58')
      label.setAttribute('fill', '#2D628C')
      label.setAttribute('font-family', 'Century Gothic, Arial, sans-serif')
      label.setAttribute('font-size', '52')
      label.setAttribute('letter-spacing', '12')
      label.textContent = 'FARA'
      logo.append(label)
    }

    const copyright = footer.querySelector('.copyright-info p')
    if (copyright) copyright.textContent = '© 2026 | FARA - All rights reserved'
  }

  const onLoad = event => {
    const frameDocument = event.currentTarget.contentDocument
    if (!frameDocument) return
    updateFooter(frameDocument)
    // The legacy page applies its existing content customizer after load.
    // Re-apply only the requested footer changes after that work completes.
    frameDocument.defaultView?.setTimeout(() => updateFooter(frameDocument), 1000)
  }

  return (
    <iframe
      className="legacy-site"
      title="Fort Energy"
      src="/legacy/fort-energy/index.html"
      onLoad={onLoad}
    />
  )
}
