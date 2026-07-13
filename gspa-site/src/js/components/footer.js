import { createElement, removeAstroScope } from '../core/dom.js'

export const renderFooter = footerData => {
  const footer = document.querySelector('#footer')
  if (!footer) return
  footer.innerHTML = ''
  footer.className = 'fara-footer'

  const shell = createElement('div', { className: 'fara-footer-shell' })
  const heading = document.createElement('header')
  heading.innerHTML = `<p>${footerData.eyebrow}</p><h2>${footerData.title}</h2>`

  const grid = createElement('div', {
    className: 'fara-case-grid',
    attributes: { 'aria-label': footerData.title },
  })
  footerData.caseStudies.filter(entry => typeof entry === 'string' || entry.enabled !== false).forEach(entry => {
    const itemData = typeof entry === 'string' ? { name: entry, direction: 'rtl' } : entry
    const item = createElement('div', {
      className: 'fara-case-item',
      attributes: { dir: itemData.direction || 'rtl' },
    })
    item.appendChild(createElement('strong', { text: itemData.name }))
    grid.appendChild(item)
  })

  const bottom = createElement('div', { className: 'fara-footer-bottom' })
  const signature = createElement('div', { className: 'fara-footer-signature' })
  signature.innerHTML = `<strong>${footerData.eyebrow}</strong><span>${footerData.title}</span>`
  bottom.append(
    signature,
    createElement('p', { className: 'fara-footer-copyright', text: footerData.copyright }),
  )

  shell.append(heading, grid, bottom)
  footer.appendChild(shell)
  footer.removeAttribute('data-theme')
  removeAstroScope(footer)
}
