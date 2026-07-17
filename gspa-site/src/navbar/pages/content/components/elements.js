export const create = (document, tag, className, text) => {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

export const createFaraMark = (document, label) => {
  const mark = create(document, 'div', 'fara-news-mark')
  mark.setAttribute('aria-label', `FARA placeholder visual ${label}`)
  mark.innerHTML = `<span>FARA</span><strong>${label}</strong><i aria-hidden="true"></i>`
  return mark
}
