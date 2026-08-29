import { createElement } from '../core/dom.js'

const setPhraseContent = (element, value) => {
  element.dataset.phrase = value
  element.textContent = value
}

const animatePhraseFallback = (phraseWrap, phrase, items) => {
  let index = 0
  phraseWrap.style.transition = 'opacity 700ms ease, transform 700ms ease'
  window.setInterval(() => {
    phraseWrap.style.opacity = '0'
    phraseWrap.style.transform = 'translate3d(0, -18%, 0)'
    window.setTimeout(() => {
      index = (index + 1) % items.length
      setPhraseContent(phrase, items[index])
      phraseWrap.style.transform = 'translate3d(0, 18%, 0)'
      window.requestAnimationFrame(() => {
        phraseWrap.style.opacity = '1'
        phraseWrap.style.transform = 'translate3d(0, 0, 0)'
      })
    }, 700)
  }, 3400)
}

const createHeroBrandLockup = () => {
  const lockup = createElement('div', {
    className: 'fara-hero-brand-lockup',
    attributes: { 'aria-label': 'FARA IS IN' },
  })
  const logo = createElement('img', {
    className: 'fara-hero-brand-logo',
    attributes: {
      src: '/assets/logos/fara-logo0-white.svg',
      alt: '',
      'aria-hidden': 'true',
    },
  })
  lockup.append(
    logo,
    createElement('span', { className: 'fara-hero-brand-divider', attributes: { 'aria-hidden': 'true' } }),
    createElement('span', { className: 'fara-hero-brand-text', text: 'FARA IS IN' }),
  )
  return lockup
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
  document.querySelectorAll('.hero .logo').forEach(logo => {
    if (logo.classList.contains('fara-hero-copy') || logo.classList.contains('configurable-logo')) return
    const isMobile = logo.classList.contains('logo-mb')
    const source = isMobile ? siteData.brand.mobileLogo : siteData.brand.desktopLogo
    if (replaceWithImage(logo, source, siteData.brand.logoText, isMobile ? 'logo-mb' : 'logo-dk')) return

    const copy = createElement('div', { className: `${logo.className.baseVal || logo.className} fara-hero-copy` })
    const items = siteData.hero.items
    const phraseWrap = createElement('span', {
      className: 'fara-hero-phrase-wrap',
      attributes: { 'aria-hidden': 'true' },
    })
    const phrase = createElement('span', {
      className: 'fara-hero-phrase',
    })
    setPhraseContent(phrase, items[0])
    phraseWrap.append(
      phrase,
      createElement('span', { className: 'fara-hero-phrase-rule', attributes: { 'aria-hidden': 'true' } }),
    )
    copy.append(createHeroBrandLockup(), phraseWrap)
    logo.replaceWith(copy)

    const gsap = window.__faraGsap
    if (gsap) {
      const timeline = gsap.timeline({ repeat: -1 })
      items.slice(1).concat(items[0]).forEach((item, index) => {
        timeline.to(phraseWrap, {
          autoAlpha: 0,
          yPercent: -18,
          duration: 0.7,
          ease: 'power2.inOut',
        }, index === 0 ? 2 : '+=2')
        timeline.set(phraseWrap, { yPercent: 18 })
        timeline.call(() => setPhraseContent(phrase, item))
        timeline.to(phraseWrap, {
          autoAlpha: 1,
          yPercent: 0,
          duration: 0.7,
          ease: 'power2.out',
        })
      })
      copy.faraHeroTimeline = timeline
    } else {
      animatePhraseFallback(phraseWrap, phrase, items)
    }
  })
}
