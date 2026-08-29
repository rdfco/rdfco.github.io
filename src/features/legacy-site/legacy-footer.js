import { content } from '../../content'

// The footer inside the legacy document still carries its own menu links and a
// logo from the previous brand. Both are replaced here every time the frame
// loads, and once more after the legacy scripts have finished with it.
export const updateFooter = document => {
  const footer = document?.querySelector('#footer')
  if (!footer) return
  footer.querySelector('.menu-links')?.replaceChildren()
  const logo = footer.querySelector('.legal-info-container .logo')
  if (logo?.tagName.toLowerCase() === 'svg') {
    logo.replaceChildren()
    logo.setAttribute('viewBox', '0 0 667 80')
    logo.setAttribute('aria-label', content.brand.logoText)
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    label.setAttribute('x', '0')
    label.setAttribute('y', '58')
    label.setAttribute('fill', '#2D628C')
    label.setAttribute('font-family', 'FARA Gotham')
    label.setAttribute('font-size', '52')
    label.setAttribute('letter-spacing', '12')
    label.textContent = content.brand.logoText
    logo.append(label)
  }
  const copyright = footer.querySelector('.copyright-info p')
  if (copyright) copyright.textContent = content.footer.copyright
}
