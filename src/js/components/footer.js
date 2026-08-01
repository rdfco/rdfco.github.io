import { createElement, removeAstroScope } from '../core/dom.js'

const createIcon = (className, pathData) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('aria-hidden', 'true')
  svg.classList.add(className)
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', pathData)
  svg.appendChild(path)
  return svg
}

const createRouteLink = ({ label, href }) => createElement('a', {
  text: label,
  attributes: { href: '#', 'data-fara-route': href },
})

export const renderFooter = siteData => {
  const footer = document.querySelector('#footer')
  if (!footer) return

  footer.replaceChildren()
  footer.className = 'fara-footer'

  const shell = createElement('div', { className: 'fara-footer-shell' })
  const navigation = createElement('nav', {
    className: 'fara-footer-navigation',
    attributes: { 'aria-label': 'Footer navigation' },
  })
  const home = createRouteLink(siteData.navigation[0])
  home.className = 'fara-footer-home'
  home.setAttribute('aria-label', 'Home')
  home.replaceChildren(createIcon('fara-footer-home-icon', 'M3 10.8 12 3l9 7.8v9.7a.5.5 0 0 1-.5.5h-5.7v-6.6H9.2V21H3.5a.5.5 0 0 1-.5-.5v-9.7Z'))

  const primary = createElement('ul', { className: 'fara-footer-primary' })
  siteData.navigation.slice(1).forEach(item => {
    const listItem = document.createElement('li')
    listItem.appendChild(createRouteLink(item))
    primary.appendChild(listItem)
  })

  const legal = createElement('ul', { className: 'fara-footer-legal' })
  ;[
    { label: 'Privacy policy', href: '/privacy-policy' },
    { label: 'Terms of use', href: '/terms-of-use' },
  ].forEach(item => {
    const listItem = document.createElement('li')
    listItem.appendChild(createRouteLink(item))
    legal.appendChild(listItem)
  })
  navigation.append(home, primary, legal)

  const contact = createElement('address', { className: 'fara-footer-contact' })
  const call = createElement('div', { className: 'fara-footer-contact-block' })
  const callTitle = document.createElement('strong')
  callTitle.append(
    createIcon('fara-footer-phone-icon', 'M6.6 10.8c1.5 3 3.6 5.1 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.3.4 2.6.6 4 .6.7 0 1.2.5 1.2 1.2v3.5c0 .7-.5 1.2-1.2 1.2C10.7 21.4 2.6 13.3 2.6 3.4c0-.7.5-1.2 1.2-1.2h3.5c.7 0 1.2.5 1.2 1.2 0 1.4.2 2.7.6 4 .1.4 0 .9-.3 1.2l-2.2 2.2Z'),
    document.createTextNode('Call us:'),
  )
  call.append(
    callTitle,
    createElement('a', { text: siteData.footer.phone, attributes: { href: siteData.footer.phoneHref } }),
  )

  const visit = createElement('div', { className: 'fara-footer-contact-block' })
  visit.append(
    createElement('strong', { text: 'Visit us:' }),
    createElement('p', { text: siteData.footer.address }),
  )
  contact.append(call, visit)

  const bottom = createElement('div', { className: 'fara-footer-bottom' })
  bottom.append(
    createElement('strong', { className: 'fara-footer-wordmark', text: siteData.brand.logoText }),
    createElement('p', { className: 'fara-footer-copyright', text: siteData.footer.copyright }),
  )

  shell.append(navigation, contact, bottom)
  footer.appendChild(shell)
  footer.removeAttribute('data-theme')
  removeAstroScope(footer)
}
