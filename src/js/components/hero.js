import { createElement } from '../core/dom.js'

const waitForGsap = () => new Promise(resolve => {
  const check = () => {
    if (window.__faraGsap) {
      resolve(window.__faraGsap)
      return
    }
    window.requestAnimationFrame(check)
  }
  check()
})

const setPhraseContent = (element, value) => {
  element.dataset.phrase = value
  element.textContent = value
}

const createHeroTitle = siteData => {
  const title = createElement('h1', { attributes: { 'aria-label': siteData.hero.title } })
  const fara = createElement('span', {
    className: 'fara-hero-title-word fara-hero-title-word-1',
    text: 'FARA',
    attributes: { 'aria-hidden': 'true' },
  })
  const phrase = createElement('span', {
    className: 'fara-hero-title-group',
    attributes: { 'aria-hidden': 'true' },
  })
  phrase.append(
    createElement('span', { className: 'fara-hero-title-word fara-hero-title-word-2', text: 'IS' }),
    createElement('span', { className: 'fara-hero-title-word fara-hero-title-word-3', text: 'IN' }),
  )
  title.append(fara, phrase)
  return title
}

const replaceWithImage = (current, source, alt, className) => {
  if (!current || !source) return false
  const image = createElement('img', {
    className: `logo configurable-logo ${className}`,
    attributes: { src: source, alt },
  })
  current.replaceWith(image)
  return true
}

export const renderHero = async siteData => {
  const gsap = await waitForGsap()
  document.querySelectorAll('.hero .logo').forEach(logo => {
    if (logo.classList.contains('fara-hero-copy') || logo.classList.contains('configurable-logo')) return
    const isMobile = logo.classList.contains('logo-mb')
    const source = isMobile ? siteData.brand.mobileLogo : siteData.brand.desktopLogo
    if (replaceWithImage(logo, source, siteData.brand.logoText, isMobile ? 'logo-mb' : 'logo-dk')) return

    const copy = createElement('div', { className: `${logo.className.baseVal || logo.className} fara-hero-copy` })
    const items = siteData.hero.items
    const phrase = createElement('span', {
      className: 'fara-hero-phrase',
      attributes: { 'aria-hidden': 'true' },
    })
    setPhraseContent(phrase, items[0])
    copy.append(createHeroTitle(siteData), phrase)
    logo.replaceWith(copy)

    const timeline = gsap.timeline({ repeat: -1 })
    items.slice(1).concat(items[0]).forEach((item, index) => {
      timeline.to(phrase, {
        autoAlpha: 0,
        yPercent: -18,
        duration: 0.7,
        ease: 'power2.inOut',
      }, index === 0 ? 2 : '+=2')
      timeline.set(phrase, { yPercent: 18 })
      timeline.call(() => setPhraseContent(phrase, item))
      timeline.to(phrase, {
        autoAlpha: 1,
        yPercent: 0,
        duration: 0.7,
        ease: 'power2.out',
      })
    })
    copy.faraHeroTimeline = timeline
  })
}
