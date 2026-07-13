import { createElement } from '../core/dom.js'

const appendOptionalMedia = (card, media) => {
  if (!media?.src) return
  const image = createElement('img', {
    className: 'fara-card-media',
    attributes: { src: media.src, alt: media.alt || '', loading: media.loading || 'lazy' },
  })
  card.appendChild(image)
}

export const createCard = ({ title, text, media }, { modifier = '', expandable = true } = {}) => {
  const card = createElement('article', { className: `fara-card ${modifier}`.trim() })
  const heading = createElement('h3', { text: title })
  const copy = createElement('p', { text })
  card.classList.toggle('is-static', !expandable)

  appendOptionalMedia(card, media)
  card.append(heading, copy)
  if (!expandable) return card

  const button = createElement('button', {
    className: 'fara-expand',
    attributes: {
      type: 'button',
      'aria-label': `Read more about ${title}`,
      'aria-expanded': 'false',
    },
  })
  button.innerHTML = '<span></span>'
  button.addEventListener('click', () => {
    const expanded = card.classList.toggle('expanded')
    const lineHeight = Number.parseFloat(getComputedStyle(copy).lineHeight) || 27
    const collapsedHeight = lineHeight * 4
    copy.style.maxHeight = `${expanded ? copy.scrollHeight : collapsedHeight}px`
    button.setAttribute('aria-expanded', String(expanded))
  })
  card.appendChild(button)
  return card
}
