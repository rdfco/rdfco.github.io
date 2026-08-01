import { createElement } from '../core/dom.js'

const appendOptionalMedia = (card, media) => {
  if (!media?.src) return
  const image = createElement('img', {
    className: 'fara-card-media',
    attributes: { src: media.src, alt: media.alt || '', loading: media.loading || 'lazy' },
  })
  card.appendChild(image)
}

export const createCard = ({ title, text, media, buttonText = 'Read more about' }, { modifier = '', expandable = true, collapsedLines = 4 } = {}) => {
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
      'aria-label': `${buttonText} ${title}`,
      'aria-expanded': 'false',
    },
  })
  button.innerHTML = '<span></span>'
  const collapsedHeight = () => {
    const lineHeight = Number.parseFloat(getComputedStyle(copy).lineHeight) || 27
    return Math.min(copy.scrollHeight, lineHeight * collapsedLines)
  }
  window.requestAnimationFrame(() => {
    if (card.isConnected) copy.style.height = `${collapsedHeight()}px`
  })
  button.addEventListener('click', () => {
    const expanded = !card.classList.contains('expanded')
    const currentHeight = copy.getBoundingClientRect().height
    const targetHeight = expanded ? copy.scrollHeight : collapsedHeight()
    copy.style.height = `${currentHeight}px`
    void copy.offsetHeight
    card.classList.toggle('expanded', expanded)
    button.setAttribute('aria-expanded', String(expanded))
    window.requestAnimationFrame(() => { copy.style.height = `${targetHeight}px` })
  })
  card.appendChild(button)
  return card
}
