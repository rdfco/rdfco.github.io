export const setText = (selector, value, index = 0) => {
  const element = document.querySelectorAll(selector)[index]
  if (element && value) element.textContent = value
}

export const createElement = (tagName, { className, text, attributes = {} } = {}) => {
  const element = document.createElement(tagName)
  if (className) element.className = className
  if (text != null) element.textContent = text
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value))
  return element
}

export const removeAstroScope = element => {
  if (!element) return
  ;[...element.attributes].forEach(attribute => {
    if (attribute.name.startsWith('data-astro-cid-')) element.removeAttribute(attribute.name)
  })
}
