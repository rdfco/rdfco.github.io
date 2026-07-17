import { createElement } from '../core/dom.js'

const replaceWithImage = (current, source, alt, className) => {
  if (!current || !source) return false
  const image = createElement('img', {
    className: `logo configurable-logo ${className}`,
    attributes: { src: source, alt },
  })
  current.replaceWith(image)
  return true
}

export const renderHero = siteData => {
  document.querySelectorAll('.hero .logo').forEach(logo => {
    if (logo.classList.contains('fara-hero-copy') || logo.classList.contains('configurable-logo')) return
    const isMobile = logo.classList.contains('logo-mb')
    const source = isMobile ? siteData.brand.mobileLogo : siteData.brand.desktopLogo
    if (replaceWithImage(logo, source, siteData.brand.logoText, isMobile ? 'logo-mb' : 'logo-dk')) return

    const copy = createElement('div', { className: `${logo.className.baseVal || logo.className} fara-hero-copy` })
    const title = createElement('h1', { attributes: { 'aria-label': siteData.hero.title } })
    ;['FARA', 'IS', 'IN'].forEach((word, index) => {
      title.append(createElement('span', {
        className: `fara-hero-word fara-hero-word-${index + 1}`,
        text: word,
        attributes: { 'aria-hidden': 'true' },
      }))
    })
    copy.append(title, createElement('p', { text: siteData.hero.subtitle }))
    logo.replaceWith(copy)
  })
}
